import { getBackendUrl } from '@/lib/backend-url'

import { proxyAgent, readProxyAgentError } from '@/lib/server/agent-backend-proxy'

const POLL_INTERVAL_MS = 800
const POLL_MAX_MS = 480_000

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/** Response from `GET /internal/agents/archie/roadmap/jobs/:job_id` */
type RoadmapJobRow = {
  job_id?: string
  status?: string
  result_bundle?: Record<string, unknown>
  error_message?: string | null
}

async function proxyAgentAuthorizedGet(url: string): Promise<Response> {
  const secret = process.env.BACKEND_AGENT_SECRET?.trim().replace(/^["']|["']$/g, '').trim() ?? ''
  if (!secret) {
    return new Response(
      JSON.stringify({
        error:
          'BACKEND_AGENT_SECRET is not set for Next.js. Add it to frontend/.env.local (same value as backend/.env).',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    )
  }
  return fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-Agent-Secret': secret,
    },
    cache: 'no-store',
  })
}

async function pollArchieRoadmapBundle(job_id: string): Promise<Record<string, unknown>> {
  const base = getBackendUrl()
  const started = Date.now()
  while (Date.now() - started < POLL_MAX_MS) {
    const stRes = await proxyAgentAuthorizedGet(`${base}/internal/agents/archie/roadmap/jobs/${encodeURIComponent(job_id)}`)
    if (!stRes.ok) {
      throw new Error(await readProxyAgentError(stRes))
    }
    const row = (await stRes.json()) as RoadmapJobRow
    if (row.status === 'completed') {
      const bundle = row.result_bundle
      if (bundle && typeof bundle === 'object') {
        return bundle as Record<string, unknown>
      }
      throw new Error('Roadmap job completed but result_bundle is missing')
    }
    if (row.status === 'failed') {
      throw new Error(row.error_message || 'Roadmap generation failed')
    }
    await sleep(POLL_INTERVAL_MS)
  }
  throw new Error('Roadmap generation timed out waiting for worker')
}

/**
 * Enqueue Archie roadmap generation (SQS) and block until the worker writes `result_bundle`.
 * Use from Next.js server routes that previously expected a synchronous Python response.
 */
export async function enqueueArchieRoadmapAndAwaitBundle(opts: {
  context: Record<string, unknown>
  userId?: string | null
}): Promise<Record<string, unknown>> {
  const res = await proxyAgent('/archie/roadmap', {
    context: opts.context,
    ...(opts.userId ? { user_id: opts.userId } : {}),
  })
  if (!res.ok) {
    throw new Error(await readProxyAgentError(res))
  }

  if (res.status === 202) {
    const body = (await res.json()) as { job_id?: string }
    const jobId = body.job_id
    if (!jobId) {
      throw new Error('Expected job_id in 202 response from backend')
    }
    return pollArchieRoadmapBundle(jobId)
  }

  return (await res.json()) as Record<string, unknown>
}
