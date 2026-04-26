"use client"

import { ConversationProvider, useConversation } from "@elevenlabs/react"
import { Mic, MicOff } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface VoiceAgentProps {
  agentId: string
  /**
   * Optional company / compliance context. When provided, it's forwarded to the
   * agent as a dynamic variable named `compliance_id` so the system prompt can
   * reference it and the server tool can scope its lookup to that company.
   */
  complianceId?: string
}

/**
 * Drop-in voice tutor. Embed inside a popover, drawer, or page.
 *
 *   <VoiceAgent
 *     agentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!}
 *     complianceId={params.id}
 *   />
 *
 * The agent itself (system prompt, voice, server tool) is configured once in
 * the ElevenLabs dashboard. See docs/voice-agent.md.
 */
export function VoiceAgent({ agentId, complianceId }: VoiceAgentProps) {
  return (
    <ConversationProvider
      onConnect={() => console.info("[voice-agent] connected")}
      onDisconnect={() => console.info("[voice-agent] disconnected")}
      onError={(err) => console.error("[voice-agent] error:", err)}
    >
      <VoiceAgentControls agentId={agentId} complianceId={complianceId} />
    </ConversationProvider>
  )
}

function VoiceAgentControls({ agentId, complianceId }: VoiceAgentProps) {
  const conversation = useConversation()
  const { status, isSpeaking, startSession, endSession } = conversation
  const [error, setError] = useState<string | null>(null)

  const isConnected = status === "connected"
  const isConnecting = status === "connecting"

  const handleStart = async () => {
    setError(null)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError("Microphone access is required to talk to the tutor.")
      return
    }
    try {
      await startSession({
        agentId,
        dynamicVariables: {
          compliance_id: complianceId ?? "general",
        },
      })
    } catch (err) {
      setError(`Could not start the agent: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const statusLine = (() => {
    if (isConnecting) return "Connecting…"
    if (!isConnected) return "Tap to start"
    return isSpeaking ? "Tutor speaking…" : "Listening…"
  })()

  const dotColor = (() => {
    if (isSpeaking) return "var(--positive)"
    if (isConnected) return "var(--accent)"
    if (isConnecting) return "var(--secondary)"
    return "var(--muted)"
  })()

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${isConnected && isSpeaking ? "animate-pulse" : ""} ${
            isConnecting ? "animate-pulse" : ""
          }`}
          style={{ background: dotColor }}
        />
        <span style={{ fontWeight: 500 }}>{statusLine}</span>
      </div>

      {isConnected ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => void endSession()}
          className="inline-flex items-center gap-2"
        >
          <MicOff className="size-4" aria-hidden="true" />
          <span>End conversation</span>
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleStart}
          disabled={isConnecting}
          className="inline-flex items-center gap-2"
        >
          <Mic className="size-4" aria-hidden="true" />
          <span>{isConnecting ? "Connecting…" : "Talk to your tutor"}</span>
        </Button>
      )}

      {error && (
        <p
          role="alert"
          className="max-w-xs text-center text-xs"
          style={{ color: "var(--negative, #b91c1c)" }}
        >
          {error}
        </p>
      )}

      <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
        Voice answers come from your company's compliance docs.
      </p>
    </div>
  )
}
