"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, GraduationCap } from "lucide-react"

export default function TabBar() {
  const pathname = usePathname()
  const isTraining = pathname.startsWith("/training")

  return (
    <nav aria-label="Sections" className="mb-10">
      <div className="inline-flex card p-1" role="tablist" aria-label="Compliance sections">
        <Link
          href="/register"
          role="tab"
          aria-selected={!isTraining}
          className="px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
          style={{
            background: !isTraining ? "var(--ink)" : "transparent",
            color: !isTraining ? "var(--surface)" : "var(--ink-soft)",
            fontWeight: !isTraining ? 500 : 400,
          }}
        >
          <Building2 className="w-4 h-4" aria-hidden="true" />
          <span>Register document</span>
        </Link>
        <Link
          href="/training"
          role="tab"
          aria-selected={isTraining}
          className="px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
          style={{
            background: isTraining ? "var(--ink)" : "transparent",
            color: isTraining ? "var(--surface)" : "var(--ink-soft)",
            fontWeight: isTraining ? 500 : 400,
          }}
        >
          <GraduationCap className="w-4 h-4" aria-hidden="true" />
          <span>Compliance training</span>
        </Link>
      </div>
    </nav>
  )
}
