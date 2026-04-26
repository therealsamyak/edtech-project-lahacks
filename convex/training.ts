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
    documentUuid: v.string(),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.documentUuid))
      .unique()

    if (!document) return null

    const modules = await ctx.db
      .query("trainingModules")
      .withIndex("by_complianceDocumentId", (q) => q.eq("complianceDocumentId", document._id))
      .order("asc")
      .collect()

    return modules
  },
})

export const verifyAccess = mutation({
  args: {
    document: v.optional(v.string()),
    uuid: v.string(),
    passphrase: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("You must be logged in to verify access.")
    }

    const match = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .unique()

    if (!match || match.passphrase !== args.passphrase) {
      throw new Error("Invalid credentials. Please check your UUID and passphrase.")
    }

    if (args.document !== undefined && match.name !== args.document) {
      throw new Error("Document name does not match the UUID provided.")
    }

    const existing = await ctx.db
      .query("userDocuments")
      .withIndex("by_userId_documentId", (q) =>
        q.eq("userId", userId).eq("complianceDocumentId", match._id),
      )
      .unique()

    if (!existing) {
      await ctx.db.insert("userDocuments", {
        userId,
        complianceDocumentId: match._id,
        verifiedAt: Date.now(),
      })
    }

    return { name: match.name, uuid: match.uuid }
  },
})

export const getUserDocumentsWithModules = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) return []

    const userDocuments = await ctx.db
      .query("userDocuments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect()

    const result = []
    for (const ud of userDocuments) {
      const document = await ctx.db.get(ud.complianceDocumentId)
      if (!document) continue

      const modules = await ctx.db
        .query("trainingModules")
        .withIndex("by_complianceDocumentId", (q) => q.eq("complianceDocumentId", document._id))
        .order("asc")
        .collect()

      result.push({
        documentUuid: document.uuid,
        documentName: document.name,
        modules,
      })
    }

    return result
  },
})

export const removeUserDocument = mutation({
  args: {
    documentUuid: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error("You must be logged in.")
    }

    const document = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.documentUuid))
      .unique()

    if (!document) {
      throw new Error("Document not found.")
    }

    const existing = await ctx.db
      .query("userDocuments")
      .withIndex("by_userId_documentId", (q) =>
        q.eq("userId", userId).eq("complianceDocumentId", document._id),
      )
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
    }
  },
})

export const getDocumentByUuid = query({
  args: { uuid: v.string() },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .unique()
    return document
  },
})
