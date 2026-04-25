"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const { signOut } = useAuthActions()

  return (
    <Button variant="ghost" onClick={() => void signOut()} aria-label="Sign out">
      <LogOut className="size-4" aria-hidden="true" />
      <span>Sign out</span>
    </Button>
  )
}
