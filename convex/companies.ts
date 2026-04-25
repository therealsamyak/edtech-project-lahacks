import { mutation } from "./_generated/server"
import { v } from "convex/values"

function generatePassphrase(): string {
  const adjectives = [
    "swift",
    "calm",
    "bold",
    "warm",
    "keen",
    "bright",
    "quiet",
    "solid",
    "crisp",
    "deep",
  ]
  const nouns = [
    "river",
    "stone",
    "pine",
    "ridge",
    "hawk",
    "flame",
    "shore",
    "grove",
    "peak",
    "cove",
  ]
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const suffix = Math.floor(Math.random() * 9000) + 1000
  return `${adj}-${noun}-${suffix}`
}

export const registerCompany = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const companyId = await ctx.db.insert("companies", {
      name: args.name,
      uuid: crypto.randomUUID(),
      passphrase: generatePassphrase(),
      createdAt: Date.now(),
    })

    const company = await ctx.db.get(companyId)
    console.log(`\n========== COMPANY REGISTERED ==========`)
    console.log(`Company: ${company!.name}`)
    console.log(`  UUID:       ${company!.uuid}`)
    console.log(`  Passphrase: ${company!.passphrase}`)
    console.log(`=========================================\n`)

    return { uuid: company!.uuid, passphrase: company!.passphrase }
  },
})
