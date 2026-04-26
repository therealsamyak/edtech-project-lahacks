import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

const { users: _authUsers, ...authSystemTables } = authTables

export default defineSchema({
  ...authSystemTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    tokenIdentifier: v.string(),
    progress: v.optional(v.record(v.string(), v.record(v.string(), v.number()))),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("by_token", ["tokenIdentifier"]),
  companies: defineTable({
    name: v.string(),
    uuid: v.string(),
    passphrase: v.string(),
    createdAt: v.number(),
  })
    .index("by_uuid", ["uuid"])
    .index("by_passphrase", ["passphrase"]),
  trainingModules: defineTable({
    companyId: v.id("companies"),
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
  }).index("by_companyId", ["companyId"]),
  quizResults: defineTable({
    userId: v.id("users"),
    moduleId: v.id("trainingModules"),
    score: v.number(),
    totalQuestions: v.number(),
    passed: v.boolean(),
    completedAt: v.number(),
  }),
  userCompanies: defineTable({
    userId: v.id("users"),
    companyId: v.id("companies"),
    verifiedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_companyId", ["userId", "companyId"]),
  documents: defineTable({
    companyId: v.id("companies"),
    storageId: v.id("_storage"),
    originalName: v.string(),
    uploadedAt: v.number(),
    processingStatus: v.optional(v.string()),
  })
    .index("by_companyId", ["companyId"])
    .index("by_companyId_status", ["companyId", "processingStatus"]),
  complianceDocs: defineTable({
    complianceId: v.string(),
    text: v.string(),
    module: v.string(),
    embedding: v.array(v.float64()),
  })
    .index("by_compliance_id", ["complianceId"])
    .index("by_module", ["complianceId", "module"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["complianceId"],
    }),
  moduleQuizzes: defineTable({
    complianceId: v.string(),
    module: v.string(),
    quizItems: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctIndex: v.number(),
      }),
    ),
  }).index("by_compliance_module", ["complianceId", "module"]),
})
