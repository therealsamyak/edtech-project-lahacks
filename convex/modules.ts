import { v } from "convex/values"
import { query, internalQuery, internalMutation } from "./_generated/server"

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

export const getModuleContent = query({
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

export const getModuleQuiz = query({
  args: {
    complianceId: v.string(),
    module: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moduleQuizzes")
      .withIndex("by_compliance_module", (q) =>
        q.eq("complianceId", args.complianceId).eq("module", args.module),
      )
      .unique()
  },
})
