"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, ChevronLeft, ChevronRight, Award } from "lucide-react"

export default function QuizPage() {
  const params = useParams<{ id: string; moduleId: string }>()
  const moduleData = useQuery(api.training.getModule, {
    moduleId: params.moduleId as any,
  })
  const quizData = useQuery(
    api.modules.getModuleQuiz,
    moduleData ? { complianceId: params.id, module: moduleData.title } : "skip",
  )
  const submitQuiz = useMutation(api.quiz.submitQuiz)

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{
    score: number
    totalQuestions: number
    passed: boolean
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (moduleData === undefined || quizData === undefined) {
    return (
      <div>
        <p style={{ color: "var(--muted)" }}>Loading module…</p>
      </div>
    )
  }

  if (!moduleData || !quizData || quizData.quizItems.length === 0) {
    return (
      <div>
        <p>No quiz available for this module yet. Please check back after processing completes.</p>
        <Link href={`/training/${params.id}/${params.moduleId}`}>&larr; Back to module</Link>
      </div>
    )
  }

  const quizQuestions = quizData.quizItems
  const total = quizQuestions.length
  const current = quizQuestions[index]
  const selected = answers[index]
  const hasAnswered = selected !== undefined
  const isLast = index === total - 1

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await submitQuiz({
        moduleId: params.moduleId as any,
        answers: Object.values(answers),
      })
      setResult(res)
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted && result) {
    const score = Math.round((result.score / result.totalQuestions) * 100)
    const passed = result.passed

    return (
      <article className="max-w-2xl mx-auto">
        <Button
          render={<Link href={`/training/${params.id}/${params.moduleId}`} />}
          nativeButton={false}
          variant="ghost"
          className="mb-6 -ml-2 inline-flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to module</span>
        </Button>

        <Card className="elev-md p-0" size="default">
          <CardContent className="p-8 text-center">
            <div
              className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                background: passed ? "var(--positive-soft)" : "var(--warning-soft)",
                color: passed ? "var(--positive)" : "var(--secondary)",
              }}
            >
              <Award className="w-6 h-6" />
            </div>
            <div className="eyebrow mb-1">{passed ? "Passed" : "Try again"}</div>
            <h2 className="font-display" style={{ fontWeight: 500 }}>
              {result.score} of {result.totalQuestions} correct
            </h2>
            <p className="mt-2" style={{ color: "var(--ink-soft)" }}>
              {passed
                ? "Nice work — your completion has been recorded."
                : "You need 70% or more to pass. Review the module and try again."}
            </p>
            <div
              className="mt-5 h-2 rounded-full overflow-hidden mx-auto max-w-sm"
              style={{ background: "var(--paper-deep)" }}
              role="progressbar"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Quiz score"
            >
              <div
                className="h-full"
                style={{
                  background: passed ? "var(--positive)" : "var(--secondary)",
                  width: `${score}%`,
                }}
              />
            </div>
            <div className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              {score}% score
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                render={<Link href={`/training/${params.id}/${params.moduleId}`} />}
                nativeButton={false}
                variant="outline"
              >
                Review module
              </Button>
              <Button render={<Link href="/training" />} nativeButton={false}>
                Finish
              </Button>
            </div>
          </CardContent>
        </Card>
      </article>
    )
  }

  return (
    <article className="max-w-2xl mx-auto">
      <Button
        render={<Link href={`/training/${params.id}/${params.moduleId}`} />}
        nativeButton={false}
        variant="ghost"
        className="mb-6 -ml-2 inline-flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        <span>Back to module</span>
      </Button>

      <header className="mb-6">
        <div className="eyebrow mb-2">Quiz &middot; {moduleData.title}</div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display m-0" style={{ fontSize: "1.5rem", fontWeight: 500 }}>
            Question {index + 1} of {total}
          </h1>
          <span className="tag">{moduleData.topics[0] ?? "Training"}</span>
        </div>
        <div
          className="mt-4 h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--paper-deep)" }}
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="Quiz progress"
        >
          <div
            className="h-full transition-all"
            style={{
              background: "var(--accent)",
              width: `${((index + 1) / total) * 100}%`,
            }}
          />
        </div>
      </header>

      <Card className="elev p-0" size="default">
        <CardContent className="p-6">
          <fieldset>
            <legend
              className="font-display block mb-5"
              style={{ fontSize: "1.2rem", fontWeight: 500, lineHeight: 1.3 }}
            >
              {current.question}
            </legend>

            <div className="space-y-2.5">
              {current.options.map((option: string, oIndex: number) => {
                const isSelected = selected === oIndex
                return (
                  <label
                    key={oIndex}
                    className="flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer text-sm transition-colors"
                    style={{
                      background: isSelected ? "var(--accent-soft)" : "var(--surface)",
                      border: `1px solid ${isSelected ? "var(--accent)" : "var(--line)"}`,
                      color: "var(--ink)",
                    }}
                  >
                    <input
                      type="radio"
                      name={`q-${index}`}
                      checked={isSelected}
                      onChange={() => setAnswers({ ...answers, [index]: oIndex })}
                      className="sr-only"
                    />
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs"
                      style={{
                        border: `1.5px solid ${
                          isSelected ? "var(--accent)" : "var(--line-strong)"
                        }`,
                        background: isSelected ? "var(--accent)" : "transparent",
                        color: isSelected ? "var(--surface)" : "var(--muted)",
                      }}
                    >
                      {isSelected ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        String.fromCharCode(65 + oIndex)
                      )}
                    </span>
                    <span className="flex-1">{option}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {isLast ? (
          <Button onClick={handleSubmit} disabled={!hasAnswered || isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit quiz"}
            <Check className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={() => setIndex((i) => i + 1)} disabled={!hasAnswered}>
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </article>
  )
}
