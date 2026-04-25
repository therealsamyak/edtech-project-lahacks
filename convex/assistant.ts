"use node"

import { action } from "./_generated/server"
import { v } from "convex/values"

export const chat = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[STUB] assistant.chat called with:", args.message)
    // TODO: implement — call AI provider with context from training material
    return "Based on your policy, the key principles are transparency, accountability, and appropriate data handling — see section 2.3 for full requirements."
  },
})
