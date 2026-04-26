import { query, mutation, internalMutation } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"

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
    const passphrase = generatePassphrase()

    const documentId = await ctx.db.insert("complianceDocuments", {
      name: args.name,
      uuid: crypto.randomUUID(),
      slug,
      passphrase,
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

      await ctx.scheduler.runAfter(0, internal.ingest.ingestComplianceDoc, {
        complianceId: slug,
        passphrase: passphrase,
        storageId: doc.storageId,
        moduleName: doc.originalName,
      })
    }

    return { uuid: (await ctx.db.get(documentId))!.uuid, passphrase }
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
    const compliance = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.documentUuid))
      .unique()

    if (!compliance) {
      throw new Error("Compliance document not found")
    }

    for (const doc of args.documents) {
      await ctx.db.insert("documents", {
        complianceDocumentId: compliance._id,
        storageId: doc.storageId,
        originalName: doc.originalName,
        uploadedAt: Date.now(),
        processingStatus: "pending",
      })

      await ctx.scheduler.runAfter(0, internal.ingest.ingestComplianceDoc, {
        complianceId: compliance.slug,
        passphrase: compliance.passphrase,
        storageId: doc.storageId,
        moduleName: doc.originalName,
      })
    }

    return { success: true }
  },
})

export const updateDocumentStatus = internalMutation({
  args: {
    storageId: v.id("_storage"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("documents")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .unique()
    if (doc) {
      await ctx.db.patch(doc._id, { processingStatus: args.status })
    }
  },
})
