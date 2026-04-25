"use node"
import { v } from "convex/values"
import { internalAction } from "./_generated/server"
import { ComplianceAIService } from "../src/services/ai" // Adjust path to where your ai.ts is

export const generateEmbedding = internalAction({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const aiService = new ComplianceAIService({
      apiKey: process.env.OPENROUTER_API_KEY,
    })

    return await aiService.generateEmbedding(args.text)
  },
})
