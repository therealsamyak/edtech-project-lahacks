"use node"

import { v } from "convex/values"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { action } from "./_generated/server"

const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb" // George (free-tier friendly per ElevenLabs docs)
const DEFAULT_MODEL_ID = "eleven_multilingual_v2"

/**
 * Synthesize speech from text using ElevenLabs.
 *
 * Returns the audio as a base64-encoded string plus mime type so the frontend
 * can play it via a data URL on an <audio> tag without any extra round-trip.
 *
 * For longer clips (>~1MB) we should switch to Convex File Storage and return
 * a storageId — that's a follow-up once the UI is wired.
 */
export const synthesize = action({
  args: {
    text: v.string(),
    voiceId: v.optional(v.string()),
  },
  handler: async (_ctx, { text, voiceId }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      throw new Error(
        "ELEVENLABS_API_KEY is not set on this Convex deployment. " +
          "Run: npx convex env set ELEVENLABS_API_KEY <your-key>",
      )
    }

    const client = new ElevenLabsClient({ apiKey })
    const resolvedVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID

    const audioStream = await client.textToSpeech.convert(resolvedVoiceId, {
      text,
      modelId: DEFAULT_MODEL_ID,
      outputFormat: "mp3_44100_128",
    })

    const chunks: Uint8Array[] = []
    for await (const chunk of audioStream as unknown as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }
    const audioBuffer = Buffer.concat(chunks)

    return {
      mimeType: "audio/mpeg",
      base64: audioBuffer.toString("base64"),
      byteLength: audioBuffer.byteLength,
      voiceId: resolvedVoiceId,
    }
  },
})
