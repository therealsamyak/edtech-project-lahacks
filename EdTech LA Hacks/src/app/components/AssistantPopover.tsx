import { useEffect, useRef, useState } from "react"
import { Bot, Send, X, MessageCircle } from "lucide-react"

export function AssistantPopover() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [history, setHistory] = useState<Array<{ role: "user" | "assistant"; message: string }>>([])
  const panelRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setHistory((h) => [
      ...h,
      { role: "user", message },
      {
        role: "assistant",
        message:
          "Based on your policy, the key principles are transparency, accountability, and appropriate data handling — see section 2.3 for full requirements.",
      },
    ])
    setMessage("")
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 btn btn-accent elev-md"
        style={{ borderRadius: 999, paddingInline: "1rem", paddingBlock: "0.75rem" }}
        aria-label="Open training assistant"
        aria-expanded={open}
        aria-controls="assistant-panel"
      >
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
        <span>Ask assistant</span>
      </button>

      {open && (
        <div
          id="assistant-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-heading"
          className="fixed bottom-6 right-6 z-50 card elev-md flex flex-col reveal"
          style={{
            width: "min(380px, calc(100vw - 2rem))",
            height: "min(520px, calc(100vh - 6rem))",
          }}
        >
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" style={{ color: "var(--accent)" }} aria-hidden="true" />
              <h3
                id="assistant-heading"
                className="font-display m-0"
                style={{ fontSize: "0.95rem", fontWeight: 500 }}
              >
                Training assistant
              </h3>
            </div>
            <button
              onClick={() => {
                setOpen(false)
                triggerRef.current?.focus()
              }}
              className="btn btn-ghost p-1.5"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto px-4 py-3"
            style={{ background: "var(--paper)" }}
            aria-live="polite"
          >
            {history.length === 0 ? (
              <div className="text-center py-8">
                <div className="font-display mb-1" style={{ fontSize: "1rem", fontWeight: 500 }}>
                  How can I help?
                </div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Ask anything about your training material.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-md px-3 py-2 text-sm max-w-[90%]"
                    style={{
                      background: m.role === "user" ? "var(--accent)" : "var(--surface)",
                      color: m.role === "user" ? "var(--surface)" : "var(--ink)",
                      marginLeft: m.role === "user" ? "auto" : 0,
                      border: m.role === "assistant" ? "1px solid var(--line)" : "none",
                    }}
                  >
                    {m.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="border-t p-3 flex gap-2"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          >
            <label htmlFor="assistant-input" className="sr-only">
              Ask a question
            </label>
            <input
              id="assistant-input"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question…"
              className="field"
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-accent shrink-0"
              aria-label="Send"
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
