"use client"

import { LoaderInline } from "@dot-loaders/react"

export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <LoaderInline loader="braille" renderer="svg-grid" style={{ color: "var(--ink-soft)" }}>
        <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
          {label ?? "Loading"}
        </span>
      </LoaderInline>
    </div>
  )
}
