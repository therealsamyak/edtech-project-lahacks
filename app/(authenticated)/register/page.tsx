"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  Upload,
  Copy,
  Check,
  ArrowLeft,
  Info,
  FileText,
  Database,
  KeyRound,
  Hash,
} from "lucide-react"

export default function RegisterCompanyPage() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [credentialsShown, setCredentialsShown] = useState(false)
  const [credentials, setCredentials] = useState<{ uuid: string; passphrase: string } | null>(null)
  const [copiedField, setCopiedField] = useState<"uuid" | "passphrase" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const registerCompany = useMutation(api.companies.registerCompany)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file.name)
    setIsProcessing(true)

    try {
      const result = await registerCompany({ name: file.name })
      setCredentials(result)
      setTimeout(() => {
        setIsProcessing(false)
        setCredentialsShown(true)
      }, 800)
    } catch {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string, field: "uuid" | "passphrase") => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
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
        {/* Credentials — LEFT column */}
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
            {credentialsShown && credentials ? (
              <>
                <div>
                  <div className="flex items-center gap-1.5 eyebrow mb-1.5">
                    <Hash className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Company UUID</span>
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
                      {credentials.uuid}
                    </code>
                    <button
                      onClick={() => copyToClipboard(credentials.uuid, "uuid")}
                      className="px-3 flex items-center gap-1.5 text-xs transition-colors border-l"
                      style={{
                        borderColor: "var(--line)",
                        background:
                          copiedField === "uuid" ? "var(--positive-soft)" : "var(--surface)",
                        color: copiedField === "uuid" ? "var(--positive)" : "var(--ink-soft)",
                      }}
                      aria-label="Copy Company UUID"
                    >
                      {copiedField === "uuid" ? (
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>{copiedField === "uuid" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 eyebrow mb-1.5">
                    <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Passphrase</span>
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
                      {credentials.passphrase}
                    </code>
                    <button
                      onClick={() => copyToClipboard(credentials.passphrase, "passphrase")}
                      className="px-3 flex items-center gap-1.5 text-xs transition-colors border-l"
                      style={{
                        borderColor: "var(--line)",
                        background:
                          copiedField === "passphrase" ? "var(--positive-soft)" : "var(--surface)",
                        color: copiedField === "passphrase" ? "var(--positive)" : "var(--ink-soft)",
                      }}
                      aria-label="Copy Passphrase"
                    >
                      {copiedField === "passphrase" ? (
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>{copiedField === "passphrase" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div
                  className="flex gap-3 p-4 rounded-md text-sm"
                  style={{ background: "var(--warning-soft)", color: "var(--ink-soft)" }}
                  role="note"
                >
                  <Info className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <p>
                    These credentials are shown once. Store them in your password manager — you'll
                    need them every time someone sets up access.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Credentials will appear here after uploading your documentation.
              </p>
            )}
          </div>
        </section>

        {/* Upload — RIGHT column */}
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
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
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
                <div
                  className="rounded-md p-3 flex items-start gap-3"
                  style={{ background: "var(--positive-soft)", color: "var(--positive)" }}
                >
                  <Check className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="text-sm">
                    <div style={{ fontWeight: 500 }}>File received</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                      {uploadedFile}
                    </div>
                  </div>
                </div>

                {isProcessing && (
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
                )}

                {!isProcessing && (
                  <div
                    className="rounded-md p-3 flex items-start gap-3"
                    style={{ background: "var(--positive-soft)", color: "var(--positive)" }}
                  >
                    <Check className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                    <div className="text-sm">
                      <div style={{ fontWeight: 500 }}>Ready for training</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                        Your documentation is indexed and searchable.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8">
        <Link
          href="/training"
          className="inline-flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "var(--accent)" }}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Training
        </Link>
      </div>
    </div>
  )
}
