import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"

export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      throw new Error("Unauthenticated")
    }

    const user = await ctx.db.get(userId)

    if (user !== null && !user.progress) {
      await ctx.db.patch(userId, {
        progress: {},
      })
    }

    return userId
  },
})

export const updateModuleProgress = mutation({
  args: {
    complianceDocumentId: v.string(),
    module: v.string(),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.score < 0 || args.score > 1) {
      throw new Error("Score must be between 0 and 1")
    }

    const userId = await getAuthUserId(ctx)
    if (userId === null) throw new Error("Unauthenticated")

    const user = await ctx.db.get(userId)
    if (!user) throw new Error("User not found")

    const fullProgress = user.progress ?? {}
    const complianceMap = (fullProgress[args.complianceDocumentId] as Record<string, number>) ?? {}

    const existingScore = complianceMap[args.module] ?? 0

    if (args.score > existingScore) {
      complianceMap[args.module] = args.score
      fullProgress[args.complianceDocumentId] = complianceMap

      await ctx.db.patch(userId, {
        progress: fullProgress,
      })
    }
  },
})

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) return null

    return await ctx.db.get(userId)
  },
})
