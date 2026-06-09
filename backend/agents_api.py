"""Internal HTTP API for Archie, Dexter, Pip, Sparky, Coach — secured with X-Agent-Secret."""

from __future__ import annotations

import json
import logging
import os
import uuid
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from supabase import create_client

from archie_agent import build_certifications_bundle, revise_roadmap_bundle
from archie_tavily_enrich import enrich_archie_bundle_with_tavily
from coach_agent import coach_turn
from dexter_agent import fetch_resources_auto
from pip_agent import (
    build_checkpoint_assessment,
    build_quiz,
    build_revision_pack,
    grade_checkpoint_assessment,
    grade_quiz,
)
from roadmap_worker import ARCHIE_GENERATE_MESSAGE_TYPE, process_archie_generate_message

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/internal/agents", tags=["agents"])

_settings: Any = None
_cached_agent_secret: str = ""
_sqs_client: Any | None = None
_skillcrew_queue_url_cached: str | None = None


def init_agents(settings: Any, boto3_session: Any | None = None) -> None:
    global _settings, _cached_agent_secret, _sqs_client, _skillcrew_queue_url_cached
    _settings = settings
    _skillcrew_queue_url_cached = None
    _sqs_client = None
    _cached_agent_secret = (
        (getattr(settings, "backend_agent_secret", None) or "").strip()
        or (os.environ.get("BACKEND_AGENT_SECRET") or "").strip()
    )
    if not _cached_agent_secret:
        env_path = Path(__file__).resolve().parent / ".env"
        load_dotenv(env_path, override=True)
        _cached_agent_secret = (os.environ.get("BACKEND_AGENT_SECRET") or "").strip()
    if boto3_session is not None:
        try:
            _sqs_client = boto3_session.client("sqs")
        except Exception:
            logger.exception("failed to initialize SQS client from boto session")
            _sqs_client = None


def _s() -> Any:
    if _settings is None:
        raise RuntimeError("agents not initialized")
    return _settings


def _resolved_agent_secret() -> str:
    """Prefer cached value from init_agents; then settings; then OS env (handles reload quirks)."""
    global _cached_agent_secret
    if _cached_agent_secret:
        return _cached_agent_secret
    s = _s()
    from_settings = (getattr(s, "backend_agent_secret", None) or "").strip()
    if from_settings:
        _cached_agent_secret = from_settings
        return from_settings
    env_secret = (os.environ.get("BACKEND_AGENT_SECRET") or "").strip()
    if env_secret:
        _cached_agent_secret = env_secret
        return env_secret
    load_dotenv(Path(__file__).resolve().parent / ".env", override=True)
    env_secret = (os.environ.get("BACKEND_AGENT_SECRET") or "").strip()
    if env_secret:
        _cached_agent_secret = env_secret
    return env_secret


def verify_agent_secret(x_agent_secret: str | None = Header(default=None, alias="X-Agent-Secret")) -> None:
    expected = _resolved_agent_secret()
    if not expected:
        raise HTTPException(
            status_code=503,
            detail=(
                "BACKEND_AGENT_SECRET is not configured on the API server. "
                "Add it to backend/.env, restart uvicorn, and ensure it matches Next.js BACKEND_AGENT_SECRET."
            ),
        )
    if (x_agent_secret or "").strip() != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _llm_kw() -> dict[str, Any]:
    s = _s()
    return {
        "groq_api_key": getattr(s, "groq_api_key", None),
        "groq_model": getattr(s, "groq_model", "llama-3.3-70b-versatile"),
        "google_api_key": getattr(s, "google_api_key", None),
        "gemini_model": getattr(s, "gemini_model", "gemini-2.0-flash"),
    }


def _service_supabase() -> Any:
    """Service-role Supabase client for engagement jobs (same credentials as main API)."""
    s = _s()
    url = (
        (getattr(s, "supabase_project_url", None) or "").strip()
        or (os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or "").strip()
    )
    key = (getattr(s, "supabase_service_role_key", None) or os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "").strip()
    if not url or not key:
        raise HTTPException(
            status_code=503,
            detail="SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL are required for engagement digest.",
        )
    return create_client(url, key)


def _roadmap_queue_mode() -> str:
    raw = (getattr(_s(), "archie_roadmap_queue_mode", None) or os.environ.get("ARCHIE_ROADMAP_QUEUE_MODE") or "auto").strip().lower()
    if raw in ("sqs", "inline", "auto"):
        return raw
    return "auto"


def _resolve_skillcrew_queue_url() -> str | None:
    """Return queue URL or None if SQS is unavailable (does not raise)."""
    global _skillcrew_queue_url_cached
    if _skillcrew_queue_url_cached:
        return _skillcrew_queue_url_cached
    s = _s()
    explicit = (getattr(s, "sqs_skillcrew_task_queue_url", None) or "").strip()
    if explicit:
        _skillcrew_queue_url_cached = explicit
        return explicit
    if _sqs_client is None:
        return None
    name = (getattr(s, "sqs_skillcrew_task_queue_name", None) or "SkillCrew-Task-Queue").strip()
    try:
        out = _sqs_client.get_queue_url(QueueName=name)
    except Exception:
        logger.warning("GetQueueUrl failed for queue name %r", name, exc_info=True)
        return None
    url_raw = out.get("QueueUrl")
    if not url_raw:
        return None
    _skillcrew_queue_url_cached = str(url_raw).strip()
    return _skillcrew_queue_url_cached


def _skillcrew_task_queue_url() -> str:
    """Resolve SQS queue URL once (explicit env URL or boto3 GetQueueUrl by name)."""
    url = _resolve_skillcrew_queue_url()
    if url:
        return url
    if _sqs_client is None:
        raise HTTPException(
            status_code=503,
            detail="SQS is not initialized. Pass boto3_session into init_agents and configure AWS credentials.",
        )
    name = (getattr(_s(), "sqs_skillcrew_task_queue_name", None) or "SkillCrew-Task-Queue").strip()
    raise HTTPException(
        status_code=503,
        detail=(
            f"Could not resolve SQS queue URL for {name!r}. "
            "Check AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION, set SQS_SKILLCREW_TASK_QUEUE_URL, "
            "or set ARCHIE_ROADMAP_QUEUE_MODE=inline for local development."
        ),
    )


class RoadmapBody(BaseModel):
    context: dict[str, Any]
    user_id: str | None = None


def _worker_llm_kw() -> dict[str, Any]:
    s = _s()
    return {
        "groq_api_key": getattr(s, "groq_api_key", None),
        "groq_model": getattr(s, "groq_model", "llama-3.3-70b-versatile"),
        "google_api_key": getattr(s, "google_api_key", None),
        "gemini_model": getattr(s, "gemini_model", "gemini-2.0-flash"),
        "tavily_api_key": getattr(s, "tavily_api_key", None),
        "tavily_enrich_mode": getattr(s, "archie_tavily_enrich_mode", "fast"),
    }


def _run_roadmap_job_inline(job_id: str, context: dict[str, Any]) -> None:
    """Process roadmap generation in-process (local dev when SQS is unavailable)."""
    try:
        process_archie_generate_message(
            supabase=_service_supabase(),
            job_id=job_id,
            context=context,
            **_worker_llm_kw(),
        )
    except Exception:
        logger.exception("Inline roadmap generation failed job_id=%s", job_id)


def _try_enqueue_sqs(job_id: str, context: dict[str, Any]) -> bool:
    if _sqs_client is None:
        return False
    queue_url = _resolve_skillcrew_queue_url()
    if not queue_url:
        return False
    message = {
        "job_id": job_id,
        "type": ARCHIE_GENERATE_MESSAGE_TYPE,
        "context": context,
    }
    try:
        _sqs_client.send_message(QueueUrl=queue_url, MessageBody=json.dumps(message, default=str))
        return True
    except Exception:
        logger.warning("SQS send_message failed for job_id=%s", job_id, exc_info=True)
        return False


def _enqueue_generate_roadmap_job(body: RoadmapBody, background_tasks: BackgroundTasks) -> JSONResponse:
    sb = _service_supabase()
    job_uuid = uuid.uuid4()
    job_id = str(job_uuid)
    ctx = body.context if isinstance(body.context, dict) else {}
    uid = (body.user_id or "").strip() or None

    insert_row = {
        "job_id": job_id,
        "status": "processing",
        "context": ctx,
        "user_id": uid,
    }
    try:
        sb.table("roadmap_generation_jobs").insert(insert_row).execute()
    except Exception as e:
        logger.exception("Failed to insert roadmap_generation_jobs row")
        raise HTTPException(status_code=502, detail=f"Failed to enqueue job record: {e!s}") from e

    mode = _roadmap_queue_mode()

    if mode == "inline":
        logger.info("Running roadmap job inline job_id=%s", job_id)
        background_tasks.add_task(_run_roadmap_job_inline, job_id, ctx)
        return JSONResponse(status_code=202, content={"job_id": job_id})

    if mode == "sqs":
        if not _try_enqueue_sqs(job_id, ctx):
            try:
                sb.table("roadmap_generation_jobs").update(
                    {"status": "failed", "error_message": "sqs_enqueue_failed"[:8000]},
                ).eq("job_id", job_id).execute()
            except Exception:
                logger.exception("Failed to update job row after SQS failure")
            raise HTTPException(
                status_code=502,
                detail=(
                    "Failed to enqueue SQS message. Verify AWS credentials and queue configuration, "
                    "or set ARCHIE_ROADMAP_QUEUE_MODE=inline for local development."
                ),
            )
        return JSONResponse(status_code=202, content={"job_id": job_id})

    if _try_enqueue_sqs(job_id, ctx):
        logger.info("Enqueued roadmap job to SQS job_id=%s", job_id)
        return JSONResponse(status_code=202, content={"job_id": job_id})

    logger.info("SQS unavailable; running roadmap job inline job_id=%s", job_id)
    background_tasks.add_task(_run_roadmap_job_inline, job_id, ctx)
    return JSONResponse(status_code=202, content={"job_id": job_id})


class ReviseBody(BaseModel):
    current_bundle: dict[str, Any]
    adaptation_signals: dict[str, Any] = Field(default_factory=dict)
    learner_context: dict[str, Any]


class CertBody(BaseModel):
    context: dict[str, Any]


class DexterBody(BaseModel):
    modules: list[dict[str, Any]]
    max_results_per_module: int = 8


class PipQuizBody(BaseModel):
    topics_learned: list[str]
    difficulty: str = "intermediate"
    count: int = 5
    locale: str | None = None


class PipGradeBody(BaseModel):
    quiz: dict[str, Any]
    answers: dict[str, int]


class PipRevisionBody(BaseModel):
    topics: list[str]
    notes: str | None = None
    locale: str | None = None


class PipCheckpointBuildBody(BaseModel):
    topics_covered: list[str]
    preferences: dict[str, Any] = Field(default_factory=dict)
    locale: str | None = None
    question_count: int = 6
    roadmap_direction: str | None = None
    track_title: str | None = None
    roadmap_mode: str | None = None


class PipCheckpointGradeBody(BaseModel):
    assessment: dict[str, Any]
    answers: dict[str, Any]


class PipCheckpointEmailBody(BaseModel):
    to_email: str
    subject: str = "Your Pip quiz results"
    html: str


class SparkyComposeBody(BaseModel):
    state: dict[str, Any]


class SparkyDispatchBody(BaseModel):
    to_phone_e164: str
    to_email: str | None = None
    compose_state: dict[str, Any]
    use_whatsapp: bool = False
    use_voice: bool = False
    use_sms: bool = False
    use_email: bool = False


class DigestIfDueBody(BaseModel):
    user_id: str = Field(..., min_length=1)


class LoginWelcomeBody(BaseModel):
    user_id: str = Field(..., min_length=1)


class PipCheckpointWhatsAppBody(BaseModel):
    user_id: str = Field(..., min_length=1)
    roadmap_id: str = Field(..., min_length=1)
    milestone_id: str = Field(..., min_length=1)
    week: int = Field(..., ge=1)
    score_percent: float = Field(..., ge=0, le=100)
    roadmap_title: str | None = None
    roadmap_mode: str | None = None


class MilestoneModulesWhatsAppBody(BaseModel):
    user_id: str = Field(..., min_length=1)
    roadmap_id: str = Field(..., min_length=1)
    roadmap_mode: str = Field(..., min_length=1)
    nodes_completed: int = Field(..., ge=0)
    nodes_total: int = Field(..., ge=0)
    percent: int = Field(..., ge=0, le=100)
    milestone_title: str | None = None
    roadmap_display_title: str | None = None


class CoachBody(BaseModel):
    payload: dict[str, Any]


@router.post("/generate-roadmap", dependencies=[Depends(verify_agent_secret)])
@router.post("/archie/roadmap", dependencies=[Depends(verify_agent_secret)])
def enqueue_generate_archie_roadmap(body: RoadmapBody, background_tasks: BackgroundTasks) -> JSONResponse:
    """
    Queue Archie roadmap generation. Uses SQS when configured; otherwise runs inline in the API process (local dev).
    """
    return _enqueue_generate_roadmap_job(body, background_tasks)


@router.get("/archie/roadmap/jobs/{job_id}", dependencies=[Depends(verify_agent_secret)])
def roadmap_job_status(job_id: str) -> dict[str, Any]:
    jid = job_id.strip()
    if not jid:
        raise HTTPException(status_code=400, detail="job_id required")
    sb = _service_supabase()
    try:
        res = sb.table("roadmap_generation_jobs").select("job_id,status,result_bundle,error_message").eq(
            "job_id", jid
        ).limit(1).execute()
    except Exception as e:
        logger.exception("roadmap job status lookup failed")
        raise HTTPException(status_code=502, detail=str(e)) from e
    rows = getattr(res, "data", None) or []
    if not rows:
        raise HTTPException(status_code=404, detail="job not found")
    row = rows[0]
    out: dict[str, Any] = {
        "job_id": row.get("job_id"),
        "status": row.get("status"),
        "result_bundle": row.get("result_bundle"),
        "error_message": row.get("error_message"),
    }
    return out


@router.post("/archie/revise", dependencies=[Depends(verify_agent_secret)])
def archie_revise(body: ReviseBody) -> dict[str, Any]:
    try:
        bundle = revise_roadmap_bundle(
            **_llm_kw(),
            current_bundle=body.current_bundle,
            adaptation_signals=body.adaptation_signals,
            learner_context=body.learner_context,
        )
        tavily = getattr(_s(), "tavily_api_key", None)
        enrich_mode = getattr(_s(), "archie_tavily_enrich_mode", "fast")
        return enrich_archie_bundle_with_tavily(bundle, tavily, mode=enrich_mode)
    except Exception as e:
        logger.exception("archie revise")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/archie/certifications", dependencies=[Depends(verify_agent_secret)])
def archie_certs(body: CertBody) -> dict[str, Any]:
    try:
        return build_certifications_bundle(**_llm_kw(), context=body.context)
    except Exception as e:
        logger.exception("archie certs")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/dexter/resources", dependencies=[Depends(verify_agent_secret)])
def dexter_resources(body: DexterBody) -> dict[str, Any]:
    s = _s()
    try:
        return fetch_resources_auto(
            tavily_api_key=getattr(s, "tavily_api_key", None),
            apify_api_token=getattr(s, "apify_api_token", None),
            apify_google_actor=getattr(s, "apify_google_search_actor", "apify/google-search-scraper"),
            modules=body.modules,
            max_results_per_module=body.max_results_per_module,
        )
    except Exception as e:
        logger.exception("dexter")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/pip/quiz", dependencies=[Depends(verify_agent_secret)])
def pip_quiz(body: PipQuizBody) -> dict[str, Any]:
    try:
        return build_quiz(
            **_llm_kw(),
            topics_learned=body.topics_learned,
            difficulty=body.difficulty,
            count=body.count,
            locale=body.locale,
        )
    except Exception as e:
        logger.exception("pip quiz")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/pip/grade", dependencies=[Depends(verify_agent_secret)])
def pip_grade(body: PipGradeBody) -> dict[str, Any]:
    try:
        return grade_quiz(**_llm_kw(), quiz=body.quiz, answers=body.answers)
    except Exception as e:
        logger.exception("pip grade")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/pip/revision-pack", dependencies=[Depends(verify_agent_secret)])
def pip_revision(body: PipRevisionBody) -> dict[str, Any]:
    try:
        return build_revision_pack(
            **_llm_kw(),
            topics=body.topics,
            notes=body.notes,
            locale=body.locale,
        )
    except Exception as e:
        logger.exception("pip revision")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/pip/checkpoint/build", dependencies=[Depends(verify_agent_secret)])
def pip_checkpoint_build(body: PipCheckpointBuildBody) -> dict[str, Any]:
    try:
        return build_checkpoint_assessment(
            **_llm_kw(),
            topics_covered=body.topics_covered,
            preferences=body.preferences,
            locale=body.locale,
            question_count=body.question_count,
            roadmap_direction=body.roadmap_direction,
            track_title=body.track_title,
            roadmap_mode=body.roadmap_mode,
        )
    except Exception as e:
        logger.exception("pip checkpoint build")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/pip/checkpoint/grade", dependencies=[Depends(verify_agent_secret)])
def pip_checkpoint_grade(body: PipCheckpointGradeBody) -> dict[str, Any]:
    try:
        return grade_checkpoint_assessment(
            **_llm_kw(),
            assessment=body.assessment,
            answers=body.answers,
        )
    except Exception as e:
        logger.exception("pip checkpoint grade")
        raise HTTPException(status_code=502, detail=str(e)) from e


def _format_resend_api_error(response_text: str) -> str:
    """Turn Resend JSON errors into short, actionable messages for the UI."""
    raw = (response_text or "").strip()
    message = raw
    try:
        data = json.loads(raw)
        if isinstance(data, dict) and isinstance(data.get("message"), str):
            message = data["message"].strip()
    except json.JSONDecodeError:
        pass

    lower = message.lower()
    if "only send testing emails to your own email" in lower:
        return (
            f"{message} "
            "For local testing, set Settings → Email for quiz results to that address, "
            "or verify a domain at resend.com/domains and set RESEND_FROM_EMAIL in backend/.env."
        )
    if "verify a domain" in lower:
        return message
    return message or "Resend rejected the email request."


@router.post("/email/pip-checkpoint-summary", dependencies=[Depends(verify_agent_secret)])
def pip_checkpoint_email(body: PipCheckpointEmailBody) -> dict[str, Any]:
    """Send HTML summary email via Resend (RESEND_API_KEY in backend/.env)."""
    s = _s()
    key = (getattr(s, "resend_api_key", None) or "").strip()
    if not key:
        raise HTTPException(
            status_code=503,
            detail="RESEND_API_KEY is not configured on the API server (backend/.env).",
        )
    from_email = (getattr(s, "resend_from_email", None) or "onboarding@resend.dev").strip()
    to_email = body.to_email.strip()
    if not to_email or "@" not in to_email:
        raise HTTPException(status_code=400, detail="Invalid to_email")

    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": body.subject.strip()[:200] or "Your Pip quiz results",
        "html": body.html,
    }
    try:
        with httpx.Client(timeout=45.0) as client:
            r = client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
        if r.status_code >= 400:
            logger.warning("Resend error %s: %s", r.status_code, r.text[:500])
            raise HTTPException(status_code=502, detail=_format_resend_api_error(r.text))
        data = r.json()
        return {"success": True, "resend": data}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("pip checkpoint email")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/sparky/compose", dependencies=[Depends(verify_agent_secret)])
def sparky_compose(body: SparkyComposeBody) -> dict[str, Any]:
    try:
        return compose_engagement(**_llm_kw(), state=body.state)
    except Exception as e:
        logger.exception("sparky compose")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/sparky/dispatch", dependencies=[Depends(verify_agent_secret)])
def sparky_dispatch(body: SparkyDispatchBody) -> dict[str, Any]:
    s = _s()
    out: dict[str, Any] = {}
    try:
        composed = compose_engagement(**_llm_kw(), state=body.compose_state)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    sid = getattr(s, "twilio_account_sid", None)
    token = getattr(s, "twilio_auth_token", None)
    if body.use_voice or body.use_whatsapp or body.use_sms:
        if not sid or not token:
            raise HTTPException(status_code=503, detail="Twilio not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)")
        out["twilio"] = dispatch_twilio(
            account_sid=sid.strip(),
            auth_token=token.strip(),
            whatsapp_from=getattr(s, "twilio_whatsapp_from", None),
            voice_from=getattr(s, "twilio_voice_from", None),
            sms_from=getattr(s, "twilio_sms_from", None),
            to_phone_e164=body.to_phone_e164.strip(),
            whatsapp_message=str(composed.get("whatsapp_message") or ""),
            voice_script=str(composed.get("voice_script") or ""),
            use_whatsapp=body.use_whatsapp,
            use_voice=body.use_voice,
            use_sms=body.use_sms,
        )

    if body.use_email and body.to_email:
        sg = getattr(s, "sendgrid_api_key", None)
        from_em = getattr(s, "sendgrid_from_email", None)
        if not sg or not from_em:
            raise HTTPException(status_code=503, detail="SendGrid not configured (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL)")
        out["email"] = dispatch_sendgrid_email(
            sendgrid_api_key=sg.strip(),
            from_email=from_em.strip(),
            to_email=body.to_email.strip(),
            subject=str(composed.get("email_subject") or "SkillCrew"),
            body_text=str(composed.get("email_body_text") or ""),
        )

    out["composed"] = composed
    return out


@router.post("/engagement/digest-if-due", dependencies=[Depends(verify_agent_secret)])
def engagement_digest_if_due(body: DigestIfDueBody) -> dict[str, Any]:
    """Called from Next.js when a user opens the dashboard — sends digest if local time + activity allow."""
    from engagement_cron import try_send_scheduled_digest_for_user

    try:
        supabase = _service_supabase()
        return try_send_scheduled_digest_for_user(
            settings=_s(),
            supabase=supabase,
            user_id=body.user_id.strip(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("engagement digest-if-due")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/engagement/login-welcome", dependencies=[Depends(verify_agent_secret)])
def engagement_login_welcome(body: LoginWelcomeBody) -> dict[str, Any]:
    from engagement_cron import try_send_login_welcome_whatsapp

    try:
        supabase = _service_supabase()
        return try_send_login_welcome_whatsapp(
            settings=_s(),
            supabase=supabase,
            user_id=body.user_id.strip(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("engagement login-welcome")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/engagement/pip-checkpoint", dependencies=[Depends(verify_agent_secret)])
def engagement_pip_checkpoint(body: PipCheckpointWhatsAppBody) -> dict[str, Any]:
    from engagement_cron import try_send_pip_checkpoint_whatsapp

    try:
        supabase = _service_supabase()
        return try_send_pip_checkpoint_whatsapp(
            settings=_s(),
            supabase=supabase,
            user_id=body.user_id.strip(),
            roadmap_id=body.roadmap_id.strip(),
            milestone_id=body.milestone_id.strip(),
            week=body.week,
            score_percent=body.score_percent,
            roadmap_title=body.roadmap_title,
            roadmap_mode=body.roadmap_mode,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("engagement pip-checkpoint")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/engagement/milestone-modules", dependencies=[Depends(verify_agent_secret)])
def engagement_milestone_modules(body: MilestoneModulesWhatsAppBody) -> dict[str, Any]:
    from engagement_cron import try_send_milestone_modules_whatsapp

    try:
        supabase = _service_supabase()
        return try_send_milestone_modules_whatsapp(
            settings=_s(),
            supabase=supabase,
            user_id=body.user_id.strip(),
            roadmap_id=body.roadmap_id.strip(),
            roadmap_mode=body.roadmap_mode.strip(),
            nodes_completed=body.nodes_completed,
            nodes_total=body.nodes_total,
            percent=body.percent,
            milestone_title=body.milestone_title,
            roadmap_display_title=body.roadmap_display_title,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("engagement milestone-modules")
        raise HTTPException(status_code=502, detail=str(e)) from e


@router.post("/coach", dependencies=[Depends(verify_agent_secret)])
def coach(body: CoachBody) -> dict[str, Any]:
    try:
        return coach_turn(**_llm_kw(), payload=body.payload)
    except Exception as e:
        logger.exception("coach")
        raise HTTPException(status_code=502, detail=str(e)) from e
