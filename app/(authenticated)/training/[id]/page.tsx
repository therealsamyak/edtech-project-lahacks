"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight } from "lucide-react"

export default function ModuleListPage() {
  const params = useParams<{ id: string }>()
  const companyId = params.id

  const modules = useQuery(api.training.getModules, {
    companyId,
  })

  return (
    <div className="reveal">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Curriculum &middot; {companyId}</div>
          <h1 className="font-display" style={{ fontWeight: 500 }}>
            Your training modules.
          </h1>
        </div>
        {modules && (
          <div className="flex items-center gap-2">
            <span className="tag">{modules.length} modules</span>
            <span className="tag">Due Q2 2026</span>
          </div>
        )}
      </header>

      {!modules ? (
        <p style={{ color: "var(--muted)" }}>Loading modules…</p>
      ) : (
        <ol className="space-y-3">
          {modules.map((module: any, idx: number) => (
            <li key={module._id}>
              <Card className="elev p-0" size="default">
                <CardContent className="p-5">
                  <article className="flex items-center gap-5">
                    {/* Index badge */}
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                      style={{
                        background: "var(--paper-deep)",
                        color: "var(--ink-soft)",
                      }}
                      aria-hidden="true"
                    >
                      <span
                        className="text-sm"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: 500,
                        }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 eyebrow mb-1">
                        <span>{module.topics[0]}</span>
                        <span aria-hidden="true">·</span>
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        <span>{module.duration}</span>
                      </div>
                      <h2
                        className="font-display m-0"
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 500,
                          lineHeight: 1.25,
                        }}
                      >
                        {module.title}
                      </h2>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--muted)" }}>
                        {module.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <Link href={`/training/${companyId}/${module._id}`} className="shrink-0">
                      <Button variant="outline">
                        <span>Open module</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </article>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8">
        <Link href="/training" className="text-sm" style={{ color: "var(--muted)" }}>
          &larr; Back to access
        </Link>
      </div>
    </div>
  )
}
