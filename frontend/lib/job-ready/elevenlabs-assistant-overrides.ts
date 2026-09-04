/**
 * Per-call ElevenLabs Agents personalization for the mock interviewer.
 *
 * In the ElevenLabs Agents dashboard:
 * - Add dynamic variables: {{targetRole}}, {{role}}, {{jobTitle}}
 * - Enable Overrides → first message (and prompt if you override it) under Security
 *
 * @see https://elevenlabs.io/docs/eleven-agents/customization/personalization/dynamic-variables
 * @see https://elevenlabs.io/docs/eleven-agents/customization/personalization/overrides
 */

export type ElevenLabsSessionExtras = {
  dynamicVariables: Record<string, string>
  overrides: {
    agent: {
      firstMessage: string
    }
  }
}

export function buildElevenLabsSessionExtras(targetRole: string): ElevenLabsSessionExtras | undefined {
  const role = targetRole.trim()
  if (!role) return undefined

  return {
    dynamicVariables: {
      targetRole: role,
      TargetRole: role,
      role,
      jobTitle: role,
      position: role,
      job_title: role,
      jobRole: role,
    },
    overrides: {
      agent: {
        firstMessage: `Hi — I'm your interviewer for the ${role} role today. When you're ready, give me a short overview of your background and what you want to focus on in this practice session.`,
      },
    },
  }
}
