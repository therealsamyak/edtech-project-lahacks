"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  Upload,
  Copy,
  Check,
  ArrowLeft,
  Info,
  FileText,
  KeyRound,
  Hash,
  X,
  Loader2,
} from "lucide-react"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export default function RegisterDocumentPage() {
  const [documentName, setDocumentName] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [credentialsShown, setCredentialsShown] = useState(false)
  const [credentials, setCredentials] = useState<{ uuid: string; passphrase: string } | null>(null)
  const [copiedField, setCopiedField] = useState<"uuid" | "passphrase" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const registerDocument = useMutation(api.documents.registerDocument)
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl)

  const isSubmitDisabled = !documentName.trim() || files.length === 0 || isUploading || isProcessing

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return

    const oversized = selected.find((f) => f.size > MAX_FILE_SIZE)
    if (oversized) {
      setError(`"${oversized.name}" exceeds the 50 MB limit.`)
      return
    }

    setFiles((prev) => [...prev, ...selected])
    setError(null)
    // Reset input so re-selecting the same file works
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (isSubmitDisabled) return
    setIsUploading(true)
    setError(null)

    try {
      const uploadedDocs: { storageId: Id<"_storage">; originalName: string }[] = []

      for (const file of files) {
        const url = await generateUploadUrl()
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })
        if (!res.ok) throw new Error(`Failed to upload "${file.name}"`)
        const { storageId } = (await res.json()) as { storageId: Id<"_storage"> }
        uploadedDocs.push({ storageId, originalName: file.name })
        console.log(`Document uploaded: ${file.name}`)
      }

      setIsUploading(false)
      setIsProcessing(true)
      const result = await registerDocument({
        name: documentName.trim(),
        documents: uploadedDocs,
      })
      setCredentials(result)
      setTimeout(() => {
        setIsProcessing(false)
        setCredentialsShown(true)
      }, 800)
    } catch (err) {
      setIsUploading(false)
      setIsProcessing(false)
      setError(err instanceof Error ? err.message : "Something went wrong.")
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
          Register a compliance document.
        </h1>
        <p className="mt-3">
          Upload your compliance documentation. We'll process it into searchable training material
          and issue a unique UUID and passphrase your team will use to access it.
        </p>
      </header>

      <div className="grid lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 card elev" aria-labelledby="upload-heading">
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
              PDF only · up to 50 MB per file
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label htmlFor="document-name" className="eyebrow mb-1.5 block">
                Document name
              </label>
              <input
                id="document-name"
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-md px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  color: "var(--ink)",
                }}
              />
            </div>

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
                multiple
                onChange={handleFileSelect}
                className="sr-only"
                id="file-upload"
                aria-describedby="upload-help"
                disabled={isUploading || isProcessing}
              />
              <FileText
                className="w-7 h-7 mx-auto mb-3"
                style={{ color: "var(--ink-soft)" }}
                aria-hidden="true"
              />
              <div className="text-sm" style={{ color: "var(--ink)" }}>
                {files.length > 0
                  ? `${files.length} file${files.length > 1 ? "s" : ""} selected — add more`
                  : "Choose PDFs or drag them here"}
              </div>
              <div id="upload-help" className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Your files stay private to your organization.
              </div>
            </label>

            {files.length > 0 && (
              <ul className="space-y-2" aria-label="Selected files">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="rounded-md p-3 flex items-center gap-3"
                    style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
                  >
                    <FileText
                      className="w-4 h-4 shrink-0"
                      style={{ color: "var(--ink-soft)" }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-sm truncate" style={{ color: "var(--ink)" }}>
                      {file.name}
                    </span>
                    <span className="text-xs shrink-0" style={{ color: "var(--muted)" }}>
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="p-1 rounded transition-colors"
                      style={{ color: "var(--ink-soft)" }}
                      aria-label={`Remove ${file.name}`}
                      disabled={isUploading || isProcessing}
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <div
                className="rounded-md p-3 text-sm"
                style={{ background: "var(--warning-soft)", color: "var(--ink-soft)" }}
                role="alert"
              >
                {error}
              </div>
            )}

            {(isUploading || isProcessing) && (
              <div className="rounded-md p-4" style={{ background: "var(--accent-soft)" }}>
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--accent)" }}>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>
                    {isUploading
                      ? `Uploading ${files.length} file${files.length > 1 ? "s" : ""}…`
                      : "Processing documentation…"}
                  </span>
                </div>
                <div
                  className="mt-3 h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(47,74,122,0.18)" }}
                  role="progressbar"
                  aria-label="Uploading"
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: "var(--accent)",
                      width: isUploading ? "40%" : "70%",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <div className="text-xs mt-2" style={{ color: "var(--ink-soft)" }}>
                  {isUploading
                    ? "Sending files to secure storage."
                    : "Tokenizing, embedding, and indexing for retrieval."}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: isSubmitDisabled ? "var(--line)" : "var(--accent)",
                color: isSubmitDisabled ? "var(--muted)" : "var(--surface)",
                cursor: isSubmitDisabled ? "not-allowed" : "pointer",
              }}
            >
              {isUploading ? "Uploading…" : isProcessing ? "Processing…" : "Register document"}
            </button>
          </div>
        </section>

        <section className="lg:col-span-2 card elev" aria-labelledby="cred-heading">
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
                    <span>Document UUID</span>
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
                      aria-label="Copy Document UUID"
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
