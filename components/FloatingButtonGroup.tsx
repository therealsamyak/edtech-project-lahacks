"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useAction, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Bot, Send, X, MessageCircle, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VoiceAgent } from "@/components/VoiceAgent"
import { LoaderInline } from "@dot-loaders/react"

type Message = { role: "user" | "assistant"; content: string }

export function FloatingButtonGroup() {
  const [chatOpen, setChatOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const chatTriggerRef = useRef<HTMLButtonElement>(null)
  const voiceTriggerRef = useRef<HTMLButtonElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const chat = useAction(api.assistant.chat)

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
  const params = useParams<{ id?: string; moduleId?: string }>()
  const complianceId = typeof params?.id === "string" ? params.id : undefined
  const moduleId = typeof params?.moduleId === "string" ? params.moduleId : undefined

  const moduleData = useQuery(
    api.training.getModule,
    complianceId && moduleId
      ? {
          complianceDocumentId: decodeURIComponent(complianceId),
          moduleTitle: decodeURIComponent(moduleId),
        }
      : "skip",
  )

  const systemContext = moduleData
    ? [moduleData.plainLanguageSummary, ...(moduleData.highlights ?? [])].filter(Boolean).join("\n")
    : undefined

  useEffect(() => {
    if (!chatOpen && !voiceOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (voiceOpen) {
          setVoiceOpen(false)
          voiceTriggerRef.current?.focus()
        }
        if (chatOpen) {
          setChatOpen(false)
          chatTriggerRef.current?.focus()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [chatOpen, voiceOpen])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  const openChat = () => {
    setChatOpen((prev) => {
      if (prev) setMessages([])
      return !prev
    })
    setVoiceOpen(false)
  }
  const openVoice = () => {
    setVoiceOpen((prev) => !prev)
    setChatOpen(false)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userText = input
    setMessages((prev) => [...prev, { role: "user", content: userText }])
    setInput("")
    setIsLoading(true)

    try {
      const response = await chat({
        message: userText,
        complianceDocumentId: complianceId,
        systemContext,
      })
      setMessages((prev) => [...prev, { role: "assistant", content: response }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!moduleId) return null

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <Button
          ref={voiceTriggerRef}
          onClick={openVoice}
          size="icon"
          className={`rounded-full shadow-lg size-12 ${voiceOpen ? "bg-accent/90 ring-2 ring-accent" : "bg-accent text-accent-foreground hover:bg-accent/90"}`}
          aria-label="Open voice tutor"
          aria-expanded={voiceOpen}
          aria-controls="voice-agent-panel"
        >
          <Mic className="size-5" aria-hidden="true" />
        </Button>

        <Button
          ref={chatTriggerRef}
          onClick={openChat}
          size="icon"
          className={`rounded-full shadow-lg size-12 ${chatOpen ? "bg-accent/90 ring-2 ring-accent" : "bg-accent text-accent-foreground hover:bg-accent/90"}`}
          aria-label="Open training assistant"
          aria-expanded={chatOpen}
          aria-controls="assistant-panel"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
        </Button>
      </div>

      {voiceOpen && (
        <div
          id="voice-agent-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="voice-agent-heading"
          className="fixed right-6 z-50 flex flex-col rounded-lg border border-line bg-surface shadow-lg"
          style={{
            width: "min(320px, calc(100vw - 2rem))",
            padding: "1rem",
            bottom: "calc(1.5rem + 3rem + 0.75rem)",
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
                setVoiceOpen(false)
                voiceTriggerRef.current?.focus()
              }}
              aria-label="Close voice tutor"
            >
              <X className="size-4" />
            </Button>
          </div>

          {agentId ? (
            <VoiceAgent
              agentId={agentId}
              complianceId={complianceId}
              moduleContext={systemContext}
            />
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

      {chatOpen && (
        <div
          id="assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-heading"
          className="fixed right-6 z-50 flex flex-col rounded-lg border border-line bg-surface shadow-lg"
          style={{
            width: "min(380px, calc(100vw - 2rem))",
            height: "min(520px, calc(100vh - 6rem))",
            bottom: "calc(1.5rem + 3rem + 0.75rem)",
          }}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-accent" />
              <h3
                id="assistant-heading"
                className="font-display m-0"
                style={{ fontSize: "0.95rem", fontWeight: 500 }}
              >
                Training assistant
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setChatOpen(false)
                setMessages([])
                chatTriggerRef.current?.focus()
              }}
              aria-label="Close assistant"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3"
            style={{ background: "var(--paper)" }}
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-display mb-1" style={{ fontSize: "1rem", fontWeight: 500 }}>
                  How can I help?
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Ask anything about your training material.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className="max-w-[90%] rounded-md px-3 py-2 text-sm"
                    style={{
                      background: m.role === "user" ? "var(--accent)" : "var(--surface)",
                      color: m.role === "user" ? "var(--surface)" : "var(--ink)",
                      marginLeft: m.role === "user" ? "auto" : 0,
                      border: m.role === "assistant" ? "1px solid var(--line)" : "none",
                    }}
                  >
                    {m.content}
                  </div>
                ))}
                {isLoading && (
                  <div
                    className="max-w-[90%] rounded-md px-3 py-2 text-sm"
                    style={{
                      background: "var(--surface)",
                      color: "var(--ink)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <LoaderInline
                      loader="pulse"
                      renderer="svg-grid"
                      style={{ color: "var(--ink-soft)" }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-line p-3"
            style={{ background: "var(--surface)" }}
          >
            <label htmlFor="assistant-input" className="sr-only">
              Ask a question
            </label>
            <Input
              id="assistant-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!input.trim() || isLoading}
              aria-label="Send"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
