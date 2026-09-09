"""Coach: interprets any user message + behavior as signals — CrewAI Agent/Task/Crew."""

from __future__ import annotations

import json
from copy import deepcopy
from typing import Any

from crewai_compat import Agent, Crew, Task
from nova_agent import syllabus_for_prompt

# Same system text as before (preserved for identical prompts).
COACH_SYSTEM = """You are the SkillCrew learning coach. Every user message is DATA about their state.
You respond with empathy for ANY domain (not only technology). You:
- Detect concerns (overwhelm, time, fear of failing, confusion, motivation swings).
- If they ask to slow down, speed up, simplify, or extend deadlines, propose concrete preference changes.
- If they are inactive or disengaged, ask a short reflective question and suggest one small next step.
- If they are doing well, encourage without being generic; tie praise to their stated goals.
- When the payload includes syllabus_source_text (course/syllabus PDF extract), use it to ground pacing, scope, and next steps — do not invent requirements not supported by that text.
- When the payload includes youtube_transcript_context (playlist caption text), use it alongside their goal to ground scope and next steps when relevant.
- Never invent facts about their progress beyond what the payload says.

Output strict JSON only."""

coach_agent = Agent(
    role="SkillCrew Learning Coach",
    goal=(
        "Interpret learner messages and behavior as signals; respond with empathy and propose "
        "concrete preference or roadmap adjustments for any domain."
    ),
    backstory=COACH_SYSTEM,
    # Exact prior system string — do not wrap with role/goal headers.
    system_prompt=COACH_SYSTEM,
    verbose=True,
)


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


def coach_turn(
    *,
    groq_api_key: str | None,
    groq_model: str,
    google_api_key: str | None,
    gemini_model: str,
    payload: dict[str, Any],
) -> dict[str, Any]:
    """
    payload includes:
      latest_user_message, recent_transcript (optional list of {role, content}),
      profile (name, xp, level, streak), preferences (pace, difficulty, daily_goal_minutes),
      learning_direction (free text), skills_top, behavior_summary (inactive_days, sessions_last_7d, etc.),
      syllabus_source_text (optional: trimmed course/syllabus PDF extract),
      youtube_transcript_context (optional: playlist captions)
    """
    payload_for_llm = deepcopy(payload)
    raw_syllabus = payload_for_llm.pop("syllabus_source_text", None)
    trimmed = syllabus_for_prompt(raw_syllabus if isinstance(raw_syllabus, str) else None, max_chars=12000)
    if trimmed:
        payload_for_llm["syllabus_source_text"] = trimmed

    raw_yt = payload_for_llm.pop("youtube_transcript_context", None)
    yt_trimmed = syllabus_for_prompt(raw_yt if isinstance(raw_yt, str) else None, max_chars=12000)
    if yt_trimmed:
        payload_for_llm["youtube_transcript_context"] = yt_trimmed

    # Same user prompt text as the pre-CrewAI direct llm_generate_json path.
    prompt = (
        "Context JSON:\n"
        + json.dumps(payload_for_llm, ensure_ascii=False, indent=2)
        + "\n\nReturn JSON with this shape:\n"
        "{\n"
        '  "assistant_message": string (what the user reads; warm, specific, actionable),\n'
        '  "signals": [ { "type": string, "detail": string } ],\n'
        '  "actions": {\n'
        '    "update_preferences": null | { "learning_pace": "slow"|"balanced"|"fast", '
        '"difficulty_level": "beginner"|"intermediate"|"advanced"|"expert", '
        '"daily_goal_minutes": number } (only fields that should change),\n'
        '    "refresh_roadmap": boolean,\n'
        '    "roadmap_adjustment_notes": string (for Archie: why timeline/depth should change),\n'
        '    "ask_user_followup": null | string\n'
        "  }\n"
        "}\n"
        "If the user expresses they cannot keep up, refresh_roadmap should usually be true and "
        "update_preferences should lower pace or difficulty when appropriate."
    )

    task = Task(
        description=prompt,
        # Shape is already embedded in `prompt` (legacy coach path); keep user text identical.
        expected_output="",
        agent=coach_agent,
        temperature=0.55,
    )
    crew = Crew(agents=[coach_agent], tasks=[task])
    return crew.kickoff(llm_kw=_llm_kw(groq_api_key, groq_model, google_api_key, gemini_model))
