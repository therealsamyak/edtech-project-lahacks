import { embed, generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

export interface ComplianceAIServiceConfig {
  apiKey?: string
  complianceModels?: string[]
  quizModels?: string[]
  httpReferer?: string
  appTitle?: string
  timeoutMs?: number
  fetch?: typeof fetch
}

export interface ComplianceActionResult {
  answer: string
  model: string
}

export interface QuizItem {
  question: string
  options: string[]
  correctAnswer: string
}

export interface ModuleItem {
  title: string
  description: string
  content: string
  plainLanguageSummary?: string
  duration: string
  topics: string[]
  highlights: string[]
  quizQuestions: Array<{
    question: string
    options: string[]
    correctIndex: number
  }>
  order: number
}

interface QuizPayload {
  quiz?: unknown
  questions?: unknown
  items?: unknown
}

const COMPLIANCE_MODELS = [
  "tencent/hy3-preview:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "openai/gpt-oss-120b:free",
]

const QUIZ_MODELS = [
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "tencent/hy3-preview:free",
]

const COMPLIANCE_SYSTEM_PROMPT = [
  "You are a senior Compliance Officer assistant.",
  "Use only the provided context to answer.",
  "If the context is missing required facts, say what is missing instead of guessing.",
  "Give practical, policy-safe action steps and note assumptions.",
].join(" ")

const QUIZ_SYSTEM_PROMPT = [
  "You are an instructional designer for compliance training.",
  "Return valid JSON only with no markdown, prose, or code fences.",
  "Generate multiple-choice quiz items grounded in the provided section.",
  "Each item must include: question, options (array of strings), correctAnswer.",
].join(" ")

const MODULE_SYSTEM_PROMPT = [
  "You are a senior compliance training module designer.",
  "Return valid JSON only with no markdown, prose, or code fences.",
  "Generate exactly 3 training modules from the provided document text, covering different aspects/sections.",
  "Each module must include: title, description, content (detailed summary), duration estimate, topics array, highlights array, quizQuestions array, and order.",
  "Each module must include a `plainLanguageSummary` field — a 2-3 sentence plain-language explanation of the module content, written for a non-technical audience.",
  "Each quiz question must include: question (string), options (array of 4 strings), correctIndex (0-based integer indicating the correct option).",
  "Generate exactly 3 to 5 quiz questions per module.",
  "Do NOT include a correctAnswer string field — use correctIndex only.",
].join(" ")

export class ComplianceAIService {
  private readonly openrouter!: ReturnType<typeof createOpenRouter>
  private readonly complianceModels: string[]
  private readonly quizModels: string[]
  private readonly timeoutMs?: number

  constructor(config: ComplianceAIServiceConfig = {}) {
    const apiKey = config.apiKey ?? process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY for ComplianceAIService.")
    }

    this.complianceModels =
      config.complianceModels && config.complianceModels.length > 0
        ? config.complianceModels
        : COMPLIANCE_MODELS

    this.quizModels =
      config.quizModels && config.quizModels.length > 0 ? config.quizModels : QUIZ_MODELS

    const httpReferer = config.httpReferer ?? process.env.OPENROUTER_HTTP_REFERER
    const appTitle = config.appTitle ?? process.env.OPENROUTER_APP_TITLE

    this.openrouter = createOpenRouter({
      apiKey,
      appUrl: httpReferer,
      appName: appTitle,
      compatibility: "strict",
      fetch: config.fetch,
    })

    this.timeoutMs = config.timeoutMs
  }

  private async generateTextWithFailover(params: {
    models: string[]
    system: string
    prompt: string
    temperature?: number
  }): Promise<{ text: string; model: string }> {
    let lastError: unknown

    for (const modelName of params.models) {
      try {
        const response = await generateText({
          model: this.openrouter.chat(modelName),
          system: params.system,
          prompt: params.prompt,
          ...(params.temperature !== undefined ? { temperature: params.temperature } : {}),
          ...(this.timeoutMs ? { timeout: this.timeoutMs } : {}),
        })

        const text = response.text.trim()
        if (!text) {
          lastError = new Error(`Empty response from model: ${modelName}`)
          continue
        }

        return {
          text,
          model: response.response.modelId ?? modelName,
        }
      } catch (err) {
        lastError = err
      }
    }

    const errorMessage = lastError instanceof Error ? lastError.message : String(lastError)
    throw new Error(`All models failed. Last error: ${errorMessage}`)
  }

  async generateComplianceAction(
    context: string,
    userQuery: string,
  ): Promise<ComplianceActionResult> {
    const response = await this.generateTextWithFailover({
      models: this.complianceModels,
      system: COMPLIANCE_SYSTEM_PROMPT,
      prompt: [
        "Compliance Context:",
        context.trim(),
        "",
        "User Query:",
        userQuery.trim(),
        "",
        "Respond with recommended compliance actions and rationale tied to the context.",
      ].join("\n"),
    })

    const answer = response.text

    if (!answer) {
      throw new Error("Compliance model returned an empty response.")
    }

    return {
      answer,
      model: response.model,
    }
  }

  async generateQuiz(sectionContent: string): Promise<QuizItem[]> {
    const response = await this.generateTextWithFailover({
      models: this.quizModels,
      system: QUIZ_SYSTEM_PROMPT,
      prompt: [
        "Section Content:",
        sectionContent.trim(),
        "",
        "Return this exact JSON shape:",
        '{"quiz":[{"question":"...","options":["A","B","C","D"],"correctAnswer":"..."}]}',
        "",
        "Rules:",
        "- Include 3 to 5 questions.",
        "- `correctAnswer` must be one of the options exactly.",
      ].join("\n"),
      temperature: 0,
    })

    const rawText = response.text

    if (!rawText) {
      throw new Error(`Quiz model returned an empty response (model: ${response.model}).`)
    }

    const parsed = safeJsonParse(rawText)
    return normalizeQuizItems(parsed)
  }

  async generateModules(fullText: string): Promise<ModuleItem[]> {
    // Note: text truncated to 8000 chars due to model context limits
    const truncated = fullText.slice(0, 8000)

    const response = await this.generateTextWithFailover({
      models: this.quizModels,
      system: MODULE_SYSTEM_PROMPT,
      prompt: [
        "Document Text:",
        truncated.trim(),
        "",
        "Return a JSON array with this exact shape for each module:",
        '[{"title":"...","description":"...","content":"...","plainLanguageSummary":"...","duration":"...","topics":["..."],"highlights":["..."],"quizQuestions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0}],"order":0}]',
        "",
        "Rules:",
        "- Generate exactly 3 modules covering different aspects of the document.",
        "- Each module should have 3 to 5 quiz questions.",
        "- Each question must have exactly 4 options.",
        "- `correctIndex` is a 0-based integer indicating the correct option.",
        "- Do NOT include a `correctAnswer` string field.",
      ].join("\n"),
      temperature: 0,
    })

    const rawText = response.text

    if (!rawText) {
      throw new Error(`Module model returned an empty response (model: ${response.model}).`)
    }

    const parsed = safeJsonParse(rawText)
    return normalizeModules(parsed)
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const trimmedText = text.trim()
    if (!trimmedText) throw new Error("Text cannot be empty for embedding.")

    const response = await embed({
      model: this.openrouter.textEmbeddingModel("openai/text-embedding-3-small"),
      value: trimmedText,
      ...(this.timeoutMs ? { abortSignal: AbortSignal.timeout(this.timeoutMs) } : {}),
    })

    return response.embedding
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    throw new Error("Quiz response was not valid JSON.")
  }
}

function normalizeQuizItems(payload: unknown): QuizItem[] {
  if (Array.isArray(payload)) {
    return payload.map(parseQuizItem)
  }

  if (typeof payload !== "object" || payload === null) {
    throw new Error("Quiz response JSON was not an object or array.")
  }

  const wrapped = payload as QuizPayload
  const candidates = wrapped.quiz ?? wrapped.questions ?? wrapped.items

  if (!Array.isArray(candidates)) {
    throw new Error("Quiz response JSON must contain an array at `quiz` (or `questions`/`items`).")
  }

  return candidates.map(parseQuizItem)
}

function parseQuizItem(item: unknown): QuizItem {
  if (typeof item !== "object" || item === null) {
    throw new Error("Quiz item must be an object.")
  }

  const question = (item as { question?: unknown }).question
  const options = (item as { options?: unknown }).options
  const correctAnswer = (item as { correctAnswer?: unknown }).correctAnswer

  if (typeof question !== "string" || question.trim().length === 0) {
    throw new Error("Quiz item `question` must be a non-empty string.")
  }

  if (
    !Array.isArray(options) ||
    options.length < 2 ||
    !options.every((v) => typeof v === "string")
  ) {
    throw new Error("Quiz item `options` must be an array of at least 2 strings.")
  }

  if (typeof correctAnswer !== "string" || !options.includes(correctAnswer)) {
    throw new Error("Quiz item `correctAnswer` must be a string present in `options`.")
  }

  return {
    question: question.trim(),
    options: options.map((option) => option.trim()),
    correctAnswer: correctAnswer.trim(),
  }
}

function normalizeModules(payload: unknown): ModuleItem[] {
  // If the model returned a single object (not array), wrap for backwards compatibility
  let items: unknown[]
  if (Array.isArray(payload)) {
    items = payload
  } else if (typeof payload === "object" && payload !== null) {
    items = [payload]
  } else {
    throw new Error("Module response JSON must be an object or array.")
  }

  return items.map((item, index) => parseSingleModule(item, index))
}

function parseSingleModule(payload: unknown, index: number): ModuleItem {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Module response JSON must be an object.")
  }

  const raw = payload as Record<string, unknown>

  const title = raw.title
  const description = raw.description
  const content = raw.content
  const duration = raw.duration
  const topics = raw.topics
  const highlights = raw.highlights
  const plainLanguageSummary = raw.plainLanguageSummary
  const quizQuestions = raw.quizQuestions

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("Module `title` must be a non-empty string.")
  }
  if (typeof description !== "string" || description.trim().length === 0) {
    throw new Error("Module `description` must be a non-empty string.")
  }
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("Module `content` must be a non-empty string.")
  }
  if (typeof duration !== "string" || duration.trim().length === 0) {
    throw new Error("Module `duration` must be a non-empty string.")
  }
  if (!Array.isArray(topics) || !topics.every((v) => typeof v === "string")) {
    throw new Error("Module `topics` must be an array of strings.")
  }
  if (!Array.isArray(highlights) || !highlights.every((v) => typeof v === "string")) {
    throw new Error("Module `highlights` must be an array of strings.")
  }
  if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
    throw new Error("Module `quizQuestions` must be a non-empty array.")
  }

  return {
    title: title.trim(),
    description: description.trim(),
    content: content.trim(),
    duration: duration.trim(),
    topics: topics.map((t) => String(t).trim()),
    highlights: highlights.map((h) => String(h).trim()),
    plainLanguageSummary:
      typeof plainLanguageSummary === "string" ? plainLanguageSummary.trim() : undefined,
    quizQuestions: quizQuestions.map(parseModuleQuizQuestion),
    order: index,
  }
}

function parseModuleQuizQuestion(item: unknown): {
  question: string
  options: string[]
  correctIndex: number
} {
  if (typeof item !== "object" || item === null) {
    throw new Error("Module quiz question must be an object.")
  }

  const raw = item as Record<string, unknown>
  const question = raw.question
  const options = raw.options
  const correctIndex = raw.correctIndex
  const correctAnswer = raw.correctAnswer

  if (typeof question !== "string" || question.trim().length === 0) {
    throw new Error("Module quiz question `question` must be a non-empty string.")
  }
  if (
    !Array.isArray(options) ||
    options.length < 2 ||
    !options.every((v) => typeof v === "string")
  ) {
    throw new Error("Module quiz question `options` must be an array of at least 2 strings.")
  }

  if (
    typeof correctIndex === "number" &&
    Number.isInteger(correctIndex) &&
    correctIndex >= 0 &&
    correctIndex < options.length
  ) {
    return {
      question: question.trim(),
      options: options.map((o) => String(o).trim()),
      correctIndex,
    }
  }

  if (typeof correctAnswer === "string") {
    const idx = options.findIndex((o) => o === correctAnswer)
    if (idx === -1) {
      throw new Error("Module quiz question `correctAnswer` must be present in `options`.")
    }
    return {
      question: question.trim(),
      options: options.map((o) => String(o).trim()),
      correctIndex: idx,
    }
  }

  throw new Error(
    "Module quiz question must include `correctIndex` (number) or `correctAnswer` (string).",
  )
}
