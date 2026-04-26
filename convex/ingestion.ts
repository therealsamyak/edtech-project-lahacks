import { internalQuery } from "./_generated/server"
import { v } from "convex/values"

export const getDocumentsByStatus = internalQuery({
  args: {
    complianceDocumentId: v.id("complianceDocuments"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_complianceDocumentId_status", (q) =>
        q.eq("complianceDocumentId", args.complianceDocumentId).eq("processingStatus", args.status),
      )
      .collect()
  },
})
