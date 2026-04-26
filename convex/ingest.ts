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
    moduleName: v.string(),
  },
  handler: async (ctx, args) => {
    const ai = new ComplianceAIService({ apiKey: process.env.OPENROUTER_API_KEY })

    const compliance = await ctx.runQuery(internal.compliance.getComplianceRecord, {
      complianceId: args.complianceId,
    })
    if (!compliance || !(await bcrypt.compare(args.passphrase, compliance.passphrase))) {
      throw new Error("Unauthorized")
    }

    const url = (await ctx.storage.getUrl(args.storageId))!
    const response = await fetch(url)
    const pdfBuffer = Buffer.from(await response.arrayBuffer())
    const data = await pdf(pdfBuffer)

    const fullText = data.text
      .replace(/\s+/g, " ")
      .replace(/\u0000/g, "")
      .trim()

    if (fullText.length < 100) {
      throw new Error("PDF seems empty or contains unreadable text.")
    }

    const moduleName = args.moduleName.replace(/\.[^/.]+$/, "")

    const embedding = await ai.generateEmbedding(fullText.slice(0, 5000))

    const processed = [
      {
        module: moduleName,
        text: fullText,
        embedding: embedding,
      },
    ]

    await ctx.runMutation(internal.compliance.saveComplianceChunks, {
      complianceId: args.complianceId,
      chunks: processed,
    })

    return {
      status: "success",
      moduleName: moduleName,
      characterCount: fullText.length,
    }
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
