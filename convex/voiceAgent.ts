import { httpAction } from "./_generated/server"
import { api } from "./_generated/api"

/**
 * Webhook called by the ElevenLabs Conversational AI agent when it needs a
 * grounded answer. Configure the agent in the ElevenLabs dashboard with a
 * server tool whose URL points at:
 *
 *   <CONVEX_HTTP_URL>/voice-agent/ask
 *
 * The tool's parameters should match the JSON body shape below:
 *   { complianceDocumentId: string, question: string }
 *
 * We delegate to `api.assistant.chat`, which performs RAG retrieval against
 * the compliance document and returns a grounded answer.
 */
export const askComplianceWebhook = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400)
  }

  const args = body as {
    complianceDocumentId?: unknown
    question?: unknown
    module_context?: unknown
  }
  const complianceDocumentId =
    typeof args.complianceDocumentId === "string" ? args.complianceDocumentId : undefined
  const question = typeof args.question === "string" ? args.question : undefined
  const moduleContext = typeof args.module_context === "string" ? args.module_context : undefined

  if (!question) {
    return jsonResponse({ error: "missing_args", required: ["question"] }, 400)
  }

  try {
    const answer = await ctx.runAction(api.assistant.chat, {
      message: question,
      complianceDocumentId,
      systemContext: moduleContext,
    })
    return jsonResponse({ answer, source: "assistant.chat", complianceDocumentId })
  } catch (err) {
    console.error("[voice-agent webhook] assistant.chat failed:", err)
    return jsonResponse(
      {
        error: "assistant_failed",
        message: err instanceof Error ? err.message : String(err),
      },
      500,
    )
  }
})

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
