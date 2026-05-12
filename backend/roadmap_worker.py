"""
Synchronous Archie roadmap generation — intended for an SQS/Lambda/ECS worker.

The FastAPI app enqueues `{ job_id, type, context }` and returns 202. This module
implements the logic that formerly ran inside `/internal/agents/archie/roadmap`.
"""

from __future__ import annotations

import logging
from typing import Any

from archie_agent import build_roadmap_bundle
from archie_tavily_enrich import enrich_archie_bundle_with_tavily

logger = logging.getLogger(__name__)

MIN_ROADMAP_WEEKS = 8

ARCHIE_GENERATE_MESSAGE_TYPE = "archie_generate_roadmap"


def _milestone_week_count(bundle: dict[str, Any]) -> int:
    m = bundle.get("milestones")
    if not isinstance(m, list):
        return 0
    return len(m)


def run_generate_archie_bundle(
    *,
    context: dict[str, Any],
    groq_api_key: str | None,
    groq_model: str,
    google_api_key: str | None,
    gemini_model: str,
    tavily_api_key: str | None,
) -> dict[str, Any]:
    """Build and enrich an Archie roadmap bundle (same contract as the old synchronous HTTP handler)."""
    bundle = build_roadmap_bundle(
        groq_api_key=groq_api_key,
        groq_model=groq_model,
        google_api_key=google_api_key,
        gemini_model=gemini_model,
        context=context,
    )
    n = _milestone_week_count(bundle)
    micro = False
    ctx = context
    if isinstance(ctx, dict):
        prefs = ctx.get("preferences")
        if isinstance(prefs, dict) and str(prefs.get("learning_pace", "")).lower() in (
            "micro",
            "1-week",
            "one_week",
            "crash",
        ):
            micro = True
        if ctx.get("explicit_micro_course") is True:
            micro = True
    if not micro and n < MIN_ROADMAP_WEEKS:
        ctx2 = dict(context)
        ctx2["_minimum_weeks_remediation"] = (
            f"The previous draft had only {n} weekly milestone(s). Regenerate the COMPLETE JSON roadmap with "
            f"at least {MIN_ROADMAP_WEEKS} weekly milestones (week-1 … week-{MIN_ROADMAP_WEEKS}), "
            "one module per week, each with five+ lessons; weeklyTimeline.totalWeeks must match."
        )
        bundle = build_roadmap_bundle(
            groq_api_key=groq_api_key,
            groq_model=groq_model,
            google_api_key=google_api_key,
            gemini_model=gemini_model,
            context=ctx2,
        )
    return enrich_archie_bundle_with_tavily(bundle, tavily_api_key)


def process_archie_generate_message(
    *,
    supabase: Any,
    job_id: str,
    context: dict[str, Any],
    groq_api_key: str | None,
    groq_model: str,
    google_api_key: str | None,
    gemini_model: str,
    tavily_api_key: str | None,
) -> dict[str, Any]:
    """
    Run generation and persist result to `roadmap_generation_jobs`. Called from your SQS worker.
    Returns the bundle dict on success; re-raises after marking job failed.
    """
    from datetime import datetime, timezone

    try:
        bundle = run_generate_archie_bundle(
            context=context,
            groq_api_key=groq_api_key,
            groq_model=groq_model,
            google_api_key=google_api_key,
            gemini_model=gemini_model,
            tavily_api_key=tavily_api_key,
        )
    except Exception as exc:
        logger.exception("Roadmap generation failed job_id=%s", job_id)
        supabase.table("roadmap_generation_jobs").update(
            {
                "status": "failed",
                "error_message": str(exc)[:8000],
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        ).eq("job_id", job_id).execute()
        raise

    supabase.table("roadmap_generation_jobs").update(
        {
            "status": "completed",
            "result_bundle": bundle,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    ).eq("job_id", job_id).execute()
    return bundle
