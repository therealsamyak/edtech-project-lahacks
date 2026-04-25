import { useState } from "react"
import { ShieldCheck, ArrowRight } from "lucide-react"

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin()
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: "var(--paper)" }}>
      {/* Left — quiet brand panel */}
      <aside
        className="hidden lg:flex flex-col justify-between px-12 py-12 border-r"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center"
            style={{ background: "var(--accent)", color: "var(--surface)" }}
            aria-hidden="true"
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
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

        <div className="eyebrow">SOC 2 · GDPR · HIPAA aware</div>
      </aside>

      {/* Right — sign in */}
      <div className="flex items-center justify-center px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm card elev-md p-8"
          aria-label="Sign in"
        >
          <div className="mb-6">
            <div className="eyebrow mb-2">Sign in</div>
            <h2 className="font-display" style={{ fontWeight: 500 }}>
              Welcome back.
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Use your administrator account to continue.
            </p>
          </div>

          <div className="space-y-4">
            <Field label="Work email" htmlFor="email">
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                placeholder="you@company.com"
              />
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              extra={
                <a href="#" className="text-xs" style={{ color: "var(--accent)" }}>
                  Forgot?
                </a>
              }
            >
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
                placeholder="••••••••"
              />
            </Field>

            <button type="submit" className="btn btn-primary w-full mt-2">
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <p className="text-xs mt-6 text-center" style={{ color: "var(--muted)" }}>
            Need an account? Contact your administrator.
          </p>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  extra,
  children,
}: {
  label: string
  htmlFor: string
  extra?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={htmlFor} className="text-sm" style={{ color: "var(--ink)" }}>
          {label}
        </label>
        {extra}
      </div>
      {children}
    </div>
  )
}
