import { mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"

export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      throw new Error("Unauthenticated")
    }

    const existing = await ctx.db.get(userId)
    const identity = await ctx.auth.getUserIdentity()

    if (identity && (!existing?.email || !existing?.name)) {
      await ctx.db.patch(userId, {
        ...(identity.email ? { email: identity.email } : {}),
        ...(identity.name ? { name: identity.name } : {}),
      })
    }

    return userId
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
