import { useState } from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Pause,
  Check,
  Sparkles,
  ArrowRight,
  Play,
  BookOpen,
  ListChecks,
  Clock,
  Image as ImageIcon,
  Award,
} from "lucide-react"
import { AssistantPopover } from "./AssistantPopover"

const mockCompanies = [
  "Acme Corporation",
  "TechStart Solutions",
  "Global Finance Ltd",
  "Healthcare Plus",
  "Retail Innovations Inc",
]

type QuizQuestion = { question: string; options: string[]; correct: number }
type Section = {
  id: number
  title: string
  topic: string
  duration: string
  summary: string
  detail: string
  visuals: { caption: string; tone: "accent" | "secondary" | "positive" }[]
  highlights: string[]
  quizQuestions: QuizQuestion[]
}

const mockSections: Section[] = [
  {
    id: 1,
    title: "Data Privacy & GDPR Compliance",
    topic: "Privacy",
    duration: "8 min read",
    summary:
      "Understanding how to handle personal data, customer information, and ensuring compliance with GDPR. Covers data collection, storage, processing, and deletion requirements.",
    detail:
      "GDPR establishes strict rules for how organizations collect, store, and process personal data of EU residents. As an employee, you are responsible for handling customer information lawfully — collecting only what is necessary, retaining it only as long as needed, and respecting individuals' rights to access, correct, or delete their data. When in doubt, ask before sharing data outside your team. The cost of a violation is significant, but the cost of trust lost is greater.",
    visuals: [
      { caption: "Lawful bases for processing", tone: "accent" },
      { caption: "Data subject rights", tone: "secondary" },
      { caption: "Retention and deletion", tone: "positive" },
    ],
    highlights: [
      "Collect the minimum data necessary for the purpose.",
      "Honor deletion requests within 30 days.",
      "Report breaches to the DPO within 72 hours.",
    ],
    quizQuestions: [
      {
        question: "What does GDPR stand for?",
        options: [
          "General Data Protection Regulation",
          "Global Data Privacy Rules",
          "Government Data Protection Rights",
          "General Database Protection Rights",
        ],
        correct: 0,
      },
      {
        question: "How long can you store customer data without an active business reason?",
        options: [
          "Indefinitely",
          "Up to 1 year",
          "Only as long as necessary for the stated purpose",
          "Until the customer asks for deletion",
        ],
        correct: 2,
      },
      {
        question: "What is the right to erasure?",
        options: [
          "Deleting spam emails",
          "A customer's right to request deletion of their data",
          "Removing old company files",
          "Erasing audit logs after a year",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: 2,
    title: "Workplace Safety & Harassment Prevention",
    topic: "People",
    duration: "6 min read",
    summary:
      "Creating a safe and respectful workplace environment. Recognizing harassment, reporting procedures, and fostering an inclusive culture that values every team member.",
    detail:
      "A safe workplace is built daily by every member of the team. This module explains what behaviors qualify as harassment, how to recognize subtle forms of exclusion, and how to use reporting channels confidently and confidentially. Bystander intervention is encouraged — if you see something, you can say something, in the way that feels safest to you.",
    visuals: [
      { caption: "Recognizing harassment", tone: "secondary" },
      { caption: "Reporting channels", tone: "accent" },
      { caption: "Inclusive culture", tone: "positive" },
    ],
    highlights: [
      "Reports can be made anonymously through the HR portal.",
      "Retaliation against reporters is itself a violation.",
      "Bystander intervention is encouraged and protected.",
    ],
    quizQuestions: [
      {
        question: "What should you do if you witness harassment?",
        options: [
          "Ignore it",
          "Report to HR or use the anonymous portal",
          "Wait to see if it happens again",
          "Confront the person publicly",
        ],
        correct: 1,
      },
      {
        question: "Workplace safety is whose responsibility?",
        options: ["Only managers", "Only HR", "Everyone on the team", "Only the safety officer"],
        correct: 2,
      },
    ],
  },
  {
    id: 3,
    title: "Cybersecurity Best Practices",
    topic: "Security",
    duration: "7 min read",
    summary:
      "Protecting company assets and data from cyber threats. Covers password management, phishing awareness, secure communication, and incident response protocols.",
    detail:
      "Most security incidents start with a single click. This module helps you spot phishing attempts, choose strong passwords, use multi-factor authentication effectively, and respond appropriately if you suspect an account or device has been compromised. The IT team would rather you over-report than under-report.",
    visuals: [
      { caption: "Phishing red flags", tone: "accent" },
      { caption: "Password & MFA hygiene", tone: "positive" },
      { caption: "Incident response", tone: "secondary" },
    ],
    highlights: [
      "Use a password manager and unique passwords per service.",
      "Verify unexpected requests on a second channel.",
      "Report suspicious emails to security@ within 24 hours.",
    ],
    quizQuestions: [
      {
        question: "How often should you change your password?",
        options: [
          "Every 30 days",
          "Every 90 days",
          "Only when compromised, with strong unique passwords",
          "Never",
        ],
        correct: 2,
      },
      {
        question: "What is phishing?",
        options: [
          "A type of computer virus",
          "Fraudulent messages designed to steal information",
          "A network monitoring tool",
          "A way to back up data",
        ],
        correct: 1,
      },
    ],
  },
]

type View = { name: "list" } | { name: "module"; id: number } | { name: "quiz"; id: number }

export function ComplianceTraining() {
  const [selectedCompany, setSelectedCompany] = useState("")
  const [uuid, setUuid] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [view, setView] = useState<View>({ name: "list" })

  const handleAuthentication = (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticated(true)
  }

  if (!isAuthenticated) {
    return (
      <AccessForm
        company={selectedCompany}
        setCompany={setSelectedCompany}
        uuid={uuid}
        setUuid={setUuid}
        passphrase={passphrase}
        setPassphrase={setPassphrase}
        onSubmit={handleAuthentication}
      />
    )
  }

  let body: React.ReactNode
  if (view.name === "list") {
    body = <ModuleList company={selectedCompany} onOpen={(id) => setView({ name: "module", id })} />
  } else if (view.name === "module") {
    const section = mockSections.find((s) => s.id === view.id)!
    body = (
      <ModulePage
        section={section}
        onBack={() => setView({ name: "list" })}
        onTakeQuiz={() => setView({ name: "quiz", id: section.id })}
      />
    )
  } else {
    const section = mockSections.find((s) => s.id === view.id)!
    body = (
      <QuizPage
        section={section}
        onBack={() => setView({ name: "module", id: section.id })}
        onComplete={() => setView({ name: "list" })}
      />
    )
  }

  return (
    <>
      <div key={view.name + ("id" in view ? view.id : "")} className="reveal">
        {body}
      </div>
      <AssistantPopover />
    </>
  )
}

/* ============================== Access form ============================== */

function AccessForm({
  company,
  setCompany,
  uuid,
  setUuid,
  passphrase,
  setPassphrase,
  onSubmit,
}: {
  company: string
  setCompany: (v: string) => void
  uuid: string
  setUuid: (v: string) => void
  passphrase: string
  setPassphrase: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 max-w-xl">
        <div className="eyebrow mb-2">Step 02 — Access</div>
        <h1 className="font-display" style={{ fontWeight: 500 }}>
          Sign in to your training.
        </h1>
        <p className="mt-3">
          Enter the credentials your administrator issued. Your training is private to your
          organization and tailored to your company's policies.
        </p>

        <ul className="mt-8 space-y-2.5 text-sm" style={{ color: "var(--ink-soft)" }}>
          {[
            "AI summaries of every section",
            "Knowledge checks with instant feedback",
            "Voice playback for hands-free review",
            "Ask the assistant for clarification anytime",
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

      <form
        onSubmit={onSubmit}
        className="lg:col-span-5 card elev-md p-7"
        aria-label="Access training"
      >
        <div className="mb-5">
          <div className="eyebrow mb-1">Access</div>
          <h2 className="font-display" style={{ fontSize: "1.4rem", fontWeight: 500 }}>
            Company credentials
          </h2>
        </div>

        <div className="space-y-4">
          <Field label="Company" htmlFor="company">
            <div className="relative">
              <select
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="field appearance-none pr-9"
                required
              >
                <option value="">Select your company</option>
                {mockCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "var(--muted)" }}
                aria-hidden="true"
              />
            </div>
          </Field>
          <Field label="Company UUID" htmlFor="uuid">
            <input
              id="uuid"
              type="text"
              value={uuid}
              onChange={(e) => setUuid(e.target.value)}
              placeholder="comp-a7f3e9d2-…"
              className="field"
              style={{ fontFamily: "var(--font-mono)" }}
              required
            />
          </Field>
          <Field label="Passphrase" htmlFor="passphrase">
            <input
              id="passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="••••••••"
              className="field"
              required
            />
          </Field>

          <button type="submit" className="btn btn-primary w-full mt-2">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Access training</span>
          </button>
        </div>
      </form>
    </div>
  )
}

/* ============================== Module list ============================== */

function ModuleList({ company, onOpen }: { company: string; onOpen: (id: number) => void }) {
  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Curriculum · {company || "Your team"}</div>
          <h1 className="font-display" style={{ fontWeight: 500 }}>
            Your training modules.
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="tag">{mockSections.length} modules</span>
          <span className="tag">Due Q2 2026</span>
        </div>
      </header>

      <ol className="space-y-3">
        {mockSections.map((section, idx) => (
          <li key={section.id}>
            <article className="card elev p-5 flex items-center gap-5">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "var(--paper-deep)", color: "var(--ink-soft)" }}
                aria-hidden="true"
              >
                <span
                  className="text-sm"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 eyebrow mb-1">
                  <span>{section.topic}</span>
                  <span aria-hidden="true">·</span>
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span>{section.duration}</span>
                </div>
                <h2
                  className="font-display m-0"
                  style={{ fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.25 }}
                >
                  {section.title}
                </h2>
                <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--muted)" }}>
                  {section.summary}
                </p>
              </div>

              <button
                onClick={() => onOpen(section.id)}
                className="btn btn-secondary shrink-0"
                aria-label={`Open module: ${section.title}`}
              >
                <span>Open module</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </article>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ============================== Module page ============================== */

function ModulePage({
  section,
  onBack,
  onTakeQuiz,
}: {
  section: Section
  onBack: () => void
  onTakeQuiz: () => void
}) {
  const [playing, setPlaying] = useState(false)

  const togglePlay = () => {
    setPlaying((p) => !p)
    if (!playing) {
      setTimeout(() => setPlaying(false), 5000)
    }
  }

  return (
    <article>
      <button onClick={onBack} className="btn btn-ghost mb-6 -ml-2">
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        <span>All modules</span>
      </button>

      {/* Hero */}
      <header className="mb-8">
        <div className="flex items-center gap-2 eyebrow mb-3">
          <span>{section.topic}</span>
          <span aria-hidden="true">·</span>
          <Clock className="w-3 h-3" aria-hidden="true" />
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
          <button
            onClick={togglePlay}
            className="btn btn-secondary"
            aria-pressed={playing}
            aria-label={playing ? "Pause voice playback" : "Listen to summary"}
          >
            {playing ? (
              <>
                <Pause className="w-4 h-4" aria-hidden="true" />
                <span>Pause audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                <span>Listen to summary</span>
              </>
            )}
          </button>
          <button onClick={onTakeQuiz} className="btn btn-primary">
            <Play className="w-4 h-4" aria-hidden="true" />
            <span>Take the quiz</span>
          </button>
        </div>
      </header>

      {/* Lead visual */}
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
          <span style={{ color: "var(--ink-soft)" }}>Module overview · {section.title}</span>
          <span className="eyebrow">Generated visual</span>
        </figcaption>
      </figure>

      {/* Body — detail + key points */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center gap-1.5 eyebrow mb-3">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>In detail</span>
          </div>
          <p style={{ color: "var(--ink)", fontSize: "1rem" }}>{section.detail}</p>
        </div>

        <aside className="card p-6">
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
        </aside>
      </div>

      {/* Visual gallery */}
      <section className="mb-8">
        <div className="eyebrow mb-3">Visual aids</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.visuals.map((v, i) => {
            const bg =
              v.tone === "accent"
                ? "var(--accent-soft)"
                : v.tone === "secondary"
                  ? "var(--secondary-soft)"
                  : "var(--positive-soft)"
            const fg =
              v.tone === "accent"
                ? "var(--accent)"
                : v.tone === "secondary"
                  ? "var(--secondary)"
                  : "var(--positive)"
            return (
              <figure key={i} className="card overflow-hidden">
                <div
                  className="aspect-[4/3] flex items-center justify-center"
                  style={{ background: bg }}
                  aria-hidden="true"
                >
                  <ImageIcon className="w-7 h-7" style={{ color: fg }} />
                </div>
                <figcaption
                  className="px-4 py-3 text-sm border-t"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div style={{ color: "var(--ink)", fontWeight: 500 }}>{v.caption}</div>
                  <div className="eyebrow mt-0.5">Figure {i + 1}</div>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </section>

      {/* Quiz CTA */}
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
              {section.quizQuestions.length} multiple-choice questions · about 3 minutes.
            </p>
          </div>
        </div>
        <button onClick={onTakeQuiz} className="btn btn-primary">
          <span>Take the quiz</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </section>
    </article>
  )
}

/* ============================== Quiz page ============================== */

function QuizPage({
  section,
  onBack,
  onComplete,
}: {
  section: Section
  onBack: () => void
  onComplete: () => void
}) {
  const total = section.quizQuestions.length
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const current = section.quizQuestions[index]
  const selected = answers[index]
  const hasAnswered = selected !== undefined
  const isLast = index === total - 1

  if (submitted) {
    const correctCount = section.quizQuestions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0),
      0,
    )
    const score = Math.round((correctCount / total) * 100)
    const passed = score >= 70

    return (
      <article className="max-w-2xl mx-auto">
        <button onClick={onBack} className="btn btn-ghost mb-6 -ml-2">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to module</span>
        </button>

        <div className="card elev-md p-8 text-center">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{
              background: passed ? "var(--positive-soft)" : "var(--warning-soft)",
              color: passed ? "var(--positive)" : "var(--secondary)",
            }}
            aria-hidden="true"
          >
            <Award className="w-6 h-6" />
          </div>
          <div className="eyebrow mb-1">{passed ? "Passed" : "Try again"}</div>
          <h2 className="font-display" style={{ fontWeight: 500 }}>
            {correctCount} of {total} correct
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
            <button onClick={onBack} className="btn btn-secondary">
              <span>Review module</span>
            </button>
            <button onClick={onComplete} className="btn btn-primary">
              <span>Finish</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="max-w-2xl mx-auto">
      <button onClick={onBack} className="btn btn-ghost mb-6 -ml-2">
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        <span>Back to module</span>
      </button>

      {/* Header + progress */}
      <header className="mb-6">
        <div className="eyebrow mb-2">Quiz · {section.title}</div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display m-0" style={{ fontSize: "1.5rem", fontWeight: 500 }}>
            Question {index + 1} of {total}
          </h1>
          <span className="tag">{section.topic}</span>
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
            style={{ background: "var(--accent)", width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </header>

      <div className="card elev p-6">
        <fieldset>
          <legend
            className="font-display block mb-5"
            style={{ fontSize: "1.2rem", fontWeight: 500, lineHeight: 1.3 }}
          >
            {current.question}
          </legend>

          <div className="space-y-2.5">
            {current.options.map((option, oIndex) => {
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
                      border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--line-strong)"}`,
                      background: isSelected ? "var(--accent)" : "transparent",
                      color: isSelected ? "var(--surface)" : "var(--muted)",
                    }}
                    aria-hidden="true"
                  >
                    {isSelected ? <Check className="w-3 h-3" /> : String.fromCharCode(65 + oIndex)}
                  </span>
                  <span className="flex-1">{option}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      </div>

      {/* Nav */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="btn btn-secondary"
          style={{
            opacity: index === 0 ? 0.5 : 1,
            cursor: index === 0 ? "not-allowed" : "pointer",
          }}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Previous</span>
        </button>

        {isLast ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={!hasAnswered}
            className="btn btn-primary"
            style={{
              opacity: !hasAnswered ? 0.5 : 1,
              cursor: !hasAnswered ? "not-allowed" : "pointer",
            }}
          >
            <span>Submit quiz</span>
            <Check className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            onClick={() => setIndex((i) => i + 1)}
            disabled={!hasAnswered}
            className="btn btn-primary"
            style={{
              opacity: !hasAnswered ? 0.5 : 1,
              cursor: !hasAnswered ? "not-allowed" : "pointer",
            }}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  )
}

/* ============================== Helpers ============================== */

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm mb-1.5" style={{ color: "var(--ink)" }}>
        {label}
      </label>
      {children}
    </div>
  )
}
