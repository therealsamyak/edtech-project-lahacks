"use client"

import { useConvexAuth } from "convex/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageLoader } from "@/components/PageLoader"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
