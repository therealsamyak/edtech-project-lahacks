import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { auth } from "./auth"

export const getModule = query({
  args: {
    moduleId: v.id("trainingModules"),
  },
  handler: async (ctx, args) => {
    const moduleData = await ctx.db.get(args.moduleId)
    return moduleData ?? null
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
    company: v.optional(v.string()),
    uuid: v.string(),
    passphrase: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("You must be logged in to verify access.")
    }

    const match = await ctx.db
      .query("companies")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .unique()

    if (!match || match.passphrase !== args.passphrase) {
      throw new Error("Invalid credentials. Please check your UUID and passphrase.")
    }

    if (args.company !== undefined && match.name !== args.company) {
      throw new Error("Company name does not match the UUID provided.")
    }

    const existing = await ctx.db
      .query("userCompanies")
      .withIndex("by_userId_companyId", (q) => q.eq("userId", userId).eq("companyId", match._id))
      .unique()

    if (!existing) {
      await ctx.db.insert("userCompanies", {
        userId,
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
    const userId = await auth.getUserId(ctx)
    if (!userId) return []

    const userCompanies = await ctx.db
      .query("userCompanies")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
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

export const removeUserCompany = mutation({
  args: {
    companyUuid: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("You must be logged in.")
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.companyUuid))
      .unique()

    if (!company) {
      throw new Error("Company not found.")
    }

    const existing = await ctx.db
      .query("userCompanies")
      .withIndex("by_userId_companyId", (q) => q.eq("userId", userId).eq("companyId", company._id))
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
    }
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
