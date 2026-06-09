#!/usr/bin/env python3
"""
Long-polls SkillCrew SQS for Archie roadmap jobs and updates Supabase.

Environment: same as the FastAPI backend (see backend/.env + optional repo root .env).
Run from the backend directory:

  python run_archie_roadmap_sqs_worker.py

Requires IAM: sqs:ReceiveMessage, sqs:DeleteMessage, sqs:GetQueueUrl (if URL not set).
Set SQS receive visibility timeout long enough for LLM generation (VISIBILITY_TIMEOUT_SEC).
"""

from __future__ import annotations

import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import Any

import boto3
from dotenv import load_dotenv
from supabase import create_client

from roadmap_worker import ARCHIE_GENERATE_MESSAGE_TYPE, process_archie_generate_message

ROOT_ENV = Path(__file__).resolve().parent / ".env"
REPO_ENV = Path(__file__).resolve().parent.parent / ".env"
if REPO_ENV.is_file():
    load_dotenv(REPO_ENV, override=False)
load_dotenv(ROOT_ENV, override=True)

_LOG_FMT = "%(asctime)s %(levelname)s %(name)s %(message)s"
logging.basicConfig(level=logging.INFO, format=_LOG_FMT)
logger = logging.getLogger(__name__)


def _boto_session() -> boto3.session.Session:
    region = os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION")
    access_key = os.environ.get("AWS_ACCESS_KEY_ID")
    secret_key = os.environ.get("AWS_SECRET_ACCESS_KEY")
    kwargs: dict[str, str] = {}
    if region:
        kwargs["region_name"] = region
    if access_key and secret_key:
        kwargs["aws_access_key_id"] = access_key
        kwargs["aws_secret_access_key"] = secret_key
    return boto3.session.Session(**kwargs)


def _queue_url(sqs: Any) -> str:
    explicit = (os.environ.get("SQS_SKILLCREW_TASK_QUEUE_URL") or "").strip()
    if explicit:
        return explicit
    name = (os.environ.get("SQS_SKILLCREW_TASK_QUEUE_NAME") or "SkillCrew-Task-Queue").strip()
    out = sqs.get_queue_url(QueueName=name)
    u = out.get("QueueUrl")
    if not u:
        raise RuntimeError("GetQueueUrl returned empty QueueUrl")
    return str(u)


def _supabase() -> Any:
    url = (
        (os.environ.get("SUPABASE_PROJECT_URL") or "").strip()
        or (os.environ.get("SUPABASE_URL") or "").strip()
        or (os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or "").strip()
    )
    key = (os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "").strip()
    if not url or not key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL (or SUPABASE_PROJECT_URL) are required.")
    return create_client(url.strip(), key)


def main() -> None:
    visibility = int((os.environ.get("ARCHIE_WORKER_VISIBILITY_TIMEOUT_SEC") or "900").strip() or "900")
    wait_sec = int((os.environ.get("ARCHIE_WORKER_WAIT_SEC") or "20").strip() or "20")

    sess = _boto_session()
    sqs = sess.client("sqs")
    queue_url = _queue_url(sqs)
    sb = _supabase()

    groq_key = (os.environ.get("GROQ_API_KEY") or "").strip() or None
    google_key = (os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY") or "").strip() or None
    groq_model = (os.environ.get("GROQ_MODEL") or "llama-3.3-70b-versatile").strip()
    gemini_model = (os.environ.get("GEMINI_MODEL") or "gemini-2.0-flash").strip()
    tavily_key = (os.environ.get("TAVILY_API_KEY") or "").strip() or None
    tavily_enrich_mode = (os.environ.get("ARCHIE_TAVILY_ENRICH_MODE") or "fast").strip()

    logger.info("Polling queue url=%s visibility=%ds", queue_url, visibility)

    while True:
        try:
            resp = sqs.receive_message(
                QueueUrl=queue_url,
                MaxNumberOfMessages=1,
                WaitTimeSeconds=min(20, max(0, wait_sec)),
                VisibilityTimeout=min(43200, max(0, visibility)),
                AttributeNames=["All"],
            )
            messages = resp.get("Messages") or []
            if not messages:
                continue

            raw_body = messages[0].get("Body") or ""
            receipt = messages[0].get("ReceiptHandle")
            msg_id = messages[0].get("MessageId") or ""

            payload: dict[str, Any]
            try:
                payload = json.loads(raw_body)
            except json.JSONDecodeError:
                logger.error("Skip invalid JSON message message_id=%s", msg_id)
                if receipt:
                    sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt)
                continue

            if payload.get("type") != ARCHIE_GENERATE_MESSAGE_TYPE:
                logger.info(
                    "Skip message type=%r message_id=%s",
                    payload.get("type"),
                    msg_id,
                )
                if receipt:
                    sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt)
                continue

            job_id = str(payload.get("job_id") or "").strip()
            ctx = payload.get("context")
            if not job_id or not isinstance(ctx, dict):
                logger.error("Malformed archie roadmap message message_id=%s", msg_id)
                if receipt:
                    sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt)
                continue

            try:
                process_archie_generate_message(
                    supabase=sb,
                    job_id=job_id,
                    context=ctx,
                    groq_api_key=groq_key,
                    groq_model=groq_model,
                    google_api_key=google_key,
                    gemini_model=gemini_model,
                    tavily_api_key=tavily_key,
                    tavily_enrich_mode=tavily_enrich_mode,
                )
            except Exception:
                logger.exception("Job failed job_id=%s", job_id)
            finally:
                if receipt:
                    try:
                        sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt)
                    except Exception:
                        logger.exception("delete_message failed job_id=%s", job_id)

        except KeyboardInterrupt:
            logger.info("Stopping worker.")
            sys.exit(0)
        except Exception:
            logger.exception("receive loop error; backing off")
            time.sleep(5)


if __name__ == "__main__":
    main()
