"use client"

import { useEffect, useRef, useState } from "react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Bot, Send, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Message = { role: "user" | "assistant"; content: string }

export function AssistantPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const chat = useAction(api.assistant.chat)

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userText = input
    setMessages((prev) => [...prev, { role: "user", content: userText }])
    setInput("")
    setIsLoading(true)

    try {
      const response = await chat({ message: userText })
      setMessages((prev) => [...prev, { role: "assistant", content: response }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-3 inline-flex items-center gap-2 shadow-lg"
        aria-label="Open training assistant"
        aria-expanded={isOpen}
        aria-controls="assistant-panel"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        <span>Ask assistant</span>
      </Button>

      {isOpen && (
        <div
          id="assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-heading"
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-lg border border-line bg-surface shadow-lg"
          style={{
            width: "min(380px, calc(100vw - 2rem))",
            height: "min(520px, calc(100vh - 6rem))",
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
                setIsOpen(false)
                triggerRef.current?.focus()
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
                    …
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
