"use node"

import { internalMutation, internalQuery, action } from "./_generated/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"
import pdf from "pdf-parse"
import { ComplianceAIService } from "../src/services/ai"

export const ingestDocument = action({
  args: {
    companyUuid: v.string(),
    companyId: v.id("companies"),
    storageId: v.id("_storage"),
    originalName: v.string(),
  },
  handler: async (ctx, args) => {
    const complianceId = args.companyUuid
    const moduleName = args.originalName.replace(/\.[^/.]+$/, "")

    // Set document status to processing
    const docs = await ctx.runQuery(internal.ingestion.getDocumentsByCompanyAndStorage, {
      companyId: args.companyId,
      storageId: args.storageId,
    })
    if (docs.length > 0) {
      await ctx.runMutation(internal.ingestion.updateDocumentStatus, {
        documentId: docs[0]._id,
        status: "processing",
      })
    }

    try {
      const url = (await ctx.storage.getUrl(args.storageId))!
      const response = await fetch(url)
      const pdfBuffer = Buffer.from(await response.arrayBuffer())
      const data = await pdf(pdfBuffer)

      const fullText = data.text
        .replace(/\s+/g, " ")
        // eslint-disable-next-line no-control-regex -- intentional null byte removal from PDF text
        .replace(/\u0000/g, "")
        .trim()

      if (fullText.length < 100) {
        throw new Error("PDF seems empty or contains unreadable text.")
      }

      const ai = new ComplianceAIService({ apiKey: process.env.OPENROUTER_API_KEY })
      const embedding = await ai.generateEmbedding(fullText.slice(0, 5000))

      await ctx.runMutation(internal.modules.saveComplianceChunks, {
        complianceId,
        chunks: [{ module: moduleName, text: fullText, embedding }],
      })

      const quizItems = await ai.generateQuiz(fullText.slice(0, 10000))
      const transformedQuiz = quizItems.map((item) => ({
        question: item.question,
        options: item.options,
        correctIndex: item.options.indexOf(item.correctAnswer),
      }))

      await ctx.runMutation(internal.ingestion.saveModuleQuiz, {
        complianceId,
        module: moduleName,
        quizItems: transformedQuiz,
      })

      // Set document status to completed
      if (docs.length > 0) {
        await ctx.runMutation(internal.ingestion.updateDocumentStatus, {
          documentId: docs[0]._id,
          status: "completed",
        })
      }

      return {
        status: "success",
        moduleName,
        characterCount: fullText.length,
      }
    } catch (error) {
      // Set document status to failed
      if (docs.length > 0) {
        await ctx.runMutation(internal.ingestion.updateDocumentStatus, {
          documentId: docs[0]._id,
          status: "failed",
        })
      }
      throw error
    }
  },
})

export const getDocumentsByCompanyAndStorage = internalQuery({
  args: {
    companyId: v.id("companies"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_companyId", (q) => q.eq("companyId", args.companyId))
      .collect()
    return docs.filter((d) => d.storageId === args.storageId)
  },
})

export const updateDocumentStatus = internalMutation({
  args: {
    documentId: v.id("documents"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, { processingStatus: args.status })
  },
})

export const saveModuleQuiz = internalMutation({
  args: {
    complianceId: v.string(),
    module: v.string(),
    quizItems: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctIndex: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("moduleQuizzes")
      .withIndex("by_compliance_module", (q) =>
        q.eq("complianceId", args.complianceId).eq("module", args.module),
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { quizItems: args.quizItems })
    } else {
      await ctx.db.insert("moduleQuizzes", {
        complianceId: args.complianceId,
        module: args.module,
        quizItems: args.quizItems,
      })
    }
  },
})

export const getDocumentsByStatus = internalQuery({
  args: {
    companyId: v.id("companies"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_companyId_status", (q) =>
        q.eq("companyId", args.companyId).eq("processingStatus", args.status),
      )
      .collect()
  },
})
