"""
SkillCrew bridge to the real CrewAI package (Agent / Task definitions).

Production LLM execution does NOT use CrewAI's default kickoff loop (that would
rewrite prompts and break Groq → Gemini JSON parity). Instead:

    agent = Agent(role="...", goal="...", backstory="...")   # real crewai.Agent
    task  = Task(description="...", expected_output="...", agent=agent, temperature=0.35)
    crew  = Crew(agents=[agent], tasks=[task])
    result = crew.kickoff(llm_kw={...})  # SkillCrew kickoff → llm_generate_json

Requires: Python >=3.10,<3.14 and the ``crewai`` package.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any

# Keep CrewAI's on-disk cache inside the backend tree (avoids permission issues
# when the process cwd name would otherwise map under Application Support).
_storage = Path(__file__).resolve().parent / ".crewai_storage"
_storage.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("CREWAI_STORAGE_DIR", str(_storage))

from crewai import Agent as CrewAIAgent  # noqa: E402
from crewai import Task as CrewAITask  # noqa: E402

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Agent — thin wrapper over crewai.Agent
# ---------------------------------------------------------------------------

class Agent:
    """
    SkillCrew Agent backed by ``crewai.Agent``.

    Preserves ``system_instruction()`` used by SkillCrew's kickoff so prompts
    stay identical to the pre-migration compat layer. Pass ``system_prompt`` to
    use a verbatim system string (e.g. Coach) instead of role/goal/backstory.
    """

    def __init__(
        self,
        *,
        role: str,
        goal: str,
        backstory: str,
        verbose: bool = False,
        system_prompt: str | None = None,
        **kwargs: Any,
    ) -> None:
        self.role = role
        self.goal = goal
        self.backstory = backstory
        self.verbose = verbose
        self._system_prompt = system_prompt
        # Real CrewAI agent (framework identity). LLM execution stays in Crew.kickoff.
        self.crewai_agent: CrewAIAgent = CrewAIAgent(
            role=role,
            goal=goal,
            backstory=backstory,
            verbose=verbose,
            **kwargs,
        )

    def system_instruction(self) -> str:
        """Build the system-level prompt (verbatim override or role + goal + backstory)."""
        if self._system_prompt is not None:
            return self._system_prompt
        return (
            f"You are {self.role}.\n"
            f"Goal: {self.goal}\n\n"
            f"{self.backstory}"
        )


# ---------------------------------------------------------------------------
# Task — thin wrapper over crewai.Task (+ SkillCrew temperature)
# ---------------------------------------------------------------------------

class Task:
    """
    SkillCrew Task backed by ``crewai.Task``.

    ``temperature`` is a SkillCrew extension used by our kickoff (not passed to
    CrewAI's default executor).
    """

    def __init__(
        self,
        *,
        description: str,
        expected_output: str,
        agent: Agent,
        temperature: float = 0.35,
    ) -> None:
        self.description = description
        self.expected_output = expected_output
        self.agent = agent
        self.temperature = temperature
        self.crewai_task: CrewAITask = CrewAITask(
            description=description,
            expected_output=expected_output,
            agent=agent.crewai_agent,
        )

    def _build_user_prompt(self, inputs: dict[str, Any] | None) -> str:
        parts = [self.description]
        if inputs:
            parts.append("\n\nContext / Inputs:\n" + json.dumps(inputs, ensure_ascii=False, indent=2))
        if self.expected_output:
            parts.append(f"\n\nReturn format: {self.expected_output}")
        return "\n".join(parts)


# ---------------------------------------------------------------------------
# Crew — SkillCrew kickoff (llm_generate_json), not crewai.Crew.kickoff
# ---------------------------------------------------------------------------

class Crew:
    """
    Sequential SkillCrew executor.

    Uses the same prompt assembly + ``llm_generate_json`` (Groq → Gemini) as
    before so JSON shapes and routing stay identical. Does not call
    ``crewai.Crew.kickoff``.
    """

    def __init__(
        self,
        *,
        agents: list[Agent],
        tasks: list[Task],
        verbose: bool = False,
    ) -> None:
        self.agents = agents
        self.tasks = tasks
        self.verbose = verbose

    def kickoff(
        self,
        inputs: dict[str, Any] | None = None,
        llm_kw: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Execute all tasks in order via llm_generate_json.

        Parameters
        ----------
        inputs : Optional dict injected into every task's user prompt.
        llm_kw : LLM credentials forwarded to llm_generate_json.
                 Keys: groq_api_key, groq_model, google_api_key, gemini_model.

        Returns
        -------
        The JSON result of the final task.
        """
        from llm_client import llm_generate_json  # local import — avoids circular deps

        kw = llm_kw or {}
        result: dict[str, Any] = {}

        for task in self.tasks:
            sys_instr = task.agent.system_instruction()
            user_prompt = task._build_user_prompt(inputs)

            if task.agent.verbose or self.verbose:
                logger.info(
                    "[CrewAI/SkillCrew] Running task for agent=%r  temperature=%.2f",
                    task.agent.role,
                    task.temperature,
                )

            result = llm_generate_json(
                groq_api_key=kw.get("groq_api_key"),
                groq_model=kw.get("groq_model", "llama-3.3-70b-versatile"),
                google_api_key=kw.get("google_api_key"),
                gemini_model=kw.get("gemini_model", "gemini-2.0-flash"),
                system_instruction=sys_instr,
                user_prompt=user_prompt,
                temperature=task.temperature,
            )

            if task.agent.verbose or self.verbose:
                logger.info(
                    "[CrewAI/SkillCrew] Task complete for agent=%r  result_keys=%s",
                    task.agent.role,
                    list(result.keys()) if isinstance(result, dict) else type(result).__name__,
                )

        return result
