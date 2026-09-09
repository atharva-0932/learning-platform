"""Nova Agent: merge LinkedIn + resume extractions into a single profile — CrewAI framework."""

from __future__ import annotations

from typing import Any

from crewai_compat import Agent

# ---------------------------------------------------------------------------
# Nova Agent definition (real CrewAI Agent via crewai_compat bridge)
# ---------------------------------------------------------------------------
#
# Nova is a deterministic profile-merging agent — no LLM is involved.
# The Agent definition uses real crewai.Agent for framework identity;
# merge logic runs as pure Python (fast, reliable, no API cost). Call sites
# in main.py invoke merge_profiles() directly — not Crew.kickoff.
# ---------------------------------------------------------------------------

nova_agent = Agent(
    role="Nova — Profile Intelligence Agent",
    goal=(
        "Merge LinkedIn scrape data and resume parse data into a single, deduplicated learner profile "
        "that Archie can use to design a personalized roadmap."
    ),
    backstory=(
        "You are Nova, the onboarding intelligence layer of SkillCrew. "
        "You receive raw data from two sources — a LinkedIn profile scrape and a resume parse — "
        "and you produce a clean merged profile: deduplicated skills, unified experience, "
        "inferred current role, and project keywords. "
        "Your output is a structured JSON object consumed directly by Archie."
    ),
    verbose=True,
)


# ---------------------------------------------------------------------------
# Nova's tools (deterministic Python — no LLM)
# ---------------------------------------------------------------------------

def _norm(s: str) -> str:
    return " ".join(s.strip().split()).casefold()


def dedupe_strings(values: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for v in values:
        if not isinstance(v, str):
            continue
        t = v.strip()
        if not t:
            continue
        k = _norm(t)
        if k in seen:
            continue
        seen.add(k)
        out.append(t)
    return out


def merge_profiles(
    linkedin: dict[str, Any],
    resume: dict[str, Any],
) -> dict[str, Any]:
    """
    Nova's primary tool: merge LinkedIn scrape JSON + resume parse JSON with duplicate removal.
    """
    li_skills = linkedin.get("skills") or []
    li_exp = linkedin.get("experience") or []
    li_role = linkedin.get("current_role")

    tech = resume.get("technical_skills") or resume.get("skills") or []
    proj_kw = resume.get("project_keywords") or []

    if not isinstance(li_skills, list):
        li_skills = []
    if not isinstance(li_exp, list):
        li_exp = []
    if not isinstance(tech, list):
        tech = []
    if not isinstance(proj_kw, list):
        proj_kw = []

    merged_skills = dedupe_strings([str(x) for x in li_skills] + [str(x) for x in tech])
    merged_exp = dedupe_strings([str(x) for x in li_exp])

    current_role = li_role if isinstance(li_role, str) and li_role.strip() else None
    if not current_role:
        alt = resume.get("current_role") or resume.get("headline")
        if isinstance(alt, str) and alt.strip():
            current_role = alt.strip()

    return {
        "sources": {
            "linkedin": linkedin,
            "resume": resume,
        },
        "merged": {
            "skills": merged_skills,
            "experience": merged_exp,
            "current_role": current_role,
            "project_keywords": dedupe_strings([str(x) for x in proj_kw]),
        },
    }


def syllabus_for_prompt(text: str | None, max_chars: int = 12000) -> str | None:
    """Trim syllabus / course PDF text for Nova or Archie learner context (JSON payloads)."""
    if not text or not isinstance(text, str):
        return None
    t = text.strip()
    if not t:
        return None
    return t[:max_chars]


def build_extracted_skills(master: dict[str, Any]) -> list[str]:
    merged = master.get("merged") or {}
    skills = merged.get("skills") or []
    pkw = merged.get("project_keywords") or []
    if not isinstance(skills, list):
        skills = []
    if not isinstance(pkw, list):
        pkw = []
    return dedupe_strings([str(x) for x in skills] + [str(x) for x in pkw])
