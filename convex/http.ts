import { httpRouter } from "convex/server"
import { auth } from "./auth"
import { askComplianceWebhook } from "./voiceAgent"

const http = httpRouter()

auth.addHttpRoutes(http)

// Webhook called by the ElevenLabs Conversational AI agent's server tool.
// See docs/voice-agent.md for the dashboard configuration.
http.route({
  path: "/voice-agent/ask",
  method: "POST",
  handler: askComplianceWebhook,
})

export default http
