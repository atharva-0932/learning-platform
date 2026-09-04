"""
Lightweight CrewAI-compatible layer for SkillCrew.

Mirrors the CrewAI public API (Agent, Task, Crew, kickoff) but runs on top of
the project's own llm_client.py (Groq → Gemini fallback chain) instead of
requiring the crewai package to be installed.

Usage is identical to real CrewAI:

    agent = Agent(role="...", goal="...", backstory="...")
    task  = Task(description="...", expected_output="...", agent=agent)
    crew  = Crew(agents=[agent], tasks=[task])
    result = crew.kickoff(inputs={...}, llm_kw={...})
"""

from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------

class Agent:
    """
    Mirrors crewai.Agent.

    Attributes
    ----------
    role       : Short label used as the LLM persona header.
    goal       : What this agent is trying to achieve.
    backstory  : Detailed system-level instructions / persona rules.
    verbose    : If True, logs task execution to the Python logger.
    """

    def __init__(
        self,
        *,
        role: str,
        goal: str,
        backstory: str,
        verbose: bool = False,
    ) -> None:
        self.role = role
        self.goal = goal
        self.backstory = backstory
        self.verbose = verbose

    def system_instruction(self) -> str:
        """Build the system-level prompt from role + goal + backstory."""
        return (
            f"You are {self.role}.\n"
            f"Goal: {self.goal}\n\n"
            f"{self.backstory}"
        )


# ---------------------------------------------------------------------------
# Task
# ---------------------------------------------------------------------------

class Task:
    """
    Mirrors crewai.Task.

    Attributes
    ----------
    description     : The user-level prompt / task body.
    expected_output : Describes the shape/format of the return value.
    agent           : The Agent responsible for this task.
    temperature     : LLM temperature override (default 0.35).
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

    def _build_user_prompt(self, inputs: dict[str, Any] | None) -> str:
        parts = [self.description]
        if inputs:
            parts.append("\n\nContext / Inputs:\n" + json.dumps(inputs, ensure_ascii=False, indent=2))
        parts.append(f"\n\nReturn format: {self.expected_output}")
        return "\n".join(parts)


# ---------------------------------------------------------------------------
# Crew
# ---------------------------------------------------------------------------

class Crew:
    """
    Mirrors crewai.Crew.

    Runs tasks sequentially; each task is executed by its assigned Agent using
    llm_generate_json from llm_client.py.

    kickoff() accepts an extra `llm_kw` dict with the LLM credentials:
        {
          "groq_api_key": ...,
          "groq_model":   ...,
          "google_api_key": ...,
          "gemini_model": ...,
        }
    These are passed through to llm_generate_json.
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
        Execute all tasks in order.

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
                    "[Crew] Running task for agent=%r  temperature=%.2f",
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
                    "[Crew] Task complete for agent=%r  result_keys=%s",
                    task.agent.role,
                    list(result.keys()) if isinstance(result, dict) else type(result).__name__,
                )

        return result
