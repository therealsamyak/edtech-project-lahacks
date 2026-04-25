import { useState } from "react"
import { Upload, Copy, Check, FileText, Database, KeyRound, Hash, Info } from "lucide-react"

export function RegisterCompany() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [copiedUUID, setCopiedUUID] = useState(false)
  const [copiedPassphrase, setCopiedPassphrase] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const mockUUID = "comp-a7f3e9d2-4c8b-11ef-9a2c-0242ac120002"
  const mockPassphrase = "secure-dolphin-cascade-2026"

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name)
      setIsProcessing(true)
      setTimeout(() => setIsProcessing(false), 2200)
    }
  }

  const copyToClipboard = (text: string, type: "uuid" | "passphrase") => {
    navigator.clipboard.writeText(text)
    if (type === "uuid") {
      setCopiedUUID(true)
      setTimeout(() => setCopiedUUID(false), 1800)
    } else {
      setCopiedPassphrase(true)
      setTimeout(() => setCopiedPassphrase(false), 1800)
    }
  }

  return (
    <div>
      <header className="mb-8 max-w-2xl">
        <div className="eyebrow mb-2">Step 01 — Onboarding</div>
        <h1 className="font-display" style={{ fontWeight: 500 }}>
          Register your company.
        </h1>
        <p className="mt-3">
          Upload your compliance documentation. We'll process it into searchable training material
          and issue a unique UUID and passphrase your team will use to access it.
        </p>
      </header>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Credentials */}
        <section className="lg:col-span-3 card elev" aria-labelledby="cred-heading">
          <div className="px-6 py-5 border-b" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" style={{ color: "var(--accent)" }} aria-hidden="true" />
              <h2
                id="cred-heading"
                className="font-display"
                style={{ fontSize: "1.1rem", fontWeight: 500 }}
              >
                Issued credentials
              </h2>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Share these with employees so they can access training.
            </p>
          </div>

          <div className="p-6 space-y-5">
            <CredentialRow
              icon={<Hash className="w-3.5 h-3.5" aria-hidden="true" />}
              label="Company UUID"
              value={mockUUID}
              copied={copiedUUID}
              onCopy={() => copyToClipboard(mockUUID, "uuid")}
            />
            <CredentialRow
              icon={<KeyRound className="w-3.5 h-3.5" aria-hidden="true" />}
              label="Passphrase"
              value={mockPassphrase}
              copied={copiedPassphrase}
              onCopy={() => copyToClipboard(mockPassphrase, "passphrase")}
            />

            <div
              className="flex gap-3 p-4 rounded-md text-sm"
              style={{ background: "var(--warning-soft)", color: "var(--ink-soft)" }}
              role="note"
            >
              <Info className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <p>
                These credentials are shown once. Store them in your password manager — you'll need
                them every time someone sets up access.
              </p>
            </div>
          </div>
        </section>

        {/* Upload */}
        <section className="lg:col-span-2 card elev" aria-labelledby="upload-heading">
          <div className="px-6 py-5 border-b" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" style={{ color: "var(--accent)" }} aria-hidden="true" />
              <h2
                id="upload-heading"
                className="font-display"
                style={{ fontSize: "1.1rem", fontWeight: 500 }}
              >
                Upload documentation
              </h2>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              PDF only · up to 50 MB
            </p>
          </div>

          <div className="p-6">
            <label
              htmlFor="file-upload"
              className="block rounded-md p-6 text-center cursor-pointer transition-colors"
              style={{
                background: "var(--paper)",
                border: "1px dashed var(--line-strong)",
              }}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="sr-only"
                id="file-upload"
                aria-describedby="upload-help"
              />
              <FileText
                className="w-7 h-7 mx-auto mb-3"
                style={{ color: "var(--ink-soft)" }}
                aria-hidden="true"
              />
              <div className="text-sm" style={{ color: "var(--ink)" }}>
                {uploadedFile ?? "Choose a PDF or drag it here"}
              </div>
              <div id="upload-help" className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Your file stays private to your organization.
              </div>
            </label>

            {uploadedFile && (
              <div className="mt-5 space-y-3" aria-live="polite">
                <StatusRow tone="positive" title="File received" detail={uploadedFile} />

                {isProcessing ? (
                  <div className="rounded-md p-4" style={{ background: "var(--accent-soft)" }}>
                    <div
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "var(--accent)" }}
                    >
                      <Database className="w-4 h-4" aria-hidden="true" />
                      <span>Processing documentation…</span>
                    </div>
                    <div
                      className="mt-3 h-1.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(47,74,122,0.18)" }}
                      role="progressbar"
                      aria-label="Indexing"
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ background: "var(--accent)", width: "70%" }}
                      />
                    </div>
                    <div className="text-xs mt-2" style={{ color: "var(--ink-soft)" }}>
                      Tokenizing, embedding, and indexing for retrieval.
                    </div>
                  </div>
                ) : (
                  <StatusRow
                    tone="positive"
                    title="Ready for training"
                    detail="Your documentation is indexed and searchable."
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function CredentialRow({
  icon,
  label,
  value,
  copied,
  onCopy,
}: {
  icon: React.ReactNode
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}) {
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
        <code
          className="flex-1 px-3 py-2.5 text-sm break-all"
          style={{
            fontFamily: "var(--font-mono)",
            background: "var(--paper)",
            color: "var(--ink)",
          }}
        >
          {value}
        </code>
        <button
          onClick={onCopy}
          className="px-3 flex items-center gap-1.5 text-xs transition-colors border-l"
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

function StatusRow({ tone, title, detail }: { tone: "positive"; title: string; detail: string }) {
  return (
    <div
      className="rounded-md p-3 flex items-start gap-3"
      style={{
        background: tone === "positive" ? "var(--positive-soft)" : "var(--paper-deep)",
        color: tone === "positive" ? "var(--positive)" : "var(--ink-soft)",
      }}
    >
      <Check className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="text-sm">
        <div style={{ fontWeight: 500 }}>{title}</div>
        <div className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
          {detail}
        </div>
      </div>
    </div>
  )
}
