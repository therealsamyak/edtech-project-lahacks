import { internalMutation, internalQuery } from "./_generated/server"
import { v } from "convex/values"

export const getFilesByDocumentAndStorage = internalQuery({
  args: {
    complianceDocumentId: v.id("complianceDocuments"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_complianceDocumentId", (q) =>
        q.eq("complianceDocumentId", args.complianceDocumentId),
      )
      .collect()
    return docs.filter((d) => d.storageId === args.storageId)
  },
})

export const updateDocumentStatus = internalMutation({
  args: {
    documentId: v.id("documents"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, { processingStatus: args.status })
  },
})

export const saveModuleQuiz = internalMutation({
  args: {
    complianceDocumentId: v.string(),
    module: v.string(),
    quizItems: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctIndex: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("moduleQuizzes")
      .withIndex("by_document_module", (q) =>
        q.eq("complianceDocumentId", args.complianceDocumentId).eq("module", args.module),
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { quizItems: args.quizItems })
    } else {
      await ctx.db.insert("moduleQuizzes", {
        complianceDocumentId: args.complianceDocumentId,
        module: args.module,
        quizItems: args.quizItems,
      })
    }
  },
})
