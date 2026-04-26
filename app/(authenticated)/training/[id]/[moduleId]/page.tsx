"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useAction, useQuery } from "convex/react"
import { useRef, useState } from "react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  Volume2,
  VolumeX,
  Loader2,
  Play,
  BookOpen,
  ListChecks,
  ImageIcon,
  Check,
  ArrowRight,
} from "lucide-react"

const visualTones = ["accent", "secondary", "positive"] as const
type VisualTone = (typeof visualTones)[number]

type AudioState = "idle" | "loading" | "playing" | "error"

export default function ModuleContentPage() {
  const params = useParams<{ id: string; moduleId: string }>()
  const moduleData = useQuery(api.training.getModule, {
    moduleId: params.moduleId as any,
  })
  const moduleContent = useQuery(
    api.modules.getModuleContent,
    moduleData ? { complianceId: params.id, module: moduleData.title } : "skip",
  )
  const quizData = useQuery(
    api.modules.getModuleQuiz,
    moduleData ? { complianceId: params.id, module: moduleData.title } : "skip",
  )
  const synthesize = useAction(api.voice.synthesize)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioState, setAudioState] = useState<AudioState>("idle")
  const [audioError, setAudioError] = useState<string | null>(null)

  const handleListen = async () => {
    setAudioError(null)

    // If already playing, stop and reset.
    if (audioState === "playing") {
      audioRef.current?.pause()
      if (audioRef.current) audioRef.current.currentTime = 0
      setAudioState("idle")
      return
    }

    // If we already have audio cached, just play it.
    if (audioUrl && audioRef.current) {
      void audioRef.current.play()
      setAudioState("playing")
      return
    }

    // Otherwise generate fresh.
    if (!moduleData) return
    setAudioState("loading")
    try {
      const result = await synthesize({ text: contentText ?? moduleData.content })
      const url = `data:${result.mimeType};base64,${result.base64}`
      setAudioUrl(url)
      // Wait one tick for the <audio src> to bind, then play.
      requestAnimationFrame(() => {
        void audioRef.current?.play()
        setAudioState("playing")
      })
    } catch (err) {
      setAudioState("error")
      setAudioError(err instanceof Error ? err.message : "Could not generate audio.")
    }
  }

  if (moduleData === undefined || moduleContent === undefined) {
    return (
      <div>
        <p style={{ color: "var(--muted)" }}>Loading module…</p>
      </div>
    )
  }

  if (!moduleData) {
    return (
      <div>
        <p>Module not found.</p>
        <Link href="/training">&larr; Back to modules</Link>
      </div>
    )
  }

  const topic = moduleData.topics[0] ?? "Training"
  const quizCount = quizData?.quizItems?.length ?? 0
  const contentText = moduleContent.length > 0 ? moduleContent.join("\n\n") : null

  const visuals = moduleData.topics.slice(0, 3).map((t, i) => ({
    caption: t,
    tone: visualTones[i % visualTones.length] as VisualTone,
  }))

  return (
    <article>
      <Button
        render={<Link href="/training" />}
        nativeButton={false}
        variant="ghost"
        className="mb-6 -ml-2 inline-flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        <span>All modules</span>
      </Button>

      <header className="mb-8">
        <div className="flex items-center gap-2 eyebrow mb-3">
          <span>{topic}</span>
          <span aria-hidden="true">·</span>
          <span>{moduleData.duration}</span>
          <span aria-hidden="true">·</span>
          <ListChecks className="w-3 h-3" aria-hidden="true" />
          <span>
            {quizCount} quiz question{quizCount !== 1 ? "s" : ""}
          </span>
        </div>
        <h1 className="font-display max-w-3xl" style={{ fontWeight: 500 }}>
          {moduleData.title}
        </h1>
        <p className="mt-3 max-w-3xl" style={{ fontSize: "1.05rem" }}>
          {moduleData.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={handleListen}
            disabled={audioState === "loading"}
            aria-label={audioState === "playing" ? "Stop summary playback" : "Listen to summary"}
          >
            {audioState === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : audioState === "playing" ? (
              <VolumeX className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            )}
            <span>
              {audioState === "loading"
                ? "Generating…"
                : audioState === "playing"
                  ? "Stop"
                  : "Listen to summary"}
            </span>
          </Button>
          <Button
            render={<Link href={`/training/${params.id}/${params.moduleId}/quiz`} />}
            nativeButton={false}
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            <span>Take the quiz</span>
          </Button>
        </div>

        {audioError && (
          <p role="alert" className="mt-2 text-xs" style={{ color: "var(--negative, #b91c1c)" }}>
            {audioError}
          </p>
        )}

        {audioUrl && (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- audio reads the visible page content; no separate caption track needed
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setAudioState("idle")}
            onPause={() => {
              if (audioState === "playing") setAudioState("idle")
            }}
            preload="auto"
            hidden
          />
        )}
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
          <span style={{ color: "var(--ink-soft)" }}>
            Module overview &middot; {moduleData.title}
          </span>
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
              <div style={{ color: "var(--ink)", fontSize: "1rem" }}>
                {contentText ? (
                  contentText.split("\n").map((paragraph: string, i: number) => (
                    <p key={i} className={i > 0 ? "mt-4" : ""} style={{ color: "var(--ink)" }}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p style={{ color: "var(--muted)" }}>
                    Content is being processed. Please check back shortly.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card className="p-0" size="default">
            <CardContent className="p-6">
              <div className="eyebrow mb-3">Key points</div>
              <ul className="space-y-3 text-sm">
                {moduleData.highlights.map((h: string, i: number) => (
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

      {visuals.length > 0 && (
        <section className="mb-8">
          <div className="eyebrow mb-3">Topics covered</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visuals.map((v, i) => (
              <Card key={i} className="overflow-hidden p-0" size="default">
                <div
                  className="aspect-[4/3] flex items-center justify-center"
                  style={{ background: `var(--${v.tone}-soft)` }}
                >
                  <ImageIcon className="w-7 h-7" style={{ color: `var(--${v.tone})` }} />
                </div>
                <div className="px-4 py-3 text-sm border-t" style={{ borderColor: "var(--line)" }}>
                  <div style={{ color: "var(--ink)", fontWeight: 500 }}>{v.caption}</div>
                  <div className="eyebrow mt-0.5">Topic {i + 1}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {quizCount > 0 && (
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
                {quizCount} multiple-choice question{quizCount !== 1 ? "s" : ""} &middot; about 3
                minutes.
              </p>
            </div>
          </div>
          <Button
            render={<Link href={`/training/${params.id}/${params.moduleId}/quiz`} />}
            nativeButton={false}
          >
            <span>Take the quiz</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </section>
      )}
    </article>
  )
}
