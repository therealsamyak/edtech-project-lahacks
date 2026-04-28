"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function SignIn() {
  const { signIn } = useAuthActions()
  // Re-enabled setFlow to allow switching between modes
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper">
      <aside className="hidden lg:flex flex-col justify-between px-12 py-12 border-r border-line">
        <div className="flex items-center gap-3">
          <div>
            <div
              className="font-display"
              style={{ fontSize: "1.1rem", fontWeight: 500, lineHeight: 1 }}
            >
              CompliLearn
            </div>
            <div className="eyebrow mt-0.5">Compliance training</div>
          </div>
        </div>

        <div className="max-w-md">
          <div className="eyebrow mb-3">— Built for teams</div>
          <h1 className="font-display" style={{ fontWeight: 500 }}>
            Compliance training your people will{" "}
            <em style={{ color: "var(--accent)" }}>actually</em> finish.
          </h1>
          <p className="mt-4">
            Upload your policy documentation. CompliLearn turns it into bite-sized modules,
            knowledge checks, and an AI assistant your team can ask questions to — privately, on
            their own time.
          </p>

          <ul className="mt-8 space-y-2.5 text-sm" style={{ color: "var(--ink-soft)" }}>
            {[
              "AI-generated summaries from your own policies",
              "Per-section quizzes with instant feedback",
              "Voice playback for accessibility",
              "Private chat assistant grounded in your docs",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true" style={{ color: "var(--accent)" }}>
                  —
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="eyebrow">Policy-aware training</div>
      </aside>

      <div className="flex items-center justify-center px-6 py-12">
        <form
          className="w-full max-w-sm card elev-md p-8"
          aria-label={flow === "signIn" ? "Sign in" : "Sign up"}
          onSubmit={(e) => {
            e.preventDefault()
            setLoading(true)
            setError(null)

            const formData = new FormData(e.target as HTMLFormElement)
            formData.set("flow", flow)

            // The signIn function handles both "signIn" and "signUp" flows
            // based on the "flow" entry in formData
            void signIn("password", formData)
              .then(() => {
                window.location.href = "/"
              })
              .catch((err) => {
                setError(err.message)
                setLoading(false)
              })
          }}
        >
          <div className="mb-6">
            <div className="lg:hidden mb-6">
              <div className="font-display text-lg font-medium">CompliLearn</div>
              <div className="eyebrow mt-0.5">Compliance training</div>
            </div>

            <div className="eyebrow mb-2">{flow === "signIn" ? "Sign in" : "Sign up"}</div>
            <h2 className="font-display" style={{ fontWeight: 500 }}>
              {flow === "signIn" ? "Welcome back." : "Create your account."}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {flow === "signIn"
                ? "Use your administrator account to continue."
                : "Set up your account to get started."}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="mb-1.5 text-ink">
                Work email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="h-9 bg-input-background border-line"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-ink">
                  Password
                </Label>
                {flow === "signIn" && (
                  <button
                    type="button"
                    className="text-xs font-medium underline underline-offset-2 hover:no-underline cursor-pointer transition-all"
                    style={{
                      color: "var(--accent)",
                      background: "none",
                      border: "none",
                      padding: 0,
                    }}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete={flow === "signIn" ? "current-password" : "new-password"}
                placeholder="••••••••"
                minLength={8}
                required
                className="h-9 bg-input-background border-line"
              />
              {flow === "signUp" && (
                <p className="text-xs text-muted-foreground mt-1 px-0.5">
                  Password must be at least 8 characters
                </p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? (
                "Loading..."
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>

          {/* Added the toggle button back to the UI */}
          <div className="flex items-center justify-center gap-2 text-sm mt-6">
            <span className="text-muted-foreground">
              {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              className="text-accent font-medium underline underline-offset-2 hover:no-underline cursor-pointer transition-all"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn" ? "Sign up" : "Sign in"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm text-destructive font-medium break-words">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
