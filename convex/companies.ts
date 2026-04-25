import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getAllCompanies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("companies").collect()
  },
})

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

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const registerCompany = mutation({
  args: {
    name: v.string(),
    documents: v.array(
      v.object({
        storageId: v.id("_storage"),
        originalName: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const companyId = await ctx.db.insert("companies", {
      name: args.name,
      uuid: crypto.randomUUID(),
      passphrase: generatePassphrase(),
      createdAt: Date.now(),
    })

    for (const doc of args.documents) {
      await ctx.db.insert("documents", {
        companyId,
        storageId: doc.storageId,
        originalName: doc.originalName,
        uploadedAt: Date.now(),
        processingStatus: "pending",
      })
    }

    const company = await ctx.db.get(companyId)
    console.log(`\n========== COMPANY REGISTERED ==========`)
    console.log(`Company: ${company!.name}`)
    console.log(`  UUID:       ${company!.uuid}`)
    console.log(`  Passphrase: ${company!.passphrase}`)
    console.log(`=========================================\n`)

    return { uuid: company!.uuid, passphrase: company!.passphrase }
  },
})

export const addDocuments = mutation({
  args: {
    companyUuid: v.string(),
    documents: v.array(
      v.object({
        storageId: v.id("_storage"),
        originalName: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query("companies")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.companyUuid))
      .unique()

    if (!company) throw new Error("Company not found.")

    for (const doc of args.documents) {
      await ctx.db.insert("documents", {
        companyId: company._id,
        storageId: doc.storageId,
        originalName: doc.originalName,
        uploadedAt: Date.now(),
        processingStatus: "pending",
      })
    }

    console.log(`\n========== DOCUMENTS ADDED ==========`)
    console.log(`Company: ${company.name} (${args.companyUuid})`)
    console.log(`  Files:  ${args.documents.length}`)
    console.log(`======================================\n`)

    return { success: true }
  },
})
