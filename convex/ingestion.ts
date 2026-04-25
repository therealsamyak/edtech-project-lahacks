import { internalMutation, internalQuery } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"

export const processDocument = internalMutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, { processingStatus: "processing" })

    // TODO: Add real document processing logic here (e.g., text extraction,
    // embedding generation, content analysis). For now we just update status.
    console.log(`Processing document: ${args.documentId}`)

    await ctx.db.patch(args.documentId, { processingStatus: "completed" })
  },
})

export const processCompanyDocuments = internalMutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_companyId_status", (q) =>
        q.eq("companyId", args.companyId).eq("processingStatus", "pending"),
      )
      .collect()

    for (const doc of docs) {
      await ctx.runMutation(internal.ingestion.processDocument, {
        documentId: doc._id,
      })
    }

    return { processed: docs.length }
  },
})

export const getDocumentsByStatus = internalQuery({
  args: {
    companyId: v.id("companies"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_companyId_status", (q) =>
        q.eq("companyId", args.companyId).eq("processingStatus", args.status),
      )
      .collect()
  },
})
