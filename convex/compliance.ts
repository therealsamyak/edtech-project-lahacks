import { v } from "convex/values"
import { mutation, query, internalQuery, internalMutation } from "./_generated/server"

export const createCompliance = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const suffix = Math.floor(Math.random() * 9000) + 1000
    const slug = `${args.name.toLowerCase().replace(/\s+/g, "-")}-${suffix}`

    const existing = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique()

    if (existing) return existing._id

    const charset = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let rawPassphrase = ""
    for (let i = 0; i < 12; i++) {
      rawPassphrase += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    await ctx.db.insert("complianceDocuments", {
      name: args.name,
      uuid: crypto.randomUUID(),
      slug,
      passphrase: rawPassphrase,
      createdBy: identity.tokenIdentifier,
      createdAt: Date.now(),
    })

    return { slug, rawPassphrase }
  },
})

export const getComplianceRecord = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("complianceDocuments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()
  },
})

export const saveComplianceChunks = internalMutation({
  args: {
    complianceDocumentId: v.string(),
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
      .query("documentChunks")
      .withIndex("by_compliance_document_id", (q) =>
        q.eq("complianceDocumentId", args.complianceDocumentId),
      )
      .collect()

    for (const doc of existing) {
      await ctx.db.delete(doc._id)
    }

    for (const chunk of args.chunks) {
      await ctx.db.insert("documentChunks", {
        complianceDocumentId: args.complianceDocumentId,
        module: chunk.module,
        text: chunk.text,
        embedding: chunk.embedding,
      })
    }
  },
})

export const getChunksByIds = internalQuery({
  args: { ids: v.array(v.id("documentChunks")) },
  handler: async (ctx, args) => {
    const docs = await Promise.all(args.ids.map((id) => ctx.db.get(id)))
    return docs.map((d) => d?.text ?? "").filter(Boolean)
  },
})

export const getChunksByModule = internalQuery({
  args: {
    complianceDocumentId: v.string(),
    module: v.string(),
  },
  handler: async (ctx, args): Promise<string[]> => {
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_module", (q) =>
        q.eq("complianceDocumentId", args.complianceDocumentId).eq("module", args.module),
      )
      .collect()

    return chunks.map((c) => c.text)
  },
})

export const getModulesByCompliance = query({
  args: { complianceDocumentId: v.string() },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_compliance_document_id", (q) =>
        q.eq("complianceDocumentId", args.complianceDocumentId),
      )
      .collect()

    const uniqueModules = [...new Set(chunks.map((c) => c.module))]
    return uniqueModules.filter((name) => name.length > 3)
  },
})

export const getComplianceOwner = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()

    return record ? { id: record.createdBy } : null
  },
})
