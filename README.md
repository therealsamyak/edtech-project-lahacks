# CompliLearn

LA Hacks project by Team SFT.

CompliLearn turns long compliance documents into training modules people can actually complete, then extends the same policy context into coding assistants through MCP.

## Why This Exists

Most compliance onboarding is a PDF dump and a signature. Retention is low, and policy mistakes still happen later during real work.

CompliLearn addresses this with two connected surfaces:

- Learner app: Upload documents, generate modules, review summaries, listen to narrated content, and complete quizzes.
- Developer guardrail: Expose policy context to AI coding agents through an MCP server for policy-aware assistance.

## What Is In This Repo

### Product Features (Implemented)

- Password-based sign-in with Convex Auth.
- Admin-style document registration flow with PDF upload and generated credentials (UUID + passphrase).
- Employee training access flow using document UUID + passphrase verification.
- Per-document modules with:
  - Generated summaries and highlights
  - Module visuals
  - Optional text-to-speech playback
  - Per-module quizzes with scoring and pass/fail state
- AI assistant backend actions for compliance Q and A.
- Separate MCP server package that exposes policy tools to compatible editors.

### Current Status Notes

- The MCP server currently uses mocked policy data for demos, with interfaces ready for live backend wiring.
- Voice tutor integration is scaffolded and documented; production behavior depends on ElevenLabs configuration and keys.

## Architecture

```text
Next.js App Router UI
	-> Convex queries/mutations/actions
	-> Convex database + file storage
	-> AI providers (OpenRouter / Gemini / ElevenLabs)

MCP clients (Cursor / Claude Code / Windsurf)
	-> mcp-server (stdio)
	-> policy tools (mock layer today, Convex-backed layer next)
```

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui components.
- Backend: Convex (database, server functions, HTTP actions, file storage).
- Auth: Convex Auth (password provider).
- AI: OpenRouter-based service for generation and Q and A, Gemini for visuals, ElevenLabs for voice.
- Integrations: MCP server using @modelcontextprotocol/sdk.
- Tooling: Vitest, oxlint, oxfmt, lefthook.

## Quick Start

### 1. Install dependencies

```bash
npm install
cd mcp-server && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in the values in .env.local.

### 3. Run the app

```bash
npm run dev
```

This starts Convex and Next.js together.

## Environment Variables

Defined in .env.example:

- CONVEX_DEPLOYMENT
- NEXT_PUBLIC_CONVEX_URL
- NEXT_PUBLIC_CONVEX_SITE_URL
- SETUP_SCRIPT_RAN
- NEXT_PUBLIC_ELEVENLABS_AGENT_ID
- OPENROUTER_API_KEY
- OPENROUTER_APP_TITLE
- ELEVENLABS_API_KEY
- GEMINI_API_KEY

Notes:

- predev runs Convex initialization and setup.mjs.
- setup.mjs runs @convex-dev/auth setup flow once if .env.local exists.

## Primary App Routes

- /signin: User authentication.
- /register: Register a compliance document and issue access credentials.
- /training: Access verified documents and navigate modules.
- /training/[id]/[moduleId]: Module detail, summary, visuals, and audio playback.
- /training/[id]/[moduleId]/quiz: Module quiz experience and results.

## Scripts

### Root

```bash
npm run dev          # Convex + Next dev
npm run build        # Next production build
npm run start        # Start built app
npm run test         # Run Vitest
npm run test:ai      # AI service test script
npm run seed         # Seed Convex data
npm run lint         # Run oxlint with fixes
npm run format       # Run oxfmt
npm run check        # Lint + format
npm run voice:spike  # ElevenLabs spike script
```

### MCP Server (mcp-server/)

```bash
npm run dev      # Watch mode
npm run start    # Run server
npm run build    # TypeScript build
npm run inspect  # MCP Inspector
```

## MCP Integration

The project includes an MCP server package under mcp-server that provides:

- get_policy_section
- check_compliance

For editor setup examples and config snippets, see mcp-server/README.md.

## Repository Layout

```text
app/              Next.js routes and pages
components/       Shared UI and app components
convex/           Backend functions, schema, auth, ingest, quiz, voice
docs/             Integration docs (voice agent)
mcp-server/       Standalone MCP server package
scripts/          Utility and spike scripts
src/services/     AI service implementation and tests
```

## Team SFT At LA Hacks

This repository contains the working code for Team SFT's LA Hacks build of CompliLearn.

Focus areas:

- Make compliance learning usable and accessible.
- Keep policy context available during real engineering work.
- Connect training and execution through one shared knowledge source.
