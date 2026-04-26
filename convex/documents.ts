import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getAllDocuments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("complianceDocuments").collect()
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

export const registerDocument = mutation({
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
    const suffix = Math.floor(Math.random() * 9000) + 1000
    const slug = `${args.name.toLowerCase().replace(/\s+/g, "-")}-${suffix}`

    const documentId = await ctx.db.insert("complianceDocuments", {
      name: args.name,
      uuid: crypto.randomUUID(),
      slug,
      passphrase: generatePassphrase(),
      createdAt: Date.now(),
    })

    for (const doc of args.documents) {
      await ctx.db.insert("documents", {
        complianceDocumentId: documentId,
        storageId: doc.storageId,
        originalName: doc.originalName,
        uploadedAt: Date.now(),
        processingStatus: "pending",
      })
    }

    const document = await ctx.db.get(documentId)
    console.log(`\n========== DOCUMENT REGISTERED ==========`)
    console.log(`Document: ${document!.name}`)
    console.log(`  UUID:       ${document!.uuid}`)
    console.log(`  Passphrase: ${document!.passphrase}`)
    console.log(`==========================================\n`)

    return { uuid: document!.uuid, passphrase: document!.passphrase }
  },
})

export const addFiles = mutation({
  args: {
    documentUuid: v.string(),
    documents: v.array(
      v.object({
        storageId: v.id("_storage"),
        originalName: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.documentUuid))
      .unique()

    if (!document) throw new Error("Document not found.")

    for (const doc of args.documents) {
      await ctx.db.insert("documents", {
        complianceDocumentId: document._id,
        storageId: doc.storageId,
        originalName: doc.originalName,
        uploadedAt: Date.now(),
        processingStatus: "pending",
      })
    }

    console.log(`\n========== FILES ADDED ==========`)
    console.log(`Document: ${document.name} (${args.documentUuid})`)
    console.log(`  Files:  ${args.documents.length}`)
    console.log(`=================================\n`)

    return { success: true }
  },
})
