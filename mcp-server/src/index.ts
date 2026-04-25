#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import { checkComplianceMock, findPolicySection, type PolicyArea } from "./mockData.js"

const policyAreaSchema = z.enum(["hipaa", "gdpr", "soc2", "internal"])

const server = new McpServer({
  name: "compliance",
  version: "0.1.0",
})

server.tool(
  "get_policy_section",
  "Look up the company's compliance policy text relevant to a question. Call this BEFORE writing code that handles user data, logging, authentication, network requests, or anything that could be regulated. Returns up to three matching policy sections with citations.",
  {
    query: z
      .string()
      .min(1)
      .describe(
        "Natural-language description of what to look up (e.g. 'logging patient data', 'storing API keys').",
      ),
    policyArea: policyAreaSchema
      .optional()
      .describe(
        "Optional: scope the search to a single compliance framework. If omitted, all frameworks are searched.",
      ),
  },
  async ({ query, policyArea }) => {
    const sections = findPolicySection(query, policyArea as PolicyArea | undefined)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ query, policyArea, sections }, null, 2),
        },
      ],
    }
  },
)

server.tool(
  "check_compliance",
  "Check a code snippet for compliance violations BEFORE suggesting it to the user. Returns a structured list of violations with policy citations and suggested fixes. If `compliant` is false, do not suggest the code as-is — apply the suggested fix.",
  {
    code: z.string().min(1).describe("The source code snippet to check for compliance violations."),
    policyArea: policyAreaSchema
      .optional()
      .describe(
        "Optional: scope the check to a single compliance framework. If omitted, all frameworks are checked.",
      ),
  },
  async ({ code, policyArea }) => {
    const result = checkComplianceMock(code, policyArea as PolicyArea | undefined)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)

process.stderr.write("[compliance-mcp] server connected on stdio\n")
