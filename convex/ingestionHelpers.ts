import { internalMutation, internalQuery } from "./_generated/server"
import { v } from "convex/values"

export const getDocumentsByCompanyAndStorage = internalQuery({
  args: {
    companyId: v.id("companies"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_companyId", (q) => q.eq("companyId", args.companyId))
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
    complianceId: v.string(),
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
      .withIndex("by_compliance_module", (q) =>
        q.eq("complianceId", args.complianceId).eq("module", args.module),
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { quizItems: args.quizItems })
    } else {
      await ctx.db.insert("moduleQuizzes", {
        complianceId: args.complianceId,
        module: args.module,
        quizItems: args.quizItems,
      })
    }
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
