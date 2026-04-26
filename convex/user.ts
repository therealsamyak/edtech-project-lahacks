import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()

    if (user !== null) {
      if (user.name !== identity.name || user.email !== identity.email) {
        await ctx.db.patch(user._id, {
          name: identity.name,
          email: identity.email,
        })
      }
      return user._id
    }

    return await ctx.db.insert("users", {
      name: identity.name!,
      email: identity.email!,
      tokenIdentifier: identity.tokenIdentifier,
      progress: {},
    })
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

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()

    if (!user) throw new Error("User not found")

    const fullProgress = user.progress ?? {}
    const complianceMap = fullProgress[args.complianceDocumentId] ?? {}

    const existingScore = complianceMap[args.module] ?? 0
    if (args.score > existingScore) {
      complianceMap[args.module] = args.score
      fullProgress[args.complianceDocumentId] = complianceMap

      await ctx.db.patch(user._id, {
        progress: fullProgress,
      })
    }
  },
})

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique()
  },
})
