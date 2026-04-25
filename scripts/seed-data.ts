import { ConvexHttpClient } from "convex/browser"
import { api } from "../convex/_generated/api"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

async function main() {
  try {
    const result = await client.mutation(api.compliance.createCompliance, {
      name: "Apple-Customer-Service",
    })

    console.log("SUCCESS")
    console.log("ID:", result.complianceId)
    console.log("PASS:", result.rawPassphrase)
  } catch (error) {
    console.error("FAILURE:", error)
  }
}

main()
