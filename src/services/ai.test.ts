import { HTTPClient } from "@openrouter/sdk"
import { describe, expect, it, vi } from "vitest"
import { ComplianceAIService } from "./ai"

interface CapturedRequest {
  body: unknown
  method: string
  url: string
}

function createMockHttpClient(responseBody: unknown): {
  httpClient: HTTPClient
  fetcher: ReturnType<typeof vi.fn>
  captured: CapturedRequest[]
} {
  const captured: CapturedRequest[] = []

  const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init)

    const cloned = request.clone()
    const method = cloned.method
    const url = cloned.url
    const bodyText = await cloned.text()
    const body = bodyText ? JSON.parse(bodyText) : null

    captured.push({ body, method, url })

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    })
  })

  return {
    httpClient: new HTTPClient({ fetcher }),
    fetcher,
    captured,
  }
}

describe("ComplianceAIService", () => {
  it("constructs compliance prompts with context and query", async () => {
    const { httpClient, captured } = createMockHttpClient({
      id: "chatcmpl-1",
      object: "chat.completion",
      created: 1710000000,
      model: "openrouter/free",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          finish_reason: "stop",
          message: {
            role: "assistant",
            content: "Use documented escalation procedures.",
          },
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 8,
        total_tokens: 18,
      },
    })

    const service = new ComplianceAIService({
      apiKey: "test-key",
      model: "openrouter/free",
      httpClient,
    })

    const result = await service.generateComplianceAction(
      "Employees must report incidents within 24 hours.",
      "What should I do if someone shares customer data externally?",
    )

    expect(result.answer).toContain("documented escalation procedures")
    expect(captured).toHaveLength(1)

    const requestBody = captured[0].body as {
      messages?: Array<{ role: string; content: string }>
    }

    expect(captured[0].method).toBe("POST")
    expect(captured[0].url).toContain("/chat/completions")
    expect(requestBody.messages).toBeDefined()
    expect(requestBody.messages?.[0].role).toBe("system")
    expect(requestBody.messages?.[0].content).toContain("Compliance Officer")
    expect(requestBody.messages?.[1].content).toContain(
      "Employees must report incidents within 24 hours.",
    )
    expect(requestBody.messages?.[1].content).toContain(
      "What should I do if someone shares customer data externally?",
    )
  })

  it("requests quiz generation in json mode and returns parse-ready items", async () => {
    const { httpClient, captured } = createMockHttpClient({
      id: "chatcmpl-2",
      object: "chat.completion",
      created: 1710000000,
      model: "openrouter/free",
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          finish_reason: "stop",
          message: {
            role: "assistant",
            content: JSON.stringify({
              quiz: [
                {
                  question: "How quickly should incidents be reported?",
                  options: ["Immediately", "Within 24 hours", "Within 30 days"],
                  correctAnswer: "Within 24 hours",
                },
              ],
            }),
          },
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 8,
        total_tokens: 18,
      },
    })

    const service = new ComplianceAIService({
      apiKey: "test-key",
      model: "openrouter/free",
      httpClient,
    })

    const quiz = await service.generateQuiz("Incident reporting is mandatory within 24 hours.")

    expect(quiz).toHaveLength(1)
    expect(quiz[0].correctAnswer).toBe("Within 24 hours")

    const requestBody = captured[0].body as {
      response_format?: { type: string }
      responseFormat?: { type: string }
    }
    const responseFormat = requestBody.response_format ?? requestBody.responseFormat

    expect(responseFormat?.type).toBe("json_object")
  })
})
