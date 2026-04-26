"use node"

import { action } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"
import { ComplianceAIService } from "../src/services/ai"

export const chat = action({
  args: {
    message: v.string(),
    complianceDocumentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ai = new ComplianceAIService({ apiKey: process.env.OPENROUTER_API_KEY })

    if (args.complianceDocumentId) {
      const docId = args.complianceDocumentId
      const questionEmbedding = await ai.generateEmbedding(args.message)

      const searchResults = await ctx.vectorSearch("documentChunks", "by_embedding", {
        vector: questionEmbedding,
        filter: (q) => q.eq("complianceDocumentId", docId),
        limit: 5,
      })

      if (searchResults.length === 0) {
        return "I couldn't find any relevant sections in the document."
      }

      const chunks: string[] = await ctx.runQuery(internal.compliance.getChunksByIds, {
        ids: searchResults.map((r) => r._id),
      })

      const context = chunks.join("\n\n")
      const result = await ai.generateComplianceAction(context, args.message)
      return result.answer
    }

    const result = await ai.generateComplianceAction("", args.message)
    return result.answer
  },
})
