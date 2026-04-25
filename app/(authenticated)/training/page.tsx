"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ChevronDown, ChevronUp, Sparkles, Clock, ArrowRight, Building2, Plus } from "lucide-react"

export default function TrainingAccessPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [company, setCompany] = useState("")
  const [uuid, setUuid] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set())

  const router = useRouter()
  const verifyAccess = useMutation(api.training.verifyAccess)
  const userCompanies = useQuery(api.training.getUserCompaniesWithModules)

  const toggleCompany = (uuid: string) => {
    setExpandedCompanies((prev) => {
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
      const result = await verifyAccess({ company, uuid, passphrase })
      setDialogOpen(false)
      setCompany("")
      setUuid("")
      setPassphrase("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const hasCompanies = userCompanies && userCompanies.length > 0

  return (
    <div>
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
            <span>Add company</span>
          </Button>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="eyebrow mb-1">Access</div>
              <DialogTitle className="font-display" style={{ fontWeight: 500 }}>
                Company credentials
              </DialogTitle>
              <DialogDescription>
                Enter the credentials your administrator issued. Once verified, this company will
                appear in your training hub.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm mb-1.5"
                  style={{ color: "var(--ink)" }}
                >
                  Company
                </label>
                <Input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corporation"
                  className="h-9 bg-input-background border-line"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="uuid"
                  className="block text-sm mb-1.5"
                  style={{ color: "var(--ink)" }}
                >
                  Company UUID
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

      {!userCompanies ? (
        <p style={{ color: "var(--muted)" }}>Loading your companies…</p>
      ) : !hasCompanies ? (
        <div className="text-center py-16">
          <div
            className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-4"
            style={{ background: "var(--paper-deep)" }}
          >
            <Building2 className="w-6 h-6" style={{ color: "var(--muted)" }} />
          </div>
          <p className="font-display" style={{ fontWeight: 500 }}>
            No companies added yet.
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Add a company using the button above to see training modules.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userCompanies.map((group) => {
            const isExpanded = expandedCompanies.has(group.companyUuid)
            return (
              <Card key={group.companyUuid} className="elev p-0" size="default">
                <button
                  onClick={() => toggleCompany(group.companyUuid)}
                  className="w-full text-left"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                        >
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
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
                            {group.companyName}
                          </h2>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" style={{ color: "var(--muted)" }} />
                      ) : (
                        <ChevronDown className="w-5 h-5" style={{ color: "var(--muted)" }} />
                      )}
                    </div>
                  </CardContent>
                </button>

                {isExpanded && group.modules.length > 0 && (
                  <div className="border-t" style={{ borderColor: "var(--line)" }}>
                    <ol className="divide-y" style={{ borderColor: "var(--line)" }}>
                      {group.modules.map((module: any, idx: number) => (
                        <li key={module._id}>
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
                                <span>{module.topics[0]}</span>
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
                                router.push(`/training/${group.companyUuid}/${module._id}`)
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
          })}
        </div>
      )}
    </div>
  )
}
