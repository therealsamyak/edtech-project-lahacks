import { mutation, action } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"
import { ComplianceAIService } from "../src/services/ai"

export const submitQuiz = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    answers: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const moduleData = await ctx.db.get(args.moduleId)
    if (!moduleData) {
      throw new Error("Module not found")
    }

    const questions = moduleData.quizQuestions
    const totalQuestions = questions.length

    let score = 0
    for (let i = 0; i < totalQuestions; i++) {
      if (args.answers[i] === questions[i].correctIndex) {
        score++
      }
    }

    const passed = score / totalQuestions >= 0.7

    const identity = await ctx.auth.getUserIdentity()
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first()

      if (user) {
        await ctx.db.insert("quizResults", {
          userId: user._id,
          moduleId: args.moduleId,
          score,
          totalQuestions,
          passed,
          completedAt: Date.now(),
        })
      }
    }

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
