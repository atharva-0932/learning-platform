"""
Crew-style job discovery: three portal "agents" run in sequence, results merge, rank by skills, then Gemini summary.

The `crewai` PyPI package requires Python <3.14; this project uses a small in-process orchestration so it works on 3.14+.
Swap in the official CrewAI SDK when your runtime is Python 3.10–3.13 and add `crewai` to requirements.
"""
import json
from typing import Any

from api.utils.job_search_serp import fetch_portal_jobs, rank_by_skills, search_capability_message


class PortalResearchAgent:
    """Single-portal researcher (LinkedIn / Naukri / Glassdoor via search index)."""

    def __init__(self, display_name: str, portal_key: str):
        self.display_name = display_name
        self.portal_key = portal_key

    def run(self, target_role: str) -> list[dict[str, Any]]:
        return fetch_portal_jobs(target_role.strip(), self.portal_key)


class JobSearchCrew:
    """
    Orchestrates three researchers + merge. Mirrors a minimal CrewAI workflow without the external SDK.
    """

    def __init__(self, target_role: str):
        self.target_role = target_role
        self.agents = [
            PortalResearchAgent("LinkedIn researcher", "linkedin"),
            PortalResearchAgent("Naukri researcher", "naukri"),
            PortalResearchAgent("Glassdoor researcher", "glassdoor"),
        ]

    def kickoff(self) -> tuple[list[dict[str, Any]], str]:
        """Returns (deduped jobs, short log for debugging/UI)."""
        combined: list[dict[str, Any]] = []
        lines: list[str] = []
        for agent in self.agents:
            rows = agent.run(self.target_role)
            combined.extend(rows)
            lines.append(f"{agent.display_name}: {len(rows)} listings")
        merged_map: dict[str, dict[str, Any]] = {}
        for row in combined:
            u = row.get("url")
            if u and u not in merged_map:
                merged_map[u] = row
        all_jobs = list(merged_map.values())
        log = " · ".join(lines)
        return all_jobs, log


def _gemini_key() -> str:
    raw = __import__("os").getenv("GEMINI_API_KEY", "") or ""
    parts = [k.strip() for k in raw.split(",") if k.strip()]
    return parts[0] if parts else ""


def _summarize_top_matches(target_role: str, skills: list[str], top: list[dict[str, Any]]) -> str | None:
    if not top:
        return None
    try:
        from api.utils.gemini import call_gemini_with_retry

        payload = json.dumps(
            [{"title": t.get("title"), "portal": t.get("portal"), "snippet": t.get("snippet")} for t in top],
            ensure_ascii=False,
        )
        skills_text = ", ".join(skills) if skills else "not specified"
        prompt = (
            "You are assisting a learner on SKILLSPHERE, a career learning platform. "
            f"Target role: {target_role}. User skills: {skills_text}.\n"
            f"Here are the top 6 job listings ranked for skill fit (JSON): {payload}\n\n"
            "Write 2–4 short sentences summarizing how these roles align with the user's skills and target path, "
            "and what they should verify on the employer site before applying. "
            "Do not invent company names, salaries, or URLs."
        )
        out = call_gemini_with_retry(prompt)
        if isinstance(out, dict) and out.get("error"):
            return None
        return str(out).strip()[:1500]
    except Exception as e:
        print(f"Summary generation failed: {e}")
        return None


def run_job_search_with_crew(target_role: str, skills: list[str]) -> dict[str, Any]:
    cap = search_capability_message()
    if cap:
        return {
            "jobs": [],
            "top_matches": [],
            "summary": None,
            "crew_output": None,
            "config_hint": cap,
        }

    crew = JobSearchCrew(target_role)
    all_jobs, crew_log = crew.kickoff()
    top = rank_by_skills(all_jobs, skills, 6)
    summary = _summarize_top_matches(target_role, skills, top) if _gemini_key() else None

    return {
        "jobs": all_jobs,
        "top_matches": top,
        "summary": summary,
        "crew_output": crew_log,
        "config_hint": None,
    }
