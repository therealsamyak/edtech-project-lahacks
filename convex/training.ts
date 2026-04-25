import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getModule = query({
  args: {
    moduleId: v.id("trainingModules"),
  },
  handler: async (ctx, args) => {
    const module = await ctx.db.get(args.moduleId)
    return module ?? null
  },
})

export const getModules = query({
  args: {
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query("companies")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.companyId))
      .unique()

    if (!company) return null

    const modules = await ctx.db
      .query("trainingModules")
      .withIndex("by_companyId", (q) => q.eq("companyId", company._id))
      .order("asc")
      .collect()

    return modules
  },
})

export const verifyAccess = mutation({
  args: {
    company: v.string(),
    uuid: v.string(),
    passphrase: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query("companies")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .unique()

    if (!match || match.name !== args.company || match.passphrase !== args.passphrase) {
      throw new Error("Invalid credentials. Please check your company, UUID, and passphrase.")
    }

    return { name: match.name, uuid: match.uuid }
  },
})
