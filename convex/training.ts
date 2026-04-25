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
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("You must be logged in to verify access.")
    }

    const match = await ctx.db
      .query("companies")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .unique()

    if (!match || match.name !== args.company || match.passphrase !== args.passphrase) {
      throw new Error("Invalid credentials. Please check your company, UUID, and passphrase.")
    }

    const tokenIdentifier = identity.tokenIdentifier

    const existing = await ctx.db
      .query("userCompanies")
      .withIndex("by_tokenIdentifier_companyId", (q) =>
        q.eq("tokenIdentifier", tokenIdentifier).eq("companyId", match._id),
      )
      .unique()

    if (!existing) {
      await ctx.db.insert("userCompanies", {
        tokenIdentifier,
        companyId: match._id,
        verifiedAt: Date.now(),
      })
    }

    return { name: match.name, uuid: match.uuid }
  },
})

export const getUserCompaniesWithModules = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const tokenIdentifier = identity.tokenIdentifier

    const userCompanies = await ctx.db
      .query("userCompanies")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .collect()

    const result = []
    for (const uc of userCompanies) {
      const company = await ctx.db.get(uc.companyId)
      if (!company) continue

      const modules = await ctx.db
        .query("trainingModules")
        .withIndex("by_companyId", (q) => q.eq("companyId", company._id))
        .order("asc")
        .collect()

      result.push({
        companyUuid: company.uuid,
        companyName: company.name,
        modules,
      })
    }

    return result
  },
})

export const getCompanyByUuid = query({
  args: { uuid: v.string() },
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query("companies")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .unique()
    return company
  },
})
