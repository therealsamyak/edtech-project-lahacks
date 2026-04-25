"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Sparkles } from "lucide-react"

export default function TrainingAccessPage() {
  const [company, setCompany] = useState("")
  const [uuid, setUuid] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const router = useRouter()
  const verifyAccess = useMutation(api.training.verifyAccess)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const result = await verifyAccess({ company, uuid, passphrase })
      router.push(`/training/${result.uuid}`)
    } catch (err) {
      setIsLoading(false)
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.")
    }
  }

  return (
    <div className="reveal">
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 max-w-xl">
          <div className="eyebrow mb-2">Step 02 — Access</div>
          <h1 className="font-display" style={{ fontWeight: 500 }}>
            Sign in to your training.
          </h1>
          <p className="mt-3">
            Enter the credentials your administrator issued. Your training is private to your
            organization and tailored to your company&apos;s policies.
          </p>

          <ul className="mt-8 space-y-2.5 text-sm" style={{ color: "var(--ink-soft)" }}>
            {[
              "AI summaries of every section",
              "Knowledge checks with instant feedback",
              "Voice playback for hands-free review",
              "Ask the assistant for clarification anytime",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true" style={{ color: "var(--accent)" }}>
                  —
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-5" aria-label="Access training">
          <Card className="elev-md p-0" size="default">
            <CardContent className="p-7">
              <div className="mb-5">
                <div className="eyebrow mb-1">Access</div>
                <h2 className="font-display" style={{ fontSize: "1.4rem", fontWeight: 500 }}>
                  Company credentials
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm mb-1.5"
                    style={{ color: "var(--ink)" }}
                  >
                    Company
                  </label>
                  <div className="relative">
                    <select
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="field appearance-none pr-9 w-full h-9 rounded-md bg-[var(--surface)] border border-[var(--line)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      required
                    >
                      <option value="">Select your company</option>
                      {[
                        "Acme Corporation",
                        "TechStart Solutions",
                        "Global Finance Ltd",
                        "Healthcare Plus",
                        "Retail Innovations Inc",
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: "var(--muted)" }}
                    />
                  </div>
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

                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                  {isLoading ? (
                    "Verifying…"
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      <span>Access training</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
