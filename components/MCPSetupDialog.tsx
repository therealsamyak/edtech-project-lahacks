"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Check, Copy, Terminal, FolderOpen, Sparkles } from "lucide-react"

type EditorKey = "claude" | "cursor" | "windsurf"

type EditorConfig = {
  label: string
  path: string
  pathHint: string
  serverKey: string
}

const MCP_PAYLOAD = {
  command: "npx",
  args: ["tsx", "<ABS_PATH>/mcp-server/src/index.ts"],
}

const EDITORS: Record<EditorKey, EditorConfig> = {
  claude: {
    label: "Claude Code",
    path: ".mcp.json",
    pathHint: "Place in your project repo root, then restart Claude Code and run /mcp.",
    serverKey: "compliance",
  },
  cursor: {
    label: "Cursor",
    path: ".cursor/mcp.json",
    pathHint:
      "Project-level config. For global use ~/.cursor/mcp.json. Then enable in Settings → MCP.",
    serverKey: "compliance",
  },
  windsurf: {
    label: "Windsurf",
    path: "~/.codeium/windsurf/mcp_config.json",
    pathHint: "Global config. Refresh in Cascade settings → MCP servers.",
    serverKey: "compliance",
  },
}

function buildJson(serverKey: string): string {
  return JSON.stringify({ mcpServers: { [serverKey]: MCP_PAYLOAD } }, null, 2)
}

function CopyField({
  label,
  value,
  monospace = true,
  icon,
}: {
  label: string
  value: string
  monospace?: boolean
  icon: React.ReactNode
}) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 eyebrow mb-1.5">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className="flex items-stretch rounded-md overflow-hidden"
        style={{ border: "1px solid var(--line)" }}
      >
        <pre
          className="flex-1 px-3 py-2.5 text-xs overflow-x-auto m-0"
          style={{
            fontFamily: monospace ? "var(--font-mono)" : undefined,
            background: "var(--paper)",
            color: "var(--ink)",
            whiteSpace: "pre",
          }}
        >
          {value}
        </pre>
        <button
          type="button"
          onClick={onCopy}
          className="px-3 flex items-center gap-1.5 text-xs transition-colors border-l shrink-0"
          style={{
            borderColor: "var(--line)",
            background: copied ? "var(--positive-soft)" : "var(--surface)",
            color: copied ? "var(--positive)" : "var(--ink-soft)",
          }}
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  )
}

export function MCPSetupDialog() {
  const [open, setOpen] = useState(false)
  const [activeEditor, setActiveEditor] = useState<EditorKey>("claude")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Terminal className="w-4 h-4" />
            <span>Connect to coding agent</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="eyebrow mb-1">MCP setup</div>
          <DialogTitle className="font-display" style={{ fontWeight: 500 }}>
            Wire compliance into your editor
          </DialogTitle>
          <DialogDescription>
            The compliance MCP server exposes <code>get_policy_section</code> and{" "}
            <code>check_compliance</code> to your AI coding agent — checking code against your
            company policies. Pick your editor, save the config to the listed path, and replace{" "}
            <code>&lt;ABS_PATH&gt;</code> with the absolute path to your local checkout.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeEditor}
          onValueChange={(v) => setActiveEditor(v as EditorKey)}
          className="mt-2"
        >
          <TabsList className="w-full">
            {(Object.keys(EDITORS) as EditorKey[]).map((key) => (
              <TabsTrigger key={key} value={key} className="flex-1">
                {EDITORS[key].label}
              </TabsTrigger>
            ))}
          </TabsList>

          {(Object.keys(EDITORS) as EditorKey[]).map((key) => {
            const cfg = EDITORS[key]
            return (
              <TabsContent key={key} value={key} className="space-y-4 mt-4">
                <CopyField
                  label="Save to"
                  value={cfg.path}
                  icon={<FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />}
                />
                <CopyField
                  label="JSON payload"
                  value={buildJson(cfg.serverKey)}
                  icon={<Sparkles className="w-3.5 h-3.5" aria-hidden="true" />}
                />
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {cfg.pathHint}
                </p>
              </TabsContent>
            )
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
