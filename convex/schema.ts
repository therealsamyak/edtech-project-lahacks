import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
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
    tokenIdentifier: v.string(),
    companyId: v.id("companies"),
    verifiedAt: v.number(),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_tokenIdentifier_companyId", ["tokenIdentifier", "companyId"]),
})
