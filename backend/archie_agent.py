"""Archie: learning roadmaps and certification ideas — CrewAI framework."""

from __future__ import annotations

import json
from typing import Any

from crewai_compat import Agent, Crew, Task

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _json_dumps(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=2)


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
# Archie Agent definition
# ---------------------------------------------------------------------------

_ARCHIE_GOAL = (
    "Design personalised, domain-agnostic learning roadmaps for any professional or personal goal: "
    "healthcare, trades, arts, business, law, education, hospitality, agriculture, sports, parenting, "
    "software, data, and more. Never assume the learner is in technology unless their profile says so."
)

_ARCHIE_BACKSTORY = """Rules:
- Use ONLY the learner context provided (skills, experience summaries, stated direction, locale, pace, syllabus_source_text when present, youtube_transcript_context when present).
- **Sparse or mismatched profile:** If skills is empty or the listed skills do not align with direction, still output a COMPLETE roadmap. Infer milestones from direction and any syllabus or YouTube context — not from unrelated profile noise.
- When direction and saved skills conflict, prioritize direction and roadmap_intent; treat mismatched skills as optional background only.
- If syllabus_source_text is provided, align milestones and week titles with that material.
- If youtube_transcript_context is provided, align milestones and contentSuggestions with that teaching sequence.
- Structure: One module = one calendar week (one milestone). Include exactly one modules[] entry per weekly milestone. Each module's milestoneId MUST equal that week's id (week-1, week-2, … in order).
- Each module MUST have milestoneId and a guidedSequence with at least FIVE kind: "lesson" steps (with narrow title, summary, conceptTags, resources: []) BEFORE the first quiz.
  - Lessons: { "kind": "lesson", "id", "order", "title", "summary", "conceptTags": [], "resources": [] } — leave resources empty; the server enriches links.
  - Quiz checkpoints: { "kind": "quiz_checkpoint", "id", "order", "title", "summary", "revisitsConcepts": ["string"], "checkpointTier": "quick" | "module_capstone" } — one module_capstone at end of each module.
- Also keep contentSuggestions on each module as an empty array [] (the server fills real URLs after generation).
- Within each section add checkpoints every 2-3 modules: { afterModuleId, title, topicsCovered }.
- Honor preferences (difficulty_level, learning_pace, preferred_content).
- Respect roadmap_intent: "skills" = shorter, competency-focused; "job_ready" = deeper, employability-focused.
- **Length:** Unless explicitly asked for a micro/crash course, roadmap MUST span AT LEAST 8 calendar weeks (milestones.length >= 8, totalWeeks >= 8).
- If behavior_summary includes roadmap_continuation: true: this is Level N+1 — advance displayLevel, assume learner finished prior weeks, design deeper milestones.
- Output strictly valid JSON. weeklyTimeline.archetype must be a short machine id; archetypeLabel a human label.
- milestones: one per week, ordered. Include learningObjective per milestone (one clear sentence).
- status: week 1 "in_progress"; weeks 2+ "locked".
- phaseLabel like "W1", "W2" matching week number. id for each milestone: "week-{n}".
"""

archie_agent = Agent(
    role="Archie — Learning Architect",
    goal=_ARCHIE_GOAL,
    backstory=_ARCHIE_BACKSTORY,
    verbose=True,
)


# ---------------------------------------------------------------------------
# Certification agent
# ---------------------------------------------------------------------------

_CERT_GOAL = (
    "Suggest credible certifications, licenses, diplomas, badges, or examinations "
    "appropriate to the learner's stated direction and geography — any industry."
)

_CERT_BACKSTORY = (
    "Do not assume IT. If skills[] is empty or unrelated to direction, still propose credentials "
    "that match the stated direction only. Output JSON only."
)

archie_cert_agent = Agent(
    role="Archie — Certification Advisor",
    goal=_CERT_GOAL,
    backstory=_CERT_BACKSTORY,
    verbose=True,
)


# ---------------------------------------------------------------------------
# Public functions (same signatures as before)
# ---------------------------------------------------------------------------

def build_roadmap_bundle(
    *,
    groq_api_key: str | None,
    groq_model: str,
    google_api_key: str | None,
    gemini_model: str,
    context: dict[str, Any],
) -> dict[str, Any]:
    """context keys: skills[], experiences[], direction, roadmap_intent, locale?, pace?, quiz_feedback?"""
    task = Task(
        description=(
            "Build a complete personalized learning roadmap.\n\n"
            "Learner context (JSON):\n"
            + _json_dumps(context)
            + "\n\nReturn a single JSON object with this shape:\n"
            + _json_dumps(ROADMAP_SHAPE_HINT)
            + "\nFill every field. weeklyTimeline.weeks must align with milestones order and length.\n"
            "CRITICAL: one module per week (modules.length === milestones.length). "
            "Unless explicitly requested as a micro course, output AT LEAST 8 milestones (week-1 … week-8) "
            "and set weeklyTimeline.totalWeeks >= 8. "
            "Each module's guidedSequence MUST contain at least FIVE lesson objects (kind: lesson) "
            "with titles and summaries; leave lesson resources and contentSuggestions empty."
        ),
        expected_output="JSON object matching the ROADMAP_SHAPE_HINT schema",
        agent=archie_agent,
        temperature=0.4,
    )
    crew = Crew(agents=[archie_agent], tasks=[task])
    return crew.kickoff(llm_kw=_llm_kw(groq_api_key, groq_model, google_api_key, gemini_model))


def revise_roadmap_bundle(
    *,
    groq_api_key: str | None,
    groq_model: str,
    google_api_key: str | None,
    gemini_model: str,
    current_bundle: dict[str, Any],
    adaptation_signals: dict[str, Any],
    learner_context: dict[str, Any],
) -> dict[str, Any]:
    task = Task(
        description=(
            "Revise the following roadmap based on adaptation signals.\n\n"
            "Current roadmap JSON:\n"
            + _json_dumps(current_bundle)
            + "\n\nAdaptation signals (quiz results, chat concerns, coach notes, behavior, explicit requests "
            "to slow down / simplify / extend timeline / add basics):\n"
            + _json_dumps(adaptation_signals)
            + "\n\nRefreshed learner context:\n"
            + _json_dumps(learner_context)
            + "\n\nReturn a REVISED full roadmap JSON of the SAME shape as before (including sections, modules, "
            "guidedSequence per module, milestoneId on modules, contentSuggestions, checkpoints). "
            "Explain in planRationale what changed and WHY, referencing the signals; also set updateNote on affected lessons. "
            "If adaptation signals include weak quiz topics: add or reorder guidedSequence lessons and quiz_checkpoint "
            "steps that revisit those concepts. "
            "If the learner needs a slower path: extend total weeks, add foundation milestones. "
            "Keep one module per week; each module must still have at least FIVE lessons in guidedSequence. "
            "Unless the learner asked for a micro course, maintain at least 8 weekly milestones."
        ),
        expected_output="Revised JSON roadmap object of the same shape as the input roadmap",
        agent=archie_agent,
        temperature=0.35,
    )
    crew = Crew(agents=[archie_agent], tasks=[task])
    return crew.kickoff(llm_kw=_llm_kw(groq_api_key, groq_model, google_api_key, gemini_model))


def build_certifications_bundle(
    *,
    groq_api_key: str | None,
    groq_model: str,
    google_api_key: str | None,
    gemini_model: str,
    context: dict[str, Any],
) -> dict[str, Any]:
    task = Task(
        description=(
            "Suggest relevant certifications for this learner.\n\n"
            "Context:\n"
            + _json_dumps(context)
            + '\n\nReturn JSON: {\n'
            '  "targetRole": string (echo their direction),\n'
            '  "archetypeLabel": string (short human label for their field),\n'
            '  "intro": string (2-4 sentences, your reasoning),\n'
            '  "items": [ { "id", "name", "provider", "focus", "archieRationale", "prepHint?" } ]\n'
            "}\nUse 4-8 items. archieRationale must justify each item for THIS learner."
        ),
        expected_output='JSON with keys: targetRole, archetypeLabel, intro, items[]',
        agent=archie_cert_agent,
        temperature=0.4,
    )
    crew = Crew(agents=[archie_cert_agent], tasks=[task])
    return crew.kickoff(llm_kw=_llm_kw(groq_api_key, groq_model, google_api_key, gemini_model))


# ---------------------------------------------------------------------------
# Schema hint (referenced by roadmap_worker.py and normalizer)
# ---------------------------------------------------------------------------

ROADMAP_SHAPE_HINT: dict[str, Any] = {
    "trackTitle": "string",
    "trackProgressPercent": "number 0-100",
    "displayLevel": "number",
    "roleSubtitle": "string",
    "milestonesDone": "number",
    "milestonesTotal": "number",
    "displayXp": "number",
    "planRationale": "string",
    "milestones": [
        {
            "id": "week-1",
            "phaseLabel": "W1",
            "title": "string",
            "topics": ["string"],
            "learningObjective": "string",
            "statusLine": "string",
            "status": "completed|in_progress|available|locked",
            "progressPercent": "optional number",
            "xpReward": "optional number",
            "archieRationale": "string",
            "structureNote": "optional string",
        }
    ],
    "weeklyTimeline": {
        "archetype": "string",
        "archetypeLabel": "string",
        "phases": [{"name": "string", "weekStart": 1, "weekEnd": 3}],
        "weeks": [{"week": 1, "title": "string", "topics": ["string"]}],
        "totalWeeks": "number",
    },
    "sections": [
        {
            "id": "sec-1",
            "title": "string",
            "summary": "optional string",
            "modules": [
                {
                    "id": "mod-1",
                    "milestoneId": "week-1",
                    "title": "string",
                    "summary": "string",
                    "skills": ["string"],
                    "contentSuggestions": [],
                    "guidedSequence": [
                        {
                            "kind": "lesson",
                            "id": "lesson-1",
                            "order": 1,
                            "title": "string",
                            "summary": "string",
                            "conceptTags": ["string"],
                            "updateNote": "optional string — why this lesson exists after a plan change",
                            "resources": [],
                        },
                        {
                            "kind": "lesson",
                            "id": "lesson-2",
                            "order": 2,
                            "title": "string",
                            "summary": "string",
                            "conceptTags": ["string"],
                            "resources": [],
                        },
                        {
                            "kind": "lesson",
                            "id": "lesson-3",
                            "order": 3,
                            "title": "string",
                            "summary": "string",
                            "conceptTags": ["string"],
                            "resources": [],
                        },
                        {
                            "kind": "lesson",
                            "id": "lesson-4",
                            "order": 4,
                            "title": "string",
                            "summary": "string",
                            "conceptTags": ["string"],
                            "resources": [],
                        },
                        {
                            "kind": "lesson",
                            "id": "lesson-5",
                            "order": 5,
                            "title": "string",
                            "summary": "string",
                            "conceptTags": ["string"],
                            "resources": [],
                        },
                        {
                            "kind": "quiz_checkpoint",
                            "id": "quiz-a",
                            "order": 6,
                            "title": "string",
                            "summary": "string",
                            "revisitsConcepts": ["string"],
                            "checkpointTier": "quick",
                        },
                    ],
                }
            ],
            "checkpoints": [
                {
                    "id": "cp-1",
                    "afterModuleId": "mod-2",
                    "title": "string",
                    "topicsCovered": ["string"],
                }
            ],
        }
    ],
}

# Keep the old system string accessible for any external import that references it
ARCHIE_SYSTEM = f"You are {archie_agent.role}.\nGoal: {archie_agent.goal}\n\n{archie_agent.backstory}"
