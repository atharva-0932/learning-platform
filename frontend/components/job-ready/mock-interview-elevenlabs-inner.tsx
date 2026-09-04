'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ConversationProvider,
  useConversation,
} from '@elevenlabs/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, PhoneOff, Loader2, Mic } from 'lucide-react'
import { buildElevenLabsSessionExtras } from '@/lib/job-ready/elevenlabs-assistant-overrides'
import { toast } from 'sonner'

function normalizeRoleForTranscript(roleRaw: string): string {
  const r = roleRaw.trim().toLowerCase()
  if (r === 'user' || r === 'customer' || r === 'caller' || r === 'human') return 'user'
  if (r === 'assistant' || r === 'bot' || r === 'agent' || r === 'ai' || r === 'interviewer') {
    return 'assistant'
  }
  return roleRaw.trim() || 'assistant'
}

function appendMessageToTranscript(prev: string, payload: { message?: string; role?: string; source?: string }): string {
  const content = (payload.message ?? '').trim()
  if (!content) return prev
  const role = normalizeRoleForTranscript(payload.role || payload.source || 'assistant')
  return prev + `${role}: ${content}` + '\n\n'
}

function InterviewControls({
  targetRole,
  agentId,
  onCallStart,
  onInterviewSaved,
  onSaveFailed,
}: {
  targetRole: string
  agentId: string
  onCallStart?: () => void
  onInterviewSaved?: (sessionId: string) => void
  onSaveFailed?: (message: string) => void
}) {
  const [starting, setStarting] = useState(false)
  const [saving, setSaving] = useState(false)
  const transcriptRef = useRef('')
  const conversationIdRef = useRef<string | null>(null)
  const targetRoleRef = useRef(targetRole)
  const agentIdRef = useRef(agentId)
  const onCallStartRef = useRef(onCallStart)
  const onInterviewSavedRef = useRef(onInterviewSaved)
  const onSaveFailedRef = useRef(onSaveFailed)
  const savingLockRef = useRef(false)

  useEffect(() => {
    targetRoleRef.current = targetRole
  }, [targetRole])
  useEffect(() => {
    agentIdRef.current = agentId
  }, [agentId])
  useEffect(() => {
    onCallStartRef.current = onCallStart
  }, [onCallStart])
  useEffect(() => {
    onInterviewSavedRef.current = onInterviewSaved
  }, [onInterviewSaved])
  useEffect(() => {
    onSaveFailedRef.current = onSaveFailed
  }, [onSaveFailed])

  const saveInterview = useCallback(async () => {
    if (savingLockRef.current) return
    const t = transcriptRef.current.trim()
    const role = targetRoleRef.current.trim()
    if (!t || !role) {
      if (!t) {
        onSaveFailedRef.current?.(
          'No transcript captured. Allow microphone access and speak during the interview, then try again.',
        )
      }
      return
    }

    savingLockRef.current = true
    setSaving(true)
    try {
      const res = await fetch('/api/job-ready/mock-interview/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          transcript: t,
          targetRole: role,
          elevenlabsAgentId: agentIdRef.current,
          elevenlabsConversationId: conversationIdRef.current,
        }),
      })
      const json = (await res.json()) as { sessionId?: string; error?: string }
      if (!res.ok) {
        throw new Error(json.error ?? 'Could not save interview')
      }
      if (json.sessionId) {
        onInterviewSavedRef.current?.(json.sessionId)
      }
    } catch (e) {
      onSaveFailedRef.current?.(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
      savingLockRef.current = false
    }
  }, [])

  const conversation = useConversation({
    onConnect: ({ conversationId }) => {
      if (conversationId) conversationIdRef.current = conversationId
      setStarting(false)
      onCallStartRef.current?.()
    },
    onDisconnect: () => {
      setStarting(false)
      void saveInterview()
    },
    onMessage: (message) => {
      transcriptRef.current = appendMessageToTranscript(transcriptRef.current, message)
    },
    onError: (message, context) => {
      console.error('ElevenLabs conversation error', message, context)
      setStarting(false)
      toast.error(typeof message === 'string' ? message : 'Voice interview error')
    },
  })

  const active = conversation.status === 'connected'
  const busy = starting || conversation.status === 'connecting' || saving

  const start = useCallback(async () => {
    const role = targetRoleRef.current.trim()
    if (!role) {
      toast.error('Set your target role first')
      return
    }
    setStarting(true)
    transcriptRef.current = ''
    conversationIdRef.current = null
    savingLockRef.current = false
    try {
      const extras = buildElevenLabsSessionExtras(role)
      const conversationId = await conversation.startSession({
        agentId: agentIdRef.current,
        connectionType: 'webrtc',
        ...(extras?.dynamicVariables ? { dynamicVariables: extras.dynamicVariables } : {}),
        ...(extras?.overrides ? { overrides: extras.overrides } : {}),
      })
      if (typeof conversationId === 'string' && conversationId) {
        conversationIdRef.current = conversationId
      }
    } catch (e) {
      console.error(e)
      setStarting(false)
      toast.error(e instanceof Error ? e.message : 'Could not start interview')
    }
  }, [conversation])

  const stop = useCallback(async () => {
    try {
      await conversation.endSession()
    } catch (e) {
      console.error(e)
    }
  }, [conversation])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {!active ? (
          <Button type="button" onClick={() => void start()} disabled={busy || !targetRole} size="sm">
            {starting || conversation.status === 'connecting' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Phone className="size-4" />
            )}
            Start mock interview
          </Button>
        ) : (
          <Button type="button" variant="destructive" size="sm" onClick={() => void stop()} disabled={saving}>
            <PhoneOff className="size-4" />
            End call
          </Button>
        )}
        {active && (
          <Badge variant="secondary" className="animate-pulse gap-1">
            <Mic className="size-3" />
            Live
          </Badge>
        )}
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Saving interview…
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Voice interview via ElevenLabs Agents. Allow microphone access when prompted.
      </p>
    </div>
  )
}

export function MockInterviewElevenLabsInner(props: {
  targetRole: string
  agentId: string
  onCallStart?: () => void
  onInterviewSaved?: (sessionId: string) => void
  onSaveFailed?: (message: string) => void
}) {
  return (
    <ConversationProvider>
      <InterviewControls {...props} />
    </ConversationProvider>
  )
}
