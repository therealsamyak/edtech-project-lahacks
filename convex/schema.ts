import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

const { users: _authUsers, ...authSystemTables } = authTables

export default defineSchema({
  ...authSystemTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }),
  compliances: defineTable({
    complianceId: v.string(),
    name: v.string(),
    passphrase: v.string(),
  }).index("by_compliance_id", ["complianceId"]),
  complianceDocs: defineTable({
    complianceId: v.string(),
    text: v.string(),
    embedding: v.array(v.float64()),
  })
    .index("by_compliance_id", ["complianceId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["complianceId"],
    }),
})
