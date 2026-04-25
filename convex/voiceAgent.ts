import { httpAction } from "./_generated/server"

/**
 * Webhook called by the ElevenLabs Conversational AI agent when it needs a
 * grounded answer. Configure the agent in the ElevenLabs dashboard with a
 * server tool whose URL points at:
 *
 *   <CONVEX_HTTP_URL>/voice-agent/ask
 *
 * The tool's parameters should match the JSON body shape below
 * (complianceId: string, question: string).
 *
 * For now this returns a clearly-labeled mock so the wiring can be tested
 * end-to-end without depending on Falak's `convex/ingest.ts`. Once that file
 * lands on main, swap the mock for:
 *
 *   const result = await ctx.runAction(api.ingest.askQuestion, {
 *     complianceId, question,
 *   })
 *   return jsonResponse(result)
 */
export const askComplianceWebhook = httpAction(async (_ctx, request) => {
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

  if (!complianceId || !question) {
    return jsonResponse({ error: "missing_args", required: ["complianceId", "question"] }, 400)
  }

  // TODO: replace with `ctx.runAction(api.ingest.askQuestion, { complianceId, question })`
  // once Falak's RAG action lands on main.
  const mockAnswer =
    `Per the company's policy for ${complianceId}, the answer to "${question}" is: ` +
    `well-run compliance training delivers legal defense support, helps avoid litigation, ` +
    `mitigates damages, and demonstrates good-faith effort to comply with applicable law. ` +
    `(This is a placeholder response from the voice-agent webhook stub. ` +
    `Real grounded answers come from convex/ingest.ts once it merges.)`

  return jsonResponse({ answer: mockAnswer, source: "stub" })
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
