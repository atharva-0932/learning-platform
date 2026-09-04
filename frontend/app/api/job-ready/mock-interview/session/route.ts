import { assertJobReadyApiAccess } from '@/lib/server/job-ready-api-guard'
import { NextResponse } from 'next/server'

export const maxDuration = 60

type Body = {
  transcript?: string
  targetRole?: string
  /** ElevenLabs agent id (preferred). */
  elevenlabsAgentId?: string | null
  /** ElevenLabs conversation id (preferred). */
  elevenlabsConversationId?: string | null
  /** Legacy Vapi field names — still accepted and stored in the same DB columns. */
  vapiAssistantId?: string | null
  vapiCallId?: string | null
}

/**
 * Persist transcript after an ElevenLabs (or legacy) voice call.
 * Does not return transcript text to the client.
 *
 * DB columns remain `vapi_assistant_id` / `vapi_call_id` for compatibility;
 * they now store ElevenLabs agent / conversation ids.
 */
export async function POST(req: Request) {
  const access = await assertJobReadyApiAccess()
  if (access instanceof NextResponse) return access
  const { supabase, user } = access

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const transcript = (body.transcript ?? '').trim()
  const targetRole = (body.targetRole ?? '').trim()
  if (!transcript || !targetRole) {
    return NextResponse.json({ error: 'transcript and targetRole are required' }, { status: 400 })
  }

  const agentId =
    (body.elevenlabsAgentId ?? '').trim() || (body.vapiAssistantId ?? '').trim() || null
  const conversationId =
    (body.elevenlabsConversationId ?? '').trim() || (body.vapiCallId ?? '').trim() || null

  const { data, error } = await supabase
    .from('mock_interview_sessions')
    .insert({
      user_id: user.id,
      target_role: targetRole,
      transcript,
      vapi_assistant_id: agentId,
      vapi_call_id: conversationId,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        hint: 'Ensure the mock_interview_sessions table exists (see supabase/migrations).',
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ sessionId: data.id })
}
