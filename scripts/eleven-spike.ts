/**
 * ElevenLabs TTS spike.
 *
 * Verifies the chain: text in -> ElevenLabs TTS -> mp3 on disk -> auto-play.
 *
 * Run:   npm run voice:spike
 *        npm run voice:spike -- "any text you want spoken"
 *
 * Requires ELEVENLABS_API_KEY in .env.local (gitignored).
 * Optional: ELEVENLABS_VOICE_ID (defaults to Rachel).
 */
import "dotenv/config"
import { config as loadEnv } from "dotenv"
import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

loadEnv({ path: ".env.local", override: true })

const SAMPLE_TEXT = `Direct answer: Ethics and compliance training delivers explicit legal benefits only for well-run, non-perfunctory programs. It supports legal defense in the event of a misstep, helps the organization avoid litigation, mitigates damages and prosecution, demonstrates good-faith effort to comply with applicable law, and reduces the likelihood of legal violations.`

const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb" // George (free-tier friendly per ElevenLabs docs)

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    console.error("Missing ELEVENLABS_API_KEY. Add it to .env.local at the repo root.")
    process.exit(1)
  }

  const text = process.argv.slice(2).join(" ").trim() || SAMPLE_TEXT
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID

  console.error(`[voice-spike] voice=${voiceId}  chars=${text.length}`)
  console.error(`[voice-spike] text="${text.slice(0, 80)}${text.length > 80 ? "..." : ""}"`)

  const client = new ElevenLabsClient({ apiKey })

  const t0 = Date.now()
  const audio = await client.textToSpeech.convert(voiceId, {
    text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  })
  const elapsed = Date.now() - t0
  console.error(`[voice-spike] ElevenLabs responded in ${elapsed}ms`)

  // Collect the streaming response into a single Buffer so we can save + play.
  const chunks: Uint8Array[] = []
  for await (const chunk of audio) {
    chunks.push(chunk as Uint8Array)
  }
  const buffer = Buffer.concat(chunks)

  const outDir = join(process.cwd(), "scripts", "output")
  await mkdir(outDir, { recursive: true })
  const outPath = join(outDir, `tts-${Date.now()}.mp3`)
  await writeFile(outPath, buffer)
  console.error(`[voice-spike] wrote ${buffer.byteLength} bytes -> ${outPath}`)

  // Auto-play (requires an audio player on the system; on macOS this uses afplay/mpg123 if available).
  // If `play` cannot find a player, this throws — that's fine, the file on disk is the proof.
  try {
    const playable = Buffer.from(buffer)
    await play(playable as unknown as ArrayBuffer)
    console.error("[voice-spike] played audio")
  } catch (err) {
    console.error(
      `[voice-spike] (skipped auto-play; open ${outPath} manually) reason:`,
      (err as Error).message,
    )
  }
}

main().catch((err) => {
  console.error("[voice-spike] failed:", err)
  process.exit(1)
})
