"use node"
import { v } from "convex/values"
import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import * as bcrypt from "bcryptjs"
import pdf from "pdf-parse"
import { ComplianceAIService } from "../src/services/ai"

export const ingestComplianceDoc = action({
  args: {
    complianceId: v.string(),
    passphrase: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const compliance = await ctx.runQuery(internal.compliance.getComplianceRecord, {
      complianceId: args.complianceId,
    })
    if (!compliance || !(await bcrypt.compare(args.passphrase, compliance.passphrase))) {
      throw new Error("Unauthorized")
    }

    const url = (await ctx.storage.getUrl(args.storageId))!
    const response = await fetch(url)
    const data = await pdf(Buffer.from(await response.arrayBuffer()))

    const text = data.text
    const sections = text.split(/\n(?=[0-9A-Z]{2,}\s)/g)

    const moduleMap = new Map<string, string>()

    for (const section of sections) {
      const trimmed = section.trim()
      if (trimmed.length < 50) continue

      const lines = trimmed.split("\n")
      const moduleName = lines[0].trim().slice(0, 50)

      const existingText = moduleMap.get(moduleName) || ""
      moduleMap.set(moduleName, existingText + "\n\n" + trimmed)
    }

    const processed = []
    for (const [name, content] of moduleMap.entries()) {
      const embedding: number[] = await ctx.runAction(internal.ai_service.generateEmbedding, {
        text: content.slice(0, 5000),
      })

      processed.push({
        module: name,
        text: content,
        embedding,
      })
    }
    await ctx.runMutation(internal.compliance.saveComplianceChunks, {
      complianceId: args.complianceId,
      chunks: processed,
    })

    return { status: "success", modulesCreated: processed.length }
  },
})

export const askQuestion = action({
  args: {
    complianceId: v.string(),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    const ai = new ComplianceAIService({ apiKey: process.env.OPENROUTER_API_KEY })

    const questionEmbedding = await ai.generateEmbedding(args.question)

    const searchResults = await ctx.vectorSearch("complianceDocs", "by_embedding", {
      vector: questionEmbedding,
      filter: (q) => q.eq("complianceId", args.complianceId),
      limit: 5,
    })

    if (searchResults.length === 0) {
      return { answer: "I couldn't find any relevant sections in the document.", model: "N/A" }
    }

    const chunks: string[] = await ctx.runQuery(internal.compliance.getChunksByIds, {
      ids: searchResults.map((r) => r._id),
    })

    const context = chunks.join("\n\n")

    return await ai.generateComplianceAction(context, args.question)
  },
})
