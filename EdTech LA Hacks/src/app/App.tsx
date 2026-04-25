import { useState } from "react"
import { LogOut, Building2, GraduationCap, ShieldCheck } from "lucide-react"
import { LoginScreen } from "./components/LoginScreen"
import { RegisterCompany } from "./components/RegisterCompany"
import { ComplianceTraining } from "./components/ComplianceTraining"

type TabType = "register" | "training"

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("register")

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      {/* Skip link for keyboard / screen-reader users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn btn-accent"
      >
        Skip to main content
      </a>

      <header
        className="border-b"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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
                style={{ fontSize: "1.15rem", fontWeight: 500, lineHeight: 1.1 }}
              >
                CompliLearn
              </div>
              <div className="eyebrow mt-0.5">Compliance training platform</div>
            </div>
          </div>

          <button
            onClick={() => setIsLoggedIn(false)}
            className="btn btn-ghost"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main id="main" className="max-w-6xl mx-auto px-6 py-10">
        <nav aria-label="Sections" className="mb-10">
          <div className="inline-flex card p-1" role="tablist" aria-label="Compliance sections">
            <TabButton
              active={activeTab === "register"}
              onClick={() => setActiveTab("register")}
              icon={<Building2 className="w-4 h-4" aria-hidden="true" />}
              label="Register company"
              controls="panel-register"
            />
            <TabButton
              active={activeTab === "training"}
              onClick={() => setActiveTab("training")}
              icon={<GraduationCap className="w-4 h-4" aria-hidden="true" />}
              label="Compliance training"
              controls="panel-training"
            />
          </div>
        </nav>

        <section key={activeTab} id={`panel-${activeTab}`} role="tabpanel" className="reveal">
          {activeTab === "register" ? <RegisterCompany /> : <ComplianceTraining />}
        </section>
      </main>

      <footer
        className="max-w-6xl mx-auto px-6 py-8 mt-8 border-t"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 eyebrow">
          <span>© 2026 CompliLearn</span>
          <span>Privacy · Terms · Accessibility</span>
        </div>
      </footer>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  controls,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  controls: string
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className="px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
      style={{
        background: active ? "var(--ink)" : "transparent",
        color: active ? "var(--surface)" : "var(--ink-soft)",
        fontWeight: active ? 500 : 400,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
