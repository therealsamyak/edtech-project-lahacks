"use node"
import { v } from "convex/values"
import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import { ComplianceAIService } from "../src/services/ai"

export const generateModuleQuiz = action({
  args: {
    complianceId: v.string(),
    module: v.string(),
  },
  handler: async (ctx, args) => {
    const ai = new ComplianceAIService({ apiKey: process.env.OPENROUTER_API_KEY })

    const chunks: string[] = await ctx.runQuery(internal.compliance.getChunksByModule, {
      complianceId: args.complianceId,
      module: args.module,
    })

    if (chunks.length === 0) throw new Error("Module content not found.")

    const context = chunks.join("\n\n")
    return await ai.generateQuiz(context)
  },
})
