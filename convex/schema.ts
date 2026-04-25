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
  }).index("by_token", ["tokenIdentifier"]),
  compliances: defineTable({
    complianceId: v.string(),
    name: v.string(),
    passphrase: v.string(),
    createdBy: v.string(),
  }).index("by_compliance_id", ["complianceId"]),
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
})
