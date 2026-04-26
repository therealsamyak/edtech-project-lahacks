import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

const { users: _authUsers, ...authSystemTables } = authTables

export default defineSchema({
  ...authSystemTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("by_email", ["email"]),
  complianceDocuments: defineTable({
    name: v.string(),
    uuid: v.string(),
    slug: v.string(),
    passphrase: v.string(),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    modules: v.optional(
      v.array(
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
    ),
  })
    .index("by_uuid", ["uuid"])
    .index("by_slug", ["slug"]),
  quizResults: defineTable({
    userId: v.id("users"),
    moduleId: v.string(),
    score: v.number(),
    totalQuestions: v.number(),
    passed: v.boolean(),
    completedAt: v.number(),
  }),
  userDocuments: defineTable({
    userId: v.id("users"),
    complianceDocumentId: v.id("complianceDocuments"),
    verifiedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_documentId", ["userId", "complianceDocumentId"]),
  documents: defineTable({
    complianceDocumentId: v.id("complianceDocuments"),
    storageId: v.id("_storage"),
    originalName: v.string(),
    uploadedAt: v.number(),
    processingStatus: v.optional(v.string()),
  })
    .index("by_complianceDocumentId", ["complianceDocumentId"])
    .index("by_complianceDocumentId_status", ["complianceDocumentId", "processingStatus"])
    .index("by_storageId", ["storageId"]),
  documentChunks: defineTable({
    complianceDocumentId: v.string(),
    text: v.string(),
    module: v.string(),
    embedding: v.array(v.float64()),
  })
    .index("by_compliance_document_id", ["complianceDocumentId"])
    .index("by_module", ["complianceDocumentId", "module"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["complianceDocumentId"],
    }),
})
