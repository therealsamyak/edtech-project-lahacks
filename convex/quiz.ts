import { mutation } from "./_generated/server"
import { v } from "convex/values"

export const submitQuiz = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    answers: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const module = await ctx.db.get(args.moduleId)
    if (!module) {
      throw new Error("Module not found")
    }

    const questions = module.quizQuestions
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
        .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
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
