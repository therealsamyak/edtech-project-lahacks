import { mutation } from "./_generated/server"

async function wipeTable(ctx: any, tableName: string) {
  let batch
  do {
    batch = await ctx.db.query(tableName).take(100)
    for (const doc of batch) {
      await ctx.db.delete(doc._id)
    }
  } while (batch.length > 0)
}

export const wipeAndReseed = mutation({
  args: {},
  handler: async (ctx) => {
    await wipeTable(ctx, "userDocuments")
    await wipeTable(ctx, "documents")
    await wipeTable(ctx, "documentChunks")
    await wipeTable(ctx, "quizResults")
    await wipeTable(ctx, "complianceDocuments")

    console.log("Wipe complete.")
    return { status: "wiped" }
  },
})
