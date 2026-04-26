"use node"

import { v } from "convex/values"
import { internalAction } from "./_generated/server"
import { internal } from "./_generated/api"

const POLLINATIONS_BASE_URL = "https://image.pollinations.ai/prompt"
const FLASH_MODEL = "gemini-2.5-flash"
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

const OVERVIEW_WIDTH = 1280
const OVERVIEW_HEIGHT = 560
const TOPIC_WIDTH = 800
const TOPIC_HEIGHT = 600

type QueueItem = { complianceDocumentUuid: string; moduleTitle: string }

// Pollinations free tier permits 1 concurrent request per IP. Each module fires
// 4 sequential calls, so we chain modules end-to-end through this queue rather
// than scheduling them in parallel.
export const processModuleQueue = internalAction({
  args: {
    items: v.array(
      v.object({
        complianceDocumentUuid: v.string(),
        moduleTitle: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0) return
    const [head, ...tail] = args.items
    try {
      await ctx.runAction(internal.moduleVisuals.generateModuleVisuals, head)
    } catch (err) {
      console.error(
        `Module "${head.moduleTitle}" (${head.complianceDocumentUuid}) visuals failed; continuing queue:`,
        err,
      )
    }
    if (tail.length > 0) {
      await ctx.scheduler.runAfter(5_000, internal.moduleVisuals.processModuleQueue, {
        items: tail,
      })
    }
  },
})

export const generateModuleVisuals = internalAction({
  args: {
    complianceDocumentUuid: v.string(),
    moduleTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY not set")

    const m = await ctx.runQuery(internal.compliance.getModuleForVisuals, {
      complianceDocumentUuid: args.complianceDocumentUuid,
      moduleTitle: args.moduleTitle,
    })
    if (!m) throw new Error(`Module "${args.moduleTitle}" not found`)

    const topics = m.topics.slice(0, 3)
    const prompts = await generatePromptsWithGemini(apiKey, {
      title: m.title,
      description: m.description,
      topics,
    })

    const seedKey = `${args.complianceDocumentUuid}::${args.moduleTitle}`

    if (!m.overviewImageStorageId) {
      const { bytes, contentType } = await generateImage(
        prompts.overview,
        `${seedKey}::overview`,
        OVERVIEW_WIDTH,
        OVERVIEW_HEIGHT,
      )
      const storageId = await ctx.storage.store(
        new Blob([new Uint8Array(bytes)], { type: contentType }),
      )
      await ctx.runMutation(internal.compliance.setModuleOverviewImage, {
        complianceDocumentUuid: args.complianceDocumentUuid,
        moduleTitle: args.moduleTitle,
        storageId,
      })
    }

    const existingTopics = m.topicImageStorageIds ?? []
    for (let i = 0; i < topics.length; i++) {
      if (existingTopics[i]) continue
      const topicPrompt = prompts.topics[i] ?? buildFallbackTopicPrompt(topics[i], m.title)
      const { bytes, contentType } = await generateImage(
        topicPrompt,
        `${seedKey}::topic-${i}`,
        TOPIC_WIDTH,
        TOPIC_HEIGHT,
      )
      const storageId = await ctx.storage.store(
        new Blob([new Uint8Array(bytes)], { type: contentType }),
      )
      await ctx.runMutation(internal.compliance.setModuleTopicImageAt, {
        complianceDocumentUuid: args.complianceDocumentUuid,
        moduleTitle: args.moduleTitle,
        index: i,
        storageId,
      })
    }
  },
})

const PROMPT_INSTRUCTION = `You write image-generator prompts for a training-platform UI. For the supplied module, write FOUR concrete prompts:

  - "overview": a wide-banner scene representing the module as a whole.
  - "topics": three spot scenes — one per supplied topic, in the same order.

Each prompt MUST be a single paragraph (40–70 words) and follow this structure:
  1) ONE specific, concrete subject — a tangible object, scene, or moment a photographer could literally capture (e.g. "a laptop screen reflecting a hand pausing mid-keystroke", "a stack of unsealed envelopes on a wooden desk", "a single padlock resting on a server cabinet"). Avoid abstract concepts and avoid lists of objects.
  2) A specific setting and time of day with concrete lighting (e.g. "morning sun through office blinds", "soft overhead ceiling light at dusk").
  3) Style: "minimalist editorial photography, shallow depth of field, slight film grain". Use this style consistently across all four prompts so the set looks cohesive.
  4) A 2–3 color palette named with specific colors (e.g. "warm sand, deep navy, and pale cream").
  5) End with: "no text, no logos, no human faces, no watermarks."

Do NOT use the words "abstract", "conceptual", "symbolic", "geometric shapes", "gradients", or "illustration of a concept". Pick literal subjects.

Return ONLY a JSON object with keys "overview" (string) and "topics" (array of 3 strings, in the same order as the supplied topics). No prose, no markdown.`

async function generatePromptsWithGemini(
  apiKey: string,
  module: { title: string; description: string; topics: string[] },
): Promise<{ overview: string; topics: string[] }> {
  const userText = [
    `Module title: ${module.title}`,
    `Module description: ${module.description}`,
    `Topics (in order): ${module.topics.map((t, i) => `${i + 1}. ${t}`).join(" | ")}`,
    "",
    PROMPT_INSTRUCTION,
  ].join("\n")

  const body = {
    contents: [{ role: "user", parts: [{ text: userText }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  }

  const res = await fetch(`${GEMINI_BASE_URL}/${FLASH_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`Gemini Flash error ${res.status}: ${await res.text()}`)
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text
  if (!text) throw new Error("Gemini returned no prompt JSON")

  const parsed = JSON.parse(text) as { overview?: string; topics?: string[] }
  if (typeof parsed.overview !== "string" || !Array.isArray(parsed.topics)) {
    throw new Error(`Gemini returned malformed JSON: ${text}`)
  }
  return {
    overview: parsed.overview,
    topics: parsed.topics.map((t) => (typeof t === "string" ? t : "")),
  }
}

function buildFallbackTopicPrompt(topic: string, moduleTitle: string): string {
  return [
    `A single tangible object on a clean wooden desk representing "${topic}" in the context of "${moduleTitle}".`,
    "Soft window light from the left, shallow depth of field, slight film grain.",
    "Minimalist editorial photography. Warm sand, deep navy, and pale cream palette.",
    "No text, no logos, no human faces, no watermarks.",
  ].join(" ")
}

async function generateImage(
  prompt: string,
  seedSource: string,
  width: number,
  height: number,
): Promise<{ bytes: Buffer; contentType: string }> {
  const seed = hashStringToInt(seedSource)
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    nologo: "true",
    enhance: "true",
    model: "flux",
    seed: String(seed),
  })
  const url = `${POLLINATIONS_BASE_URL}/${encodeURIComponent(prompt)}?${params.toString()}`

  const MAX_ATTEMPTS = 6
  const BACKOFF_MS = [10_000, 20_000, 30_000, 45_000, 60_000, 90_000]
  let lastError = ""
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url)
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer()
      const contentType = res.headers.get("content-type") ?? "image/jpeg"
      return { bytes: Buffer.from(arrayBuffer), contentType }
    }
    lastError = `${res.status}: ${await res.text()}`
    if (res.status !== 429 && res.status !== 503) break
    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, BACKOFF_MS[attempt]))
    }
  }
  throw new Error(`Pollinations error ${lastError}`)
}

function hashStringToInt(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(h) % 2147483647
}

// Reference unused type so that future intellisense for QueueItem doesn't drift.
const _queueItemSentinel: QueueItem | null = null
void _queueItemSentinel
