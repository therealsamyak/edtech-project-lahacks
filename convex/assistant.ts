"use node"

import { action } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"
import { ComplianceAIService } from "../src/services/ai"

export const chat = action({
  args: {
    message: v.string(),
    complianceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.complianceId) {
      return "Please specify a company to get compliance-specific answers."
    }

    const modules = await ctx.runQuery(internal.modules.getModulesByCompliance, {
      complianceId: args.complianceId,
    })

    if (!Array.isArray(modules) || modules.length === 0) {
      return "No compliance documents have been ingested for this company yet."
    }

    const allChunks: string[] = []
    for (const moduleName of modules) {
      const chunks: string[] = await ctx.runQuery(internal.modules.getChunksByModule, {
        complianceId: args.complianceId,
        module: moduleName,
      })
      allChunks.push(...chunks)
    }

    if (allChunks.length === 0) {
      return "No compliance documents have been ingested for this company yet."
    }

    const ai = new ComplianceAIService({ apiKey: process.env.OPENROUTER_API_KEY })
    const context = allChunks.join("\n\n")
    const result = await ai.generateComplianceAction(context, args.message)
    return result.answer
  },
})
