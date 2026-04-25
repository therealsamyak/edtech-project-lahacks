import { config as loadEnv } from "dotenv"
import { ComplianceAIService } from "../src/services/ai"

loadEnv({ path: ".env.local", quiet: true })
loadEnv({ quiet: true })

const HELP_TEXT = `Usage:
  npx tsx scripts/test-ai.ts [options]

Modes:
  compliance (default)  Generate a compliance action response
  quiz                  Generate quiz JSON from section content

Options:
  -h, --help            Show this help message
  -m, --mode            Mode to run: compliance | quiz
  -c, --context         Compliance context text (compliance mode)
  -q, --query           User query text (compliance mode)
  -s, --section         Section content for quiz generation (quiz mode)

Environment Variables:
  OPENROUTER_API_KEY    Required API key for OpenRouter
  OPENROUTER_HTTP_REFERER Optional referer header
  OPENROUTER_APP_TITLE  Optional OpenRouter app title header

Examples:
  npx tsx scripts/test-ai.ts
  npx tsx scripts/test-ai.ts --mode compliance --context "Policy text" --query "What should we do?"
  npx tsx scripts/test-ai.ts --mode quiz --section "Employees must report incidents within 24 hours."
`

function readArg(name: string, shortName?: string): string | undefined {
  const args = process.argv.slice(2)

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]

    if ((arg === `--${name}` || arg === `-${shortName}`) && args[i + 1]) {
      return args[i + 1]
    }

    if (arg.startsWith(`--${name}=`)) {
      return arg.slice(name.length + 3)
    }

    if (shortName && arg.startsWith(`-${shortName}=`)) {
      return arg.slice(shortName.length + 2)
    }
  }

  return undefined
}

function hasFlag(name: string, shortName?: string): boolean {
  const args = process.argv.slice(2)
  return args.some((arg) => arg === `--${name}` || arg === `-${shortName}`)
}

async function main(): Promise<void> {
  if (hasFlag("help", "h")) {
    console.log(HELP_TEXT.trim())
    return
  }

  const mode = readArg("mode", "m") ?? "compliance"

  if (mode !== "compliance" && mode !== "quiz") {
    console.error(`Unsupported mode: ${mode}`)
    console.error("Use --help to see valid options.")
    process.exit(1)
  }

  const service = new ComplianceAIService()

  if (mode === "quiz") {
    const section =
      readArg("section", "s") ??
      "Employees must complete security awareness training annually and report incidents within 24 hours."

    const quiz = await service.generateQuiz(section)
    console.log(JSON.stringify(quiz, null, 2))
    return
  }

  const context =
    readArg("context", "c") ??
    "Policy: Employees may only access customer data required for their assigned role. Violations must be reported to the compliance team."
  const query =
    readArg("query", "q") ??
    "What actions should a manager take after discovering unauthorized access?"

  const result = await service.generateComplianceAction(context, query)
  console.log(result.answer)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`AI test script failed: ${message}`)
  process.exit(1)
})
