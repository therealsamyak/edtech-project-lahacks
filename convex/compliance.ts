import { v } from "convex/values"
import { mutation, action, query, internalQuery, internalMutation } from "./_generated/server"
import { internal } from "./_generated/api"
import * as bcrypt from "bcryptjs"

export const createCompliance = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const suffix = Math.floor(Math.random() * 9000) + 1000
    const complianceId = `${args.name.toLowerCase().replace(/\s+/g, "-")}-${suffix}`

    const existing = await ctx.db
      .query("compliances")
      .withIndex("by_compliance_id", (q) => q.eq("complianceId", complianceId))
      .unique()

    if (existing) return existing._id

    const charset = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let rawPassphrase = ""
    for (let i = 0; i < 12; i++) {
      rawPassphrase += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    const hashed = bcrypt.hashSync(rawPassphrase, 10)

    await ctx.db.insert("compliances", {
      name: args.name,
      complianceId,
      passphrase: hashed,
      createdBy: identity.tokenIdentifier,
    })

    return { complianceId, rawPassphrase }
  },
})

export const getComplianceRecord = internalQuery({
  args: { complianceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("compliances")
      .withIndex("by_compliance_id", (q) => q.eq("complianceId", args.complianceId))
      .unique()
  },
})

export const saveComplianceChunks = internalMutation({
  args: {
    complianceId: v.string(),
    chunks: v.array(
      v.object({
        module: v.string(),
        text: v.string(),
        embedding: v.array(v.float64()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("complianceDocs")
      .withIndex("by_compliance_id", (q) => q.eq("complianceId", args.complianceId))
      .collect()

    for (const doc of existing) {
      await ctx.db.delete(doc._id)
    }

    for (const chunk of args.chunks) {
      await ctx.db.insert("complianceDocs", {
        complianceId: args.complianceId,
        module: chunk.module,
        text: chunk.text,
        embedding: chunk.embedding,
      })
    }
  },
})

export const getChunksByIds = internalQuery({
  args: { ids: v.array(v.id("complianceDocs")) },
  handler: async (ctx, args) => {
    const docs = await Promise.all(args.ids.map((id) => ctx.db.get(id)))
    return docs.map((d) => d?.text ?? "").filter(Boolean)
  },
})

export const getChunksByModule = internalQuery({
  args: {
    complianceId: v.string(),
    module: v.string(),
  },
  handler: async (ctx, args): Promise<string[]> => {
    const chunks = await ctx.db
      .query("complianceDocs")
      .withIndex("by_module", (q) =>
        q.eq("complianceId", args.complianceId).eq("module", args.module),
      )
      .collect()

    return chunks.map((c) => c.text)
  },
})

export const getModulesByCompliance = query({
  args: { complianceId: v.string() },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("complianceDocs")
      .withIndex("by_compliance_id", (q) => q.eq("complianceId", args.complianceId))
      .collect()

    const uniqueModules = [...new Set(chunks.map((c) => c.module))]
    return uniqueModules.filter((name) => name.length > 3)
  },
})

export const getComplianceOwner = query({
  args: { complianceId: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("compliances")
      .withIndex("by_compliance_id", (q) => q.eq("complianceId", args.complianceId))
      .unique()

    return record ? { id: record.createdBy } : null
  },
})
