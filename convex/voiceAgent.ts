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
 *   { complianceId: string, question: string }
 *
 * We delegate to `api.assistant.chat`, which is the team's own RAG entry point.
 * Today that action returns a stub string; once Falak wires real retrieval into
 * convex/assistant.ts, this webhook automatically returns grounded answers
 * with no further changes here.
 *
 * `complianceId` is captured and forwarded in the response for traceability,
 * but assistant.chat doesn't currently accept it as an arg. When that signature
 * is widened (per-company scoping), add it to the `runAction` args below.
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

  const args = body as { complianceId?: unknown; question?: unknown }
  const complianceId = typeof args.complianceId === "string" ? args.complianceId : undefined
  const question = typeof args.question === "string" ? args.question : undefined

  if (!question) {
    return jsonResponse({ error: "missing_args", required: ["question"] }, 400)
  }

  try {
    const answer = await ctx.runAction(api.assistant.chat, { message: question })
    return jsonResponse({ answer, source: "assistant.chat", complianceId })
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
      // ElevenLabs server tools call cross-origin from their cloud; permissive CORS is fine here.
      "Access-Control-Allow-Origin": "*",
    },
  })
}
