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

export const saveModules = internalMutation({
  args: {
    complianceDocumentId: v.string(),
    modules: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        content: v.string(),
        duration: v.string(),
        topics: v.array(v.string()),
        highlights: v.array(v.string()),
        quizQuestions: v.array(
          v.object({
            question: v.string(),
            options: v.array(v.string()),
            correctIndex: v.number(),
          }),
        ),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.complianceDocumentId))
      .unique()

    if (!doc) throw new Error(`Compliance document not found: ${args.complianceDocumentId}`)

    const existing = doc.modules ?? []
    const startOrder = existing.length > 0 ? Math.max(...existing.map((m) => m.order)) + 1 : 0

    const withOrder = args.modules.map((m, i) => ({ ...m, order: startOrder + i }))

    await ctx.db.patch(doc._id, { modules: [...existing, ...withOrder] })
  },
})

export const setModuleOverviewImage = internalMutation({
  args: {
    complianceDocumentUuid: v.string(),
    moduleTitle: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.complianceDocumentUuid))
      .unique()
    if (!doc || !doc.modules) return
    const next = doc.modules.map((m) =>
      m.title === args.moduleTitle ? { ...m, overviewImageStorageId: args.storageId } : m,
    )
    await ctx.db.patch(doc._id, { modules: next })
  },
})

export const setModuleTopicImageAt = internalMutation({
  args: {
    complianceDocumentUuid: v.string(),
    moduleTitle: v.string(),
    index: v.number(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.complianceDocumentUuid))
      .unique()
    if (!doc || !doc.modules) return
    const next = doc.modules.map((m) => {
      if (m.title !== args.moduleTitle) return m
      const ids = [...(m.topicImageStorageIds ?? [])]
      while (ids.length <= args.index) ids.push(null as never)
      ids[args.index] = args.storageId
      return { ...m, topicImageStorageIds: ids }
    })
    await ctx.db.patch(doc._id, { modules: next })
  },
})

export const clearModuleVisuals = internalMutation({
  args: { complianceDocumentUuid: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.complianceDocumentUuid))
      .unique()
    if (!doc || !doc.modules) return
    const next = doc.modules.map((m) => {
      const { overviewImageStorageId: _o, topicImageStorageIds: _t, ...rest } = m
      return rest
    })
    await ctx.db.patch(doc._id, { modules: next })
  },
})

export const getModuleForVisuals = internalQuery({
  args: {
    complianceDocumentUuid: v.string(),
    moduleTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("complianceDocuments")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.complianceDocumentUuid))
      .unique()
    if (!doc || !doc.modules) return null
    return doc.modules.find((m) => m.title === args.moduleTitle) ?? null
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
