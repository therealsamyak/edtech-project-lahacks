import { mutation } from "./_generated/server"
import { v } from "convex/values"

export const submitQuiz = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    answers: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    console.log("[STUB] submitQuiz called with:", args.moduleId, args.answers)
    // TODO: implement — look up module, compute real score, store quizResult
    const totalQuestions = args.answers.length
    const score = totalQuestions // stub: all correct
    const passed = score / totalQuestions >= 0.7
    return { score, totalQuestions, passed }
  },
})
