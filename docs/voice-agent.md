# Voice Agent Setup

How the voice tutor works end-to-end, and what you need to do once in the
ElevenLabs dashboard before the demo runs.

## What it is

An ElevenLabs **Conversational AI** agent that:

1. The new hire opens via the `<VoiceAgent />` component on a learner page.
2. Streams audio in/out over WebRTC from the browser.
3. Calls our Convex webhook whenever it needs a grounded answer about company
   policy. The webhook proxies to Falak's RAG action so answers are
   _from your compliance docs_, not the model's training data.

```
browser (mic + speaker)
       │  WebRTC audio
       ▼
ElevenLabs Conversational AI agent  ◀── system prompt + voice (in dashboard)
       │
       │  HTTP POST  (server tool)
       ▼
Convex /voice-agent/ask  ◀── convex/voiceAgent.ts
       │
       │  ctx.runAction(api.ingest.askQuestion, …)   ← will be wired once Falak's branch lands
       ▼
RAG over company compliance corpus
```

Right now the webhook returns a labeled mock so the chain can be tested
end-to-end. Swapping in real RAG is a 5-line change in
[`convex/voiceAgent.ts`](../convex/voiceAgent.ts).

## What's already in this repo

- [`components/VoiceAgent.tsx`](../components/VoiceAgent.tsx) — drop-in React
  component using `@elevenlabs/react`. Handles mic permission, connect/disconnect,
  speaking/listening status.
- [`convex/voiceAgent.ts`](../convex/voiceAgent.ts) — webhook handler.
- [`convex/http.ts`](../convex/http.ts) — registers the route at
  `POST /voice-agent/ask`.

## What you do once, in the ElevenLabs dashboard

### 1. Create the agent

Go to https://elevenlabs.io/app/conversational-ai → **Create Agent**.

- **Name:** `Compliance Tutor` (or whatever).
- **Voice:** any available on your tier. _George_
  (`JBFqnCBsd6RMkjVDRZzb`) works well on the free tier.
- **First message** (what the agent says first):
  > "Hi, I'm your compliance tutor. Ask me anything about your company's
  > policies — HIPAA, GDPR, internal — and I'll explain it in plain language."
- **System prompt** (this is the one that matters):
  > You are a friendly, accessible compliance tutor for new hires at a
  > company. When the user asks a substantive question about a policy, ALWAYS
  > call the `ask_compliance` tool first to get the company's actual policy
  > text — never answer from your own knowledge. Keep responses short
  > (under 30 seconds spoken). If the user asks about something unrelated,
  > politely steer them back.

### 2. Add the server tool

Inside the agent settings → **Tools** → **Add server tool**.

- **Name:** `ask_compliance`
- **Description:** "Look up the company's compliance policy answer to a
  question. Always call this before answering substantive questions."
- **URL:** your deployed Convex HTTP URL + `/voice-agent/ask`. Find your URL
  with `npx convex env list` (it's the `CONVEX_SITE_URL`) — for example
  `https://acoustic-bobcat-123.convex.site/voice-agent/ask`.
- **Method:** `POST`
- **Headers:** none required.
- **Parameters** (JSON schema):
  ```json
  {
    "type": "object",
    "properties": {
      "complianceId": {
        "type": "string",
        "description": "Company compliance ID (e.g. 'apple-customer-service-9729')."
      },
      "question": {
        "type": "string",
        "description": "The user's natural-language question about company policy."
      }
    },
    "required": ["complianceId", "question"]
  }
  ```

### 3. Copy the agent ID

From the agent's overview page, copy its ID — looks like
`agent_7101k5zvyjhmfg983brhmhkd98n6`.

Add it to `.env.local`:

```
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_xxx
```

The component reads it at runtime. The `NEXT_PUBLIC_` prefix is required for
the browser to see it.

## Using the component in a page

```tsx
import { VoiceAgent } from "@/components/VoiceAgent"

export default function LearnPage() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
  if (!agentId) return <p>Voice tutor not configured.</p>
  return <VoiceAgent agentId={agentId} />
}
```

## Smoke test

1. Make sure Convex is deployed (`npm run dev`).
2. Visit a page that includes `<VoiceAgent />`.
3. Click **Talk to your tutor** → grant mic permission.
4. Ask: _"What does our HIPAA policy say about logging patient data?"_
5. The agent should call the webhook, the webhook returns a (mock) answer, and
   you'll hear it spoken back. If it works with the mock, swapping in Falak's
   real RAG is a one-line change.

## Network gotcha at the venue

Free-tier ElevenLabs accounts hit the abuse flag (`detected_unusual_activity`)
on shared hackathon WiFi. The browser-to-ElevenLabs WebRTC connection will be
blocked the same way. Three workarounds:

1. Tether to your phone for the demo.
2. Use a teammate's clean key.
3. Pay $5 for the Starter plan — clears the flag entirely.

The Convex webhook isn't affected because it runs from Convex's IPs, not yours.
