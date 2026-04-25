# Light the Way + Cognition — LA Hacks

## The problem

New hires get a stack of compliance PDFs on day one. Nobody reads them. People skim, sign the form, forget everything, violate something six months later.

## What we're building

A new hire logs in with World ID, joins their company, and instead of legalese gets an AI tutor that breaks policies into plain-language sections, reads them out loud, quizzes them, and answers follow-up questions. Built accessible from the start: audio-first option, dyslexia-friendly fonts, chunked layout.

Same compliance corpus feeds an MCP server. When that employee opens Cursor or Claude Code later, their AI assistant checks what it's writing against company policy. About to log patient data to a plain text file? Catches itself, rewrites. Compliance knowledge follows you from learning it into doing the work.

One backend, two surfaces. Learner is the primary user (Light the Way). MCP integration is the Cognition play.

## Devpost one-liner

"An accessible, voice-driven onboarding tutor for new hires, backed by the same compliance corpus that keeps your AI coding agent inside policy via MCP."

## Demo flow (rehearse this — it wins)

1. Sign in with World ID. "Verified human, real employee."
2. New hire joins "Acme Corp" via passphrase, gets voice-narrated HIPAA summary (section 1), takes a quiz, asks "what counts as PHI?"
3. Hand-off: "Same data, now in your IDE." Open Cursor with MCP connected. Ask agent to write a logging function. Agent calls `check_compliance(code, "hipaa")` → returns "violates §164.312(b): logs PHI." Agent rewrites it.
4. Completion attestation: World ID nullifier signs "this human completed HIPAA training" → tamper-proof receipt.

Ninety seconds. Hits Light the Way, Cognition, World, ElevenLabs, Figma Make.

## Team split (start in parallel)

A — Backend/AI: Convex schema, PDF ingest + chunk + embed, summary/quiz/QA actions, vector search.

B — Frontend/UX: Figma Make wireframes → Next.js learner UI, accessibility (TTS, dyslexic font toggle, chunked layout, high-contrast).

C — Integrations: ElevenLabs streaming TTS, World ID IDKit, MCP server (Node, points at deployed Convex), demo glue.

## Timeline (30 hours)

| Hours | Milestone |
|---|---|
| 0–3 | Schema locked, Figma Make wireframes, all three SDK spikes (IDKit, ElevenLabs, MCP) working |
| 3–10 | RAG pipeline ingesting PDFs/URLs; learner UI rendering summaries; voice TTS playing |
| 10–18 | Quizzes + Q&A live; World ID gate on enrollment; MCP server exposing `check_compliance` and `get_policy_section` |
| 18–24 | Demo wired end-to-end; accessibility pass; per-company isolation tested |
| 24–28 | Bug bash, demo rehearsal x3, Devpost copy + video |
| 28–30 | Buffer |

## Schema

```
companies: { joinCode, name, ownerId, passphraseHash }
docs: { companyId, sourceType: "pdf"|"url", title, sectionTitles: string[] }
chunks: { docId, sectionIdx, text, embedding } // vector index
enrollments: { userId, companyId, worldIdNullifier, completed: number[] }
quizAttempts: { userId, companyId, sectionIdx, score, passedAt }
```

## Get this right

The passphrase is just a join code, not security. Use Convex Auth for access control. Judges will probe this.

The MCP demo has to work live. The hour-3 spike is non-negotiable. If MCP-over-HTTP fights you, fall back to a local Node MCP server pointing at your Convex deployment. Same result.