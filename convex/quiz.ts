import { query, mutation, action } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"
import { ComplianceAIService } from "../src/services/ai"
import { auth } from "./auth"

export const getUserResultsForDocument = query({
  args: { complianceDocumentId: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) return []

    return await ctx.db
      .query("quizResults")
      .withIndex("by_userId_documentId", (q) =>
        q.eq("userId", userId).eq("complianceDocumentId", args.complianceDocumentId),
      )
      .collect()
  },
})

export const submitQuiz = mutation({
  args: {
    complianceDocumentId: v.string(),
    moduleTitle: v.string(),
    answers: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.complianceDocumentId))
      .unique()

    if (!doc || !doc.modules) {
      throw new Error("Module not found")
    }

    const mod = doc.modules.find((m) => m.title === args.moduleTitle)
    if (!mod) {
      throw new Error("Module not found")
    }

    const questions = mod.quizQuestions
    const totalQuestions = questions.length

    let score = 0
    for (let i = 0; i < totalQuestions; i++) {
      if (args.answers[i] === questions[i].correctIndex) {
        score++
      }
    }

    const passed = score / totalQuestions >= 0.7

    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("You must be logged in to submit a quiz.")
    }

    await ctx.db.insert("quizResults", {
      userId,
      complianceDocumentId: args.complianceDocumentId,
      moduleTitle: args.moduleTitle,
      score,
      totalQuestions,
      passed,
      completedAt: Date.now(),
    })

    return { score, totalQuestions, passed }
  },
})

export const generateModuleQuiz = action({
  args: {
    complianceDocumentId: v.string(),
    module: v.string(),
  },
  handler: async (ctx, args) => {
    const ai = new ComplianceAIService({ apiKey: process.env.OPENROUTER_API_KEY })

    const chunks: string[] = await ctx.runQuery(internal.compliance.getChunksByModule, {
      complianceDocumentId: args.complianceDocumentId,
      module: args.module,
    })

    if (chunks.length === 0) throw new Error("Module content not found.")

    const context = chunks.join("\n\n")
    return await ai.generateQuiz(context)
  },
})
