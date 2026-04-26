"use client"

import { useConvexAuth, useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { api } from "@/convex/_generated/api"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const router = useRouter()
  const storeUser = useMutation(api.user.storeUser)

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      storeUser().catch(() => {})
    }
  }, [isAuthenticated, isLoading, storeUser])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
