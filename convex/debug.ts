import { action } from "./_generated/server"
import { v } from "convex/values"

export const testImagePipeline = action({
  args: { testPrompt: v.string() },
  handler: async (ctx, args) => {
    // 1. Hit the API
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(args.testPrompt)}?nologo=true`
    const res = await fetch(imageUrl)
    if (!res.ok) throw new Error("Pollinations failed")

    // 2. Convert to Blob (The fix we just did)
    const buffer = await res.arrayBuffer()
    const blob = new Blob([buffer], { type: "image/png" })

    // 3. Store and Get URL
    const storageId = await ctx.storage.store(blob)
    const url = await ctx.storage.getUrl(storageId)

    return { storageId, url }
  },
})
