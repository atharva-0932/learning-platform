import { assertJobReadyApiAccess } from '@/lib/server/job-ready-api-guard'
import { NextResponse } from 'next/server'

export const maxDuration = 120

type Body = {
  sessionId?: string
  /** When true, ignore cached analysis_report and regenerate. */
  force?: boolean
}

/** Omit empty `{}` / `[]` sentinels so the dialog only shows real metadata. */
function pickStructuredForUi(raw: unknown): unknown | null {
  if (raw == null) return null
  if (typeof raw !== 'object') return raw
  if (Array.isArray(raw)) return raw.length > 0 ? raw : null
  return Object.keys(raw as object).length > 0 ? raw : null
}

function offlineChecklist(transcript: string, targetRole: string): string {
  return [
    '## Interview report (offline mode)',
    '',
    'Set a valid **GROQ_API_KEY** or **GOOGLE_API_KEY** for AI coaching. Until then, use this checklist:',
    '',
    '### Structure',
    '- Did answers follow Situation → Task → Action → Result where appropriate?',
    '- Were openings and closings clear?',
    '',
    '### Role fit (' + targetRole + ')',
    '- Did you tie examples to responsibilities typical for this role?',
    '',
    '### Communication',
    '- Pace, specificity, metrics — note one upgrade per area.',
    '',
    '_Transcript stored securely; length: ' + transcript.length + ' characters._',
  ].join('\n')
}

function coachSystemPrompt(targetRole: string): string {
  return [
    'You are an elite, ruthless interview coach and hiring-panel realist.',
    'Produce a brutally honest, high-signal report for a mock interview candidate.',
    'Target role: ' + targetRole + '.',
    '',
    'Tone rules (non-negotiable):',
    '- Be extremely blunt. No fluff, no soft landing, no motivational filler.',
    '- Call out weak answers, vague claims, missing metrics, rambling, and fake confidence by name.',
    '- Assume the candidate wants to get hired — kindness without clarity wastes their time.',
    '- Still be professional: no insults about identity/appearance; attack the performance only.',
    '- Prefer concrete verdicts (“Would not advance”, “Borderline reject”) over vague praise.',
    '',
    'Use clear Markdown headings exactly as below (no preamble):',
    '## Brutal verdict',
    '## What would get you rejected',
    '## What barely worked (if anything)',
    '## Gaps and risks',
    '## How to improve (prioritized, no excuses)',
    '## Practice plan (next 7 days) — hard mode',
    '## Role-specific kill criteria (' + targetRole + ')',
    '',
    'Under "Brutal verdict": one paragraph with hire / no-hire / borderline, and why a real interviewer would decide that.',
    'Under "What would get you rejected": bullet the concrete failure modes from THIS transcript.',
    'Under "How to improve": numbered, actionable fixes; rewrite weak answers into stronger STAR versions where useful.',
    'Be specific: reference themes from the transcript without quoting long verbatim chunks.',
    'If the performance was strong, say so briefly — then raise the bar and name what still is not elite.',
  ].join('\n')
}

async function reportWithGroq(transcript: string, targetRole: string, key: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: coachSystemPrompt(targetRole) },
        {
          role: 'user',
          content: 'Mock interview transcript:\n\n' + transcript.slice(0, 28000),
        },
      ],
      temperature: 0.35,
      max_tokens: 2500,
    }),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Groq error ${res.status}: ${t.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Empty report from Groq')
  return text
}

async function reportWithGemini(transcript: string, targetRole: string, key: string): Promise<string> {
  const models = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']
  let lastErr = 'Gemini failed'
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: coachSystemPrompt(targetRole) }] },
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Mock interview transcript:\n\n' + transcript.slice(0, 28000) }],
          },
        ],
        generationConfig: { temperature: 0.35, maxOutputTokens: 2500 },
      }),
    })
    if (!res.ok) {
      lastErr = `Gemini ${model} error ${res.status}: ${(await res.text()).slice(0, 200)}`
      continue
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('')?.trim()
    if (text) return text
    lastErr = `Empty report from Gemini (${model})`
  }
  throw new Error(lastErr)
}

/** Groq first, then Gemini — so analysis still works if GROQ_API_KEY is expired. */
async function buildDetailedReport(transcript: string, targetRole: string): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY?.trim()
  const geminiKey =
    process.env.GOOGLE_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim() || ''

  if (!groqKey && !geminiKey) {
    return offlineChecklist(transcript, targetRole)
  }

  if (groqKey) {
    try {
      return await reportWithGroq(transcript, targetRole, groqKey)
    } catch (e) {
      console.warn('[mock-interview/analyze] Groq failed, trying Gemini:', e)
      if (!geminiKey) throw e
    }
  }

  return reportWithGemini(transcript, targetRole, geminiKey)
}

type SessionRow = {
  id: string
  user_id: string
  target_role: string
  transcript: string
  analysis_report: string | null
  vapi_call_id: string | null
  vapi_structured_output: unknown | null
}

/**
 * Loads transcript from DB (server-only), generates or returns cached Groq coaching report.
 * Response never includes the transcript.
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

  const sessionId = (body.sessionId ?? '').trim()
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  const { data: row, error: fetchError } = await supabase
    .from('mock_interview_sessions')
    .select(
      'id, user_id, target_role, transcript, analysis_report, vapi_call_id, vapi_structured_output',
    )
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !row) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const r = row as SessionRow
  const force = body.force === true

  if (!force && r.analysis_report?.trim()) {
    return NextResponse.json({
      report: r.analysis_report,
      structured: pickStructuredForUi(r.vapi_structured_output),
      cached: true,
      targetRole: r.target_role,
    })
  }

  try {
    const report = await buildDetailedReport(r.transcript, r.target_role)

    const { error: upError } = await supabase
      .from('mock_interview_sessions')
      .update({
        analysis_report: report,
        vapi_structured_output: {} as object,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)

    if (upError) {
      return NextResponse.json({ error: upError.message }, { status: 500 })
    }

    return NextResponse.json({
      report,
      structured: null,
      cached: false,
      targetRole: r.target_role,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Report generation failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
