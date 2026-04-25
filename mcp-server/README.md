# Compliance MCP Server

A Model Context Protocol server that exposes company compliance policies to AI coding agents (Claude Code, Cursor, Windsurf, Devin, Cline — anything that speaks MCP).

Right now it serves **mocked policy data** so we can demo the round-trip without waiting on the RAG backend. Tomorrow we swap the mock layer for live Convex queries.

## Tools exposed

| Tool                 | What it does                                                                            |
| -------------------- | --------------------------------------------------------------------------------------- |
| `get_policy_section` | Looks up the company's compliance text for a query. Call before writing regulated code. |
| `check_compliance`   | Lints a code snippet against company policies. Returns violations + suggested fixes.    |

## Run it

From `mcp-server/`:

```bash
npm install
npm run start          # plain run
npm run dev            # watch mode
npm run inspect        # opens MCP Inspector UI for manual testing
```

The server speaks **stdio** — it expects to be launched as a subprocess by an MCP client. Don't run it as a long-lived service.

## Wire it into your editor

Replace `<ABS_PATH>` with the absolute path to this folder.

### Claude Code

Project-level config at `.mcp.json` in the **repo root** (we already ship one):

```json
{
  "mcpServers": {
    "compliance": {
      "command": "npx",
      "args": ["tsx", "<ABS_PATH>/mcp-server/src/index.ts"]
    }
  }
}
```

Restart Claude Code. Run `/mcp` to see it listed.

### Cursor

Project config at `.cursor/mcp.json`, or global at `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "compliance": {
      "command": "npx",
      "args": ["tsx", "<ABS_PATH>/mcp-server/src/index.ts"]
    }
  }
}
```

Cursor → Settings → MCP → enable `compliance`.

### Windsurf

Global config at `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "compliance": {
      "command": "npx",
      "args": ["tsx", "<ABS_PATH>/mcp-server/src/index.ts"]
    }
  }
}
```

Windsurf → Cascade settings → MCP servers → refresh.

## Try it

In any of the three editors, ask:

> "Use the compliance MCP server to check whether `console.log('patient ' + patient.ssn)` is HIPAA-compliant. If it isn't, rewrite it."

The agent should call `check_compliance`, get back a §164.312(b) violation, and rewrite the line without the PHI.

## Swapping mocks for real data (tomorrow)

`src/mockData.ts` exports `findPolicySection` and `checkComplianceMock`. Replace those two function bodies with calls into the deployed Convex backend (vector search on `chunks` for the first; `chunks` + LLM for the second). Tool signatures stay the same, so editor configs don't change.
