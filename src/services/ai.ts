import { HTTPClient, OpenRouter } from "@openrouter/sdk"

export interface ComplianceAIServiceConfig {
  apiKey?: string
  model?: string
  httpReferer?: string
  appTitle?: string
  timeoutMs?: number
  httpClient?: HTTPClient
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

interface QuizPayload {
  quiz?: unknown
  questions?: unknown
  items?: unknown
}

const DEFAULT_MODEL = "openrouter/free"

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

export class ComplianceAIService {
  private readonly client: OpenRouter
  private readonly model: string
  private readonly apiKey: string
  private readonly httpReferer?: string
  private readonly appTitle?: string

  constructor(config: ComplianceAIServiceConfig = {}) {
    const apiKey = config.apiKey ?? process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY for ComplianceAIService.")
    }

    this.apiKey = apiKey
    this.model = config.model ?? process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL
    this.httpReferer = config.httpReferer ?? process.env.OPENROUTER_HTTP_REFERER
    this.appTitle = config.appTitle ?? process.env.OPENROUTER_APP_TITLE

    this.client = new OpenRouter({
      apiKey,
      httpReferer: this.httpReferer,
      appTitle: this.appTitle,
      timeoutMs: config.timeoutMs,
      httpClient: config.httpClient,
    })
  }

  async generateComplianceAction(
    context: string,
    userQuery: string,
  ): Promise<ComplianceActionResult> {
    const trimmedContext = context.trim()
    const trimmedUserQuery = userQuery.trim()

    if (!trimmedContext) {
      throw new Error("generateComplianceAction requires non-empty context.")
    }

    if (!trimmedUserQuery) {
      throw new Error("generateComplianceAction requires a non-empty userQuery.")
    }

    const response = await this.client.chat.send({
      chatRequest: {
        model: this.model,
        stream: false,
        messages: [
          {
            role: "system",
            content: COMPLIANCE_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              "Compliance Context:",
              trimmedContext,
              "",
              "User Query:",
              trimmedUserQuery,
              "",
              "Respond with recommended compliance actions and rationale tied to the context.",
            ].join("\n"),
          },
        ],
      },
    })

    const answer = extractResponseText(response)

    if (!answer) {
      throw new Error("Compliance model returned an empty response.")
    }

    return {
      answer,
      model: response.model,
    }
  }

  async generateQuiz(sectionContent: string): Promise<QuizItem[]> {
    const trimmedSection = sectionContent.trim()

    if (!trimmedSection) {
      throw new Error("generateQuiz requires non-empty sectionContent.")
    }

    const createQuizRequest = () => ({
      chatRequest: {
        model: this.model,
        stream: false as const,
        temperature: 0,
        responseFormat: {
          type: "json_object" as const,
        },
        messages: [
          {
            role: "system" as const,
            content: QUIZ_SYSTEM_PROMPT,
          },
          {
            role: "user" as const,
            content: [
              "Section Content:",
              trimmedSection,
              "",
              "Return this exact JSON shape:",
              '{"quiz":[{"question":"...","options":["A","B","C","D"],"correctAnswer":"..."}]}',
              "",
              "Rules:",
              "- Include 3 to 5 questions.",
              "- `correctAnswer` must be one of the options exactly.",
            ].join("\n"),
          },
        ],
      },
    })

    const response = await this.sendQuizRequestWithFallback(createQuizRequest)
    let rawText = extractResponseText(response)

    if (!rawText) {
      const retryResponse = await this.sendQuizRequestWithFallback(createQuizRequest)
      rawText = extractResponseText(retryResponse)
    }

    if (!rawText) {
      throw new Error(`Quiz model returned an empty response (model: ${response.model}).`)
    }

    const parsed = safeJsonParse(rawText)
    const quizItems = normalizeQuizItems(parsed)

    if (quizItems.length === 0) {
      throw new Error("Quiz response JSON did not contain any quiz items.")
    }

    return quizItems
  }

  private async sendQuizRequestWithFallback(
    buildRequest: () => {
      chatRequest: {
        model: string
        stream: false
        temperature: number
        responseFormat: { type: "json_object" }
        messages: Array<{ role: "system" | "user"; content: string }>
      }
    },
  ): Promise<{ choices: Array<{ message: { content?: unknown } }>; model: string }> {
    try {
      const response = await this.client.chat.send(buildRequest())
      return response
    } catch (error) {
      if (!isResponseValidationError(error)) {
        throw error
      }

      return this.sendQuizRequestViaFetch(buildRequest().chatRequest)
    }
  }

  private async sendQuizRequestViaFetch(request: {
    model: string
    stream: false
    temperature: number
    responseFormat: { type: "json_object" }
    messages: Array<{ role: "system" | "user"; content: string }>
  }): Promise<{ choices: Array<{ message: { content?: unknown } }>; model: string }> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    }

    if (this.httpReferer) {
      headers["HTTP-Referer"] = this.httpReferer
    }

    if (this.appTitle) {
      headers["X-OpenRouter-Title"] = this.appTitle
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: request.model,
        stream: false,
        temperature: request.temperature,
        response_format: {
          type: "json_object",
        },
        messages: request.messages,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        `OpenRouter fallback request failed (${response.status}): ${text.slice(0, 300)}`,
      )
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>
      model?: string
    }

    if (!Array.isArray(json.choices)) {
      throw new Error("OpenRouter fallback response did not include choices.")
    }

    return {
      choices: json.choices.map((choice) => ({
        message: {
          content: choice.message?.content,
        },
      })),
      model: typeof json.model === "string" ? json.model : request.model,
    }
  }
}

function isResponseValidationError(error: unknown): boolean {
  return (
    error instanceof Error && error.message.toLowerCase().includes("response validation failed")
  )
}

function extractResponseText(response: {
  choices: Array<{
    message: { content?: unknown; refusal?: unknown; reasoning?: unknown }
  }>
}): string {
  const message = response.choices[0]?.message
  const content = message?.content

  if (typeof content === "string") {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item
        }

        if (
          typeof item === "object" &&
          item !== null &&
          "text" in item &&
          typeof (item as { text?: unknown }).text === "string"
        ) {
          return (item as { text: string }).text
        }

        return ""
      })
      .join("")
      .trim()
  }

  if (typeof message?.refusal === "string") {
    return message.refusal.trim()
  }

  if (typeof message?.reasoning === "string") {
    return message.reasoning.trim()
  }

  if (typeof content === "object" && content !== null) {
    try {
      return JSON.stringify(content)
    } catch {
      return ""
    }
  }

  return ""
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
