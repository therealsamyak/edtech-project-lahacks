import { ShieldCheck } from "lucide-react"
import { SignOutButton } from "@/components/SignOutButton"
import { AuthGuard } from "@/components/AuthGuard"

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-line bg-surface">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center bg-accent text-surface"
                aria-hidden="true"
              >
                <ShieldCheck className="size-5" />
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

            <SignOutButton />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full">{children}</main>

        <footer className="max-w-6xl mx-auto px-6 py-8 mt-8 w-full border-t border-line">
          <div className="flex flex-wrap items-center justify-between gap-3 eyebrow">
            <span>&copy; 2026 CompliLearn</span>
            <span>Privacy &middot; Terms &middot; Accessibility</span>
          </div>
        </footer>
      </div>
    </AuthGuard>
  )
}
