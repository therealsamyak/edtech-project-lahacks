"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSection, mockSections } from "@/lib/training-data"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import {
  ChevronLeft,
  Volume2,
  Play,
  BookOpen,
  ListChecks,
  ImageIcon,
  Check,
  ArrowRight,
} from "lucide-react"

export default function ModuleContentPage() {
  const params = useParams<{ id: string; moduleId: string }>()
  const section = getSection(params.moduleId)

  useEffect(() => {
    console.log("[STUB] Module viewed:", params.moduleId)
  }, [params.moduleId])

  if (!section) {
    return (
      <div>
        <p>Module not found.</p>
        <Link href={`/training/${params.id}`}>&larr; Back to modules</Link>
      </div>
    )
  }

  const sectionIndex = mockSections.findIndex((s) => s.id === section.id)

  return (
    <article className="reveal">
      <Link
        href={`/training/${params.id}`}
        className="btn btn-ghost mb-6 -ml-2 inline-flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        <span>All modules</span>
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-2 eyebrow mb-3">
          <span>{section.topic}</span>
          <span aria-hidden="true">·</span>
          <span>{section.duration}</span>
          <span aria-hidden="true">·</span>
          <ListChecks className="w-3 h-3" aria-hidden="true" />
          <span>{section.quizQuestions.length} quiz questions</span>
        </div>
        <h1 className="font-display max-w-3xl" style={{ fontWeight: 500 }}>
          {section.title}
        </h1>
        <p className="mt-3 max-w-3xl" style={{ fontSize: "1.05rem" }}>
          {section.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => console.log("[STUB] Audio playback")}>
            <Volume2 className="w-4 h-4" aria-hidden="true" />
            <span>Listen to summary</span>
          </Button>
          <Link href={`/training/${params.id}/${params.moduleId}/quiz`}>
            <Button>
              <Play className="w-4 h-4" aria-hidden="true" />
              <span>Take the quiz</span>
            </Button>
          </Link>
        </div>
      </header>

      <figure className="card overflow-hidden mb-8">
        <div
          className="aspect-[16/7] flex items-center justify-center"
          style={{ background: "var(--accent-soft)" }}
          aria-hidden="true"
        >
          <ImageIcon className="w-10 h-10" style={{ color: "var(--accent)" }} />
        </div>
        <figcaption
          className="px-5 py-3 border-t flex items-center justify-between text-sm"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <span style={{ color: "var(--ink-soft)" }}>Module overview &middot; {section.title}</span>
          <span className="eyebrow">Generated visual</span>
        </figcaption>
      </figure>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="p-0" size="default">
            <CardContent className="p-6">
              <div className="flex items-center gap-1.5 eyebrow mb-3">
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span>In detail</span>
              </div>
              <p style={{ color: "var(--ink)", fontSize: "1rem" }}>{section.detail}</p>
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card className="p-0" size="default">
            <CardContent className="p-6">
              <div className="eyebrow mb-3">Key points</div>
              <ul className="space-y-3 text-sm">
                {section.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                      aria-hidden="true"
                    >
                      <Check className="w-3 h-3" />
                    </span>
                    <span style={{ color: "var(--ink)" }}>{h}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>

      <section className="mb-8">
        <div className="eyebrow mb-3">Visual aids</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.visuals.map((v, i) => (
            <Card key={i} className="overflow-hidden p-0" size="default">
              <div
                className="aspect-[4/3] flex items-center justify-center"
                style={{ background: `var(--${v.tone}-soft)` }}
              >
                <ImageIcon className="w-7 h-7" style={{ color: `var(--${v.tone})` }} />
              </div>
              <div className="px-4 py-3 text-sm border-t" style={{ borderColor: "var(--line)" }}>
                <div style={{ color: "var(--ink)", fontWeight: 500 }}>{v.caption}</div>
                <div className="eyebrow mt-0.5">Figure {i + 1}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="card p-6 flex flex-wrap items-center justify-between gap-4"
        style={{ background: "var(--accent-soft)", borderColor: "transparent" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "var(--accent)", color: "var(--surface)" }}
            aria-hidden="true"
          >
            <ListChecks className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display" style={{ fontSize: "1.05rem", fontWeight: 500 }}>
              Ready for the knowledge check?
            </div>
            <p className="text-sm mt-0.5" style={{ color: "var(--ink-soft)" }}>
              {section.quizQuestions.length} multiple-choice questions &middot; about 3 minutes.
            </p>
          </div>
        </div>
        <Link href={`/training/${params.id}/${params.moduleId}/quiz`}>
          <Button>
            <span>Take the quiz</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>
    </article>
  )
}
