import { Password } from "@convex-dev/auth/providers/Password"
import { convexAuth } from "@convex-dev/auth/server"

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile: (params) => {
        const email = params.email

        if (typeof email !== "string" || email.trim().length === 0) {
          throw new Error("Email is required.")
        }

        return {
          email: email.trim().toLowerCase(),
        }
      },
      validatePasswordRequirements: (password) => {
        if (password.length < 10) {
          throw new Error("Password must be at least 10 characters.")
        }
        if (!/[A-Z]/.test(password)) {
          throw new Error("Password must contain at least one uppercase letter.")
        }
        if (!/[a-z]/.test(password)) {
          throw new Error("Password must contain at least one lowercase letter.")
        }
        if (!/[0-9]/.test(password)) {
          throw new Error("Password must contain at least one number.")
        }
      },
    }),
  ],
})
