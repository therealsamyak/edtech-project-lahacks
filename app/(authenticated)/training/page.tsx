"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageLoader } from "@/components/PageLoader"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  ArrowRight,
  Building2,
  Plus,
  Upload,
  Loader2,
  Trash2,
  AlertCircle,
} from "lucide-react"

function DocumentGroupCard({
  group,
  isExpanded,
  onToggle,
  onUpload,
  onRemove,
  isUploading,
}: {
  group: { documentUuid: string; documentName: string; modules: any[] }
  isExpanded: boolean
  onToggle: () => void
  onUpload: () => void
  onRemove: () => void
  isUploading: boolean
}) {
  const router = useRouter()
  const processingStatus = useQuery(api.training.getDocumentProcessingStatus, {
    documentUuid: group.documentUuid,
  })

  const status = processingStatus?.status ?? null
  const isProcessing = status === "pending"
  const hasError = status === "error"

  return (
    <Card key={group.documentUuid} className="elev p-0" size="default">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-4 text-left flex-1 min-w-0"
          >
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 eyebrow mb-0.5">
                <span>Organization</span>
                <span aria-hidden="true">·</span>
                <span>{group.modules.length} modules</span>
              </div>
              <h2
                className="font-display m-0"
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  lineHeight: 1.25,
                }}
              >
                {group.documentName}
              </h2>
            </div>
          </button>

          <div className="flex items-center gap-1 ml-2">
            <button
              type="button"
              onClick={onUpload}
              disabled={isUploading}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: "var(--muted)" }}
              aria-label="Upload additional documents"
              title="Upload additional documents"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </button>
            <AlertDialog>
              <AlertDialogTrigger
                className="p-1.5 rounded-md transition-colors hover:bg-red-50"
                style={{ color: "var(--destructive)" }}
                aria-label="Remove document"
                title="Remove document"
              >
                <Trash2 className="w-4 h-4" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove &ldquo;{group.documentName}&rdquo;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the document from your training hub. You can always add it back
                    later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={onRemove}>
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 shrink-0" style={{ color: "var(--muted)" }} />
            ) : (
              <ChevronDown className="w-5 h-5 shrink-0" style={{ color: "var(--muted)" }} />
            )}
          </div>
        </div>
      </CardContent>

      {isExpanded && isProcessing && (
        <div
          className="border-t px-5 py-6 flex items-center gap-3"
          style={{ borderColor: "var(--line)" }}
        >
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--muted)" }} />
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            Processing document…
          </span>
        </div>
      )}

      {isExpanded && hasError && (
        <div
          className="border-t px-5 py-6 flex items-center gap-3"
          style={{ borderColor: "var(--line)" }}
        >
          <AlertCircle className="w-4 h-4" style={{ color: "var(--destructive)" }} />
          <span className="text-sm" style={{ color: "var(--destructive)" }}>
            Processing failed. Try uploading again.
          </span>
        </div>
      )}

      {isExpanded && !isProcessing && !hasError && group.modules.length > 0 && (
        <div className="border-t" style={{ borderColor: "var(--line)" }}>
          <ol className="divide-y" style={{ borderColor: "var(--line)" }}>
            {group.modules.map((module: any, idx: number) => (
              <li key={module.title ?? idx}>
                <div className="px-5 py-4 flex items-center gap-5">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: "var(--paper-deep)", color: "var(--ink-soft)" }}
                  >
                    <span
                      className="text-xs"
                      style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 eyebrow mb-0.5">
                      <span>{module.topics?.[0]}</span>
                      <span aria-hidden="true">·</span>
                      <Clock className="w-3 h-3" />
                      <span>{module.duration}</span>
                    </div>
                    <h3
                      className="font-display m-0"
                      style={{ fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.3 }}
                    >
                      {module.title}
                    </h3>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/training/${group.documentUuid}/${encodeURIComponent(module.title)}`,
                      )
                    }
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  )
}

export default function TrainingAccessPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [document, setDocument] = useState("")
  const [uuid, setUuid] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set())
  const [uploadingForDocument, setUploadingForDocument] = useState<string | null>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const pendingDocumentUuid = useRef<string | null>(null)

  const router = useRouter()
  const verifyAccess = useMutation(api.training.verifyAccess)
  const removeUserDocument = useMutation(api.training.removeUserDocument)
  const userDocuments = useQuery(api.training.getUserDocumentsWithModules)
  const allDocuments = useQuery(api.documents.getAllDocuments)
  const addFiles = useMutation(api.documents.addFiles)
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl)

  useEffect(() => {
    if (allDocuments && allDocuments.length > 0) {
      console.log("\n========== ALL DOCUMENTS ==========")
      allDocuments.forEach((c: { name: string; uuid: string; passphrase: string }) => {
        console.log(`Document: ${c.name}`)
        console.log(`  UUID:       ${c.uuid}`)
        console.log(`  Passphrase: ${c.passphrase}`)
      })
      console.log("====================================\n")
    }
  }, [allDocuments])

  const toggleDocument = (uuid: string) => {
    setExpandedDocuments((prev) => {
      const next = new Set(prev)
      if (next.has(uuid)) next.delete(uuid)
      else next.add(uuid)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      await verifyAccess({ document: document || undefined, uuid, passphrase })
      setDialogOpen(false)
      setDocument("")
      setUuid("")
      setPassphrase("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const hasDocuments = userDocuments && userDocuments.length > 0

  const MAX_FILE_SIZE = 50 * 1024 * 1024

  const triggerUpload = (documentUuid: string) => {
    pendingDocumentUuid.current = documentUuid
    uploadInputRef.current?.click()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const uuid = pendingDocumentUuid.current
    if (!uuid) return

    const oversized = files.find((f) => f.size > MAX_FILE_SIZE)
    if (oversized) {
      setError(`"${oversized.name}" exceeds the 50 MB limit.`)
      e.target.value = ""
      return
    }

    setUploadingForDocument(uuid)

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

      await addFiles({ documentUuid: uuid, documents: uploadedDocs })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setUploadingForDocument(null)
      pendingDocumentUuid.current = null
      e.target.value = ""
    }
  }

  return (
    <div>
      <input
        ref={uploadInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileUpload}
        className="sr-only"
      />
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Training hub</div>
          <h1 className="font-display" style={{ fontWeight: 500 }}>
            Your training modules.
          </h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>Add document</span>
          </Button>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="eyebrow mb-1">Access</div>
              <DialogTitle className="font-display" style={{ fontWeight: 500 }}>
                Document credentials
              </DialogTitle>
              <DialogDescription>
                Enter the credentials your administrator issued. Once verified, this document will
                appear in your training hub.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="document-select"
                  className="block text-sm mb-1.5"
                  style={{ color: "var(--ink)" }}
                >
                  Document <span style={{ color: "var(--muted)" }}>(optional)</span>
                </label>
                <Combobox
                  items={allDocuments ?? []}
                  onValueChange={(v) => {
                    const selected = allDocuments?.find((c: { name: string }) => c.name === v)
                    if (selected) {
                      setDocument(selected.name)
                      setUuid(selected.uuid)
                    }
                  }}
                >
                  <ComboboxInput
                    id="document-select"
                    placeholder="Select a document…"
                    className="h-9 bg-input-background border-line"
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No documents found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item._id} value={item.name}>
                          {item.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div>
                <label
                  htmlFor="uuid"
                  className="block text-sm mb-1.5"
                  style={{ color: "var(--ink)" }}
                >
                  Document UUID
                </label>
                <Input
                  id="uuid"
                  type="text"
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  placeholder="comp-a7f3e9d2-…"
                  className="h-9 font-mono bg-input-background border-line"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="passphrase"
                  className="block text-sm mb-1.5"
                  style={{ color: "var(--ink)" }}
                >
                  Passphrase
                </label>
                <Input
                  id="passphrase"
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter your passphrase"
                  required
                />
              </div>

              {error && (
                <p className="text-sm" style={{ color: "var(--destructive)" }}>
                  {error}
                </p>
              )}

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    "Verifying…"
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Access training</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {!userDocuments ? (
        <PageLoader label="Loading documents…" />
      ) : !hasDocuments ? (
        <div className="text-center py-16">
          <div
            className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-4"
            style={{ background: "var(--paper-deep)" }}
          >
            <Building2 className="w-6 h-6" style={{ color: "var(--muted)" }} />
          </div>
          <p className="font-display" style={{ fontWeight: 500 }}>
            No documents added yet.
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Add a document using the button above to see training modules.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userDocuments.map((group) => (
            <DocumentGroupCard
              key={group.documentUuid}
              group={group}
              isExpanded={expandedDocuments.has(group.documentUuid)}
              onToggle={() => toggleDocument(group.documentUuid)}
              onUpload={() => triggerUpload(group.documentUuid)}
              onRemove={() => removeUserDocument({ documentUuid: group.documentUuid })}
              isUploading={uploadingForDocument === group.documentUuid}
            />
          ))}
        </div>
      )}
    </div>
  )
}
