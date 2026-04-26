"use client"

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs"
import { ConvexReactClient, useMutation } from "convex/react"
import { ReactNode, useEffect, useRef } from "react"
import { useConvexAuth } from "convex/react"
import { api } from "@/convex/_generated/api"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function UserSync({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useConvexAuth()
  const storeUser = useMutation(api.user.storeUser)
  const synced = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !synced.current) {
      synced.current = true
      storeUser({}).catch(() => {
        synced.current = false
      })
    }
    if (!isAuthenticated) {
      synced.current = false
    }
  }, [isAuthenticated, storeUser])

  return <>{children}</>
}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <UserSync>{children}</UserSync>
    </ConvexAuthNextjsProvider>
  )
}
