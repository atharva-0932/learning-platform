"""Pip: quizzes, revision assets, structured feedback for Archie — CrewAI framework."""

from __future__ import annotations

import json
from typing import Any

from crewai_compat import Agent, Crew, Task

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _llm_kw(
    groq_api_key: str | None,
    groq_model: str,
    google_api_key: str | None,
    gemini_model: str,
) -> dict[str, Any]:
    return {
        "groq_api_key": groq_api_key,
        "groq_model": groq_model,
        "google_api_key": google_api_key,
        "gemini_model": gemini_model,
    }


# ---------------------------------------------------------------------------
# Pip Agent definitions
# ---------------------------------------------------------------------------

pip_quiz_agent = Agent(
    role="Pip — Assessment Designer",
    goal=(
        "Create fair multiple-choice assessments for ANY subject and industry — "
        "marketing, music, healthcare, law, trades, arts, business, software, etc. "
        "Questions must match the topics provided. Do NOT assume technology."
    ),
    backstory=(
        "You are Pip, a fair assessment designer. "
        "Create multiple-choice questions with one correct answer each (4 choices). "
        "Do NOT assume technology: avoid programming, algorithms, or DSA unless the topics are explicitly about software, data, or engineering. "
        "Output JSON only."
    ),
    verbose=True,
)

pip_grader_agent = Agent(
    role="Pip — Quiz Grader",
    goal="Grade a submitted quiz and identify misconceptions for the learning architect.",
    backstory=(
        "You are Pip. Grade the quiz. For each wrong answer, record misconception details "
        "for the learning architect. Output JSON only."
    ),
    verbose=True,
)

pip_revision_agent = Agent(
    role="Pip — Revision Pack Builder",
    goal="Build revision assets: a mind map, flashcards, and a spaced-repetition suggestion for any domain.",
    backstory=(
        "You are Pip. Build revision assets: a mind map, flashcards, and a spaced-repetition suggestion. "
        "Any domain. JSON only."
    ),
    verbose=True,
)

pip_checkpoint_agent = Agent(
    role="Pip — Checkpoint Designer",
    goal=(
        "Design checkpoint MCQ assessments for ANY profession or field: marketing, music, film, "
        "healthcare, nursing, law, education, trades, hospitality, sports, creative arts, business, "
        "parenting, software, data, etc. You are curious and fair, never judgmental."
    ),
    backstory=(
        "Every question MUST be kind 'mcq' only — four choices, one correct answer. "
        "This checkpoint is multiple-choice only: do NOT emit coding, debug, or programming exercises. "
        "Even for technical roadmaps, prefer conceptual and applied MCQs over raw code drills. "
        "For non-technical domains use scenario MCQs, terminology, best practices, interpretation, and application. "
        "Align every question with the learner's roadmap domain (direction / track title) and topics_covered. "
        "Vary question stems. Difficulty: easy|medium|hard — roughly 40% easy, 35% medium, 25% hard. "
        "Each question: id (unique), kind must be 'mcq', difficulty, topic (short label), prompt, "
        "choices (exactly 4 strings), correct_index (0-3), optional explanation_after_answer (one line). "
        "JSON only, no markdown outside strings."
    ),
    verbose=True,
)


# ---------------------------------------------------------------------------
# Public functions (same signatures as before)
# ---------------------------------------------------------------------------

def build_quiz(
    *,
    groq_api_key: str | None,
    groq_model: str,
    google_api_key: str | None,
    gemini_model: str,
    topics_learned: list[str],
    difficulty: str,
    count: int = 5,
    locale: str | None = None,
) -> dict[str, Any]:
    ctx = {
        "topics_learned": topics_learned,
        "difficulty": difficulty,
        "question_count": count,
        "locale": locale or "en",
    }
    task = Task(
        description=(
            json.dumps(ctx, ensure_ascii=False)
            + '\n\nReturn JSON: {\n'
            '  "quiz_id": string,\n'
            '  "questions": [ {\n'
            '    "id": string,\n'
            '    "prompt": string,\n'
            '    "choices": [string, string, string, string],\n'
            '    "correct_index": 0-3,\n'
            '    "explanation": string (teach the idea; no fluff)\n'
            "  } ]\n"
            "}"
        ),
        expected_output='JSON with keys: quiz_id, questions[]',
        agent=pip_quiz_agent,
        temperature=0.35,
    )
    crew = Crew(agents=[pip_quiz_agent], tasks=[task])
    return crew.kickoff(llm_kw=_llm_kw(groq_api_key, groq_model, google_api_key, gemini_model))


def grade_quiz(
    *,
    groq_api_key: str | None,
    groq_model: str,
    google_api_key: str | None,
    gemini_model: str,
    quiz: dict[str, Any],
    answers: dict[str, int],
) -> dict[str, Any]:
    payload = {"quiz": quiz, "answers": answers}
    task = Task(
        description=(
            json.dumps(payload, ensure_ascii=False)
            + '\n\nReturn JSON: {\n'
            '  "score_percent": number,\n'
            '  "mistakes": [ {\n'
            '    "question_id": string,\n'
            '    "topic": string,\n'
            '    "user_answer_index": number,\n'
            '    "correct_index": number,\n'
            '    "user_answer_text": string,\n'
            '    "correct_answer_text": string,\n'
            '    "misconception": string\n'
            "  } ],\n"
            '  "strengths": [string],\n'
            '  "pip_summary_for_archie": string (dense; what to change in the learning path)\n'
            "}"
        ),
        expected_output='JSON with keys: score_percent, mistakes[], strengths[], pip_summary_for_archie',
        agent=pip_grader_agent,
        temperature=0.2,
    )
    crew = Crew(agents=[pip_grader_agent], tasks=[task])
    return crew.kickoff(llm_kw=_llm_kw(groq_api_key, groq_model, google_api_key, gemini_model))


def build_revision_pack(
    *,
    groq_api_key: str | None,
    groq_model: str,
    google_api_key: str | None,
    gemini_model: str,
    topics: list[str],
    notes: str | None,
    locale: str | None = None,
) -> dict[str, Any]:
    ctx = {"topics": topics, "learner_notes": notes or "", "locale": locale or "en"}
    task = Task(
        description=(
            json.dumps(ctx, ensure_ascii=False)
            + '\n\nReturn JSON: {\n'
            '  "mindmap": { "root": string, "children": [ { "label": string, "children": [] } ] },\n'
            '  "flashcards": [ { "id": string, "front": string, "back": string, "difficulty": "easy"|"medium"|"hard" } ],\n'
            '  "revision_routine": { "daily_minutes": number, "cadence_hint": string, "priorities": [string] }\n'
            "}"
        ),
        expected_output='JSON with keys: mindmap, flashcards[], revision_routine',
        agent=pip_revision_agent,
        temperature=0.4,
    )
    crew = Crew(agents=[pip_revision_agent], tasks=[task])
    return crew.kickoff(llm_kw=_llm_kw(groq_api_key, groq_model, google_api_key, gemini_model))


def build_checkpoint_assessment(
    *,
    groq_api_key: str | None,
    groq_model: str,
    google_api_key: str | None,
    gemini_model: str,
    topics_covered: list[str],
    preferences: dict[str, Any] | None = None,
    locale: str | None = None,
    question_count: int = 6,
    roadmap_direction: str | None = None,
    track_title: str | None = None,
    roadmap_mode: str | None = None,
) -> dict[str, Any]:
    ctx: dict[str, Any] = {
        "topics_covered": topics_covered,
        "preferences": preferences or {},
        "locale": locale or "en",
        "question_count": max(3, min(10, question_count)),
    }
    if roadmap_direction and str(roadmap_direction).strip():
        ctx["roadmap_direction"] = str(roadmap_direction).strip()
    if track_title and str(track_title).strip():
        ctx["track_title"] = str(track_title).strip()
    if roadmap_mode and str(roadmap_mode).strip():
        ctx["roadmap_mode"] = str(roadmap_mode).strip()

    task = Task(
        description=(
            json.dumps(ctx, ensure_ascii=False)
            + '\n\nReturn JSON: {\n'
            '  "assessment_id": string,\n'
            '  "questions": [ {\n'
            '    "id": string, "kind": "mcq", "difficulty": "easy"|"medium"|"hard",\n'
            '    "topic": string, "prompt": string,\n'
            '    "choices": [string, string, string, string], "correct_index": number,\n'
            '    "explanation_after_answer": optional string\n'
            "  } ]\n"
            "}\n"
            'Every question must have kind exactly "mcq" and exactly four choices.'
        ),
        expected_output='JSON with keys: assessment_id, questions[]',
        agent=pip_checkpoint_agent,
        temperature=0.35,
    )
    crew = Crew(agents=[pip_checkpoint_agent], tasks=[task])
    return crew.kickoff(llm_kw=_llm_kw(groq_api_key, groq_model, google_api_key, gemini_model))


def grade_checkpoint_assessment(
    *,
    groq_api_key: str | None,
    groq_model: str,
    google_api_key: str | None,
    gemini_model: str,
    assessment: dict[str, Any],
    answers: dict[str, Any],
) -> dict[str, Any]:
    """Grade checkpoint MCQs deterministically (fast, reliable). LLM keys kept for API compatibility."""
    del groq_api_key, groq_model, google_api_key, gemini_model

    questions = assessment.get("questions") if isinstance(assessment.get("questions"), list) else []
    answer_map = answers if isinstance(answers, dict) else {}
    results: list[dict[str, Any]] = []

    for q in questions:
        if not isinstance(q, dict):
            continue
        qid = str(q.get("id") or "").strip()
        if not qid:
            continue
        kind = str(q.get("kind") or "mcq").lower()
        topic = str(q.get("topic") or q.get("prompt") or "Review").strip()[:120]
        difficulty = str(q.get("difficulty") or "medium")
        ans_entry = answer_map.get(qid)
        correct = False
        note = ""

        if isinstance(ans_entry, dict):
            if kind in ("mcq", "") and isinstance(q.get("choices"), list):
                try:
                    user_idx = ans_entry.get("mcq_index")
                    correct_idx = int(q.get("correct_index"))
                    user_i = int(user_idx) if user_idx is not None else -1
                    correct = user_i == correct_idx
                except (TypeError, ValueError):
                    correct = False
                explanation = str(q.get("explanation_after_answer") or q.get("explanation") or "").strip()
                if correct:
                    note = explanation or "Correct — nice work."
                else:
                    note = explanation or f"Review: {topic}"
            elif kind in ("coding", "debug"):
                text = str(ans_entry.get("text") or "").strip()
                correct = len(text) >= 8
                note = "Answer recorded." if correct else "Add a fuller answer to practice this skill."
            else:
                text = str(ans_entry.get("text") or "").strip()
                correct = len(text) >= 3
                note = "Answer recorded." if correct else "Add an answer to continue."

        results.append(
            {
                "question_id": qid,
                "correct": correct,
                "topic": topic,
                "difficulty": difficulty,
                "kind": kind or "mcq",
                "note": note[:500],
            }
        )

    total = len(results)
    correct_n = sum(1 for r in results if r.get("correct"))
    score_percent = round(100 * correct_n / total) if total else 0
    weak_topics = list(
        dict.fromkeys(str(r.get("topic") or "").strip() for r in results if not r.get("correct"))
    )
    weak_topics = [t for t in weak_topics if t][:12]

    flashcard_suggestions: list[dict[str, str]] = []
    for r in results:
        if r.get("correct"):
            continue
        flashcard_suggestions.append(
            {
                "front": str(r.get("topic") or "Review"),
                "back": str(r.get("note") or "Review the lesson material."),
                "from_question_id": str(r.get("question_id") or ""),
            }
        )

    pip_summary = ""
    if weak_topics:
        pip_summary = (
            f"Checkpoint score {score_percent}%. Reinforce: {', '.join(weak_topics[:6])}."
        )

    return {
        "results": results,
        "score_percent": score_percent,
        "weak_topics": weak_topics,
        "pip_summary_for_archie": pip_summary,
        "flashcard_suggestions": flashcard_suggestions[:12],
    }
