import { mutation, action } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"
import { ComplianceAIService } from "../src/services/ai"

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

    const identity = await ctx.auth.getUserIdentity()
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first()

      if (user) {
        await ctx.db.insert("quizResults", {
          userId: user._id,
          complianceDocumentId: args.complianceDocumentId,
          moduleTitle: args.moduleTitle,
          score,
          totalQuestions,
          passed,
          completedAt: Date.now(),
        })
      } else {
        console.warn(`[quiz] No user found with email ${identity.email}. Quiz result not saved.`)
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
