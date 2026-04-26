"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Mic, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VoiceAgent } from "@/components/VoiceAgent"

/**
 * Floating "Talk to tutor" button that opens a panel with the live voice agent.
 *
 * Mirrors AssistantPopover's pattern (chat) but for spoken interaction. Reads the
 * agent ID from `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`; if the user is on a training
 * page, the document UUID from the URL is forwarded to the agent as a dynamic
 * variable so its responses can be document-scoped.
 *
 * Setup is a one-time dashboard step — see docs/voice-agent.md.
 */
export function VoiceAgentPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
  const params = useParams<{ id?: string }>()
  const complianceId = typeof params?.id === "string" ? params.id : undefined

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen])

  return (
    <>
      <Button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-44 z-40 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-3 inline-flex items-center gap-2 shadow-lg"
        aria-label="Open voice tutor"
        aria-expanded={isOpen}
        aria-controls="voice-agent-panel"
      >
        <Mic className="size-4" aria-hidden="true" />
        <span>Talk to tutor</span>
      </Button>

      {isOpen && (
        <div
          id="voice-agent-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="voice-agent-heading"
          className="fixed bottom-6 right-44 z-50 flex flex-col rounded-lg border border-line bg-surface shadow-lg"
          style={{
            width: "min(320px, calc(100vw - 2rem))",
            padding: "1rem",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mic className="size-4" style={{ color: "var(--accent)" }} aria-hidden="true" />
              <h3
                id="voice-agent-heading"
                className="font-display m-0"
                style={{ fontSize: "0.95rem", fontWeight: 500 }}
              >
                Voice tutor
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setIsOpen(false)
                triggerRef.current?.focus()
              }}
              aria-label="Close voice tutor"
            >
              <X className="size-4" />
            </Button>
          </div>

          {agentId ? (
            <VoiceAgent agentId={agentId} complianceId={complianceId} />
          ) : (
            <div className="text-sm" style={{ color: "var(--ink-soft)" }}>
              <p className="mb-2" style={{ fontWeight: 500 }}>
                Voice tutor not configured
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Set <code>NEXT_PUBLIC_ELEVENLABS_AGENT_ID</code> in <code>.env.local</code>. Setup
                steps in <code>docs/voice-agent.md</code>.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
