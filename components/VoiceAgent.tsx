"use client"

import { ConversationProvider, useConversation } from "@elevenlabs/react"
import { useState } from "react"

/**
 * Voice agent wrapper. Drop into any page that needs the spoken tutor:
 *
 *   <VoiceAgent agentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!} />
 *
 * The agent is configured in the ElevenLabs dashboard (system prompt, voice, server
 * tool pointing at /voice-agent/ask). See docs/voice-agent.md for the full setup.
 */
export function VoiceAgent({ agentId }: { agentId: string }) {
  return (
    <ConversationProvider
      onConnect={() => console.info("[voice-agent] connected")}
      onDisconnect={() => console.info("[voice-agent] disconnected")}
      onError={(err) => console.error("[voice-agent] error:", err)}
    >
      <VoiceAgentControls agentId={agentId} />
    </ConversationProvider>
  )
}

function VoiceAgentControls({ agentId }: { agentId: string }) {
  const conversation = useConversation()
  const { status, isSpeaking, startSession, endSession } = conversation
  const [error, setError] = useState<string | null>(null)

  const isConnected = status === "connected"
  const isConnecting = status === "connecting"

  const handleStart = async () => {
    setError(null)
    try {
      // Browser must have mic permission before the WebRTC connection opens.
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError("Microphone access is required to talk to the tutor.")
      return
    }
    try {
      await startSession({ agentId })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Could not start the agent: ${msg}`)
    }
  }

  const handleEnd = () => {
    void endSession()
  }

  const statusLine = (() => {
    if (isConnecting) return "Connecting…"
    if (!isConnected) return "Idle"
    return isSpeaking ? "Tutor is speaking…" : "Listening to you…"
  })()

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${
            isConnected
              ? isSpeaking
                ? "animate-pulse bg-emerald-500"
                : "bg-sky-500"
              : isConnecting
                ? "animate-pulse bg-amber-500"
                : "bg-slate-400"
          }`}
        />
        <span className="font-medium">{statusLine}</span>
      </div>

      {isConnected ? (
        <button
          type="button"
          onClick={handleEnd}
          className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
        >
          End conversation
        </button>
      ) : (
        <button
          type="button"
          onClick={handleStart}
          disabled={isConnecting}
          className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-600 dark:hover:bg-slate-500"
        >
          {isConnecting ? "Connecting…" : "Talk to your tutor"}
        </button>
      )}

      {error && (
        <p role="alert" className="max-w-xs text-center text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  )
}
