"use client"

import { signIn, useSession } from "next-auth/react"

export function useTwitterAuth() {
  const { data: session } = useSession()

  const connectTwitter = async () => {
    try {
      const result = await signIn("twitter", { redirect: false })
      if (result?.error) {
        throw new Error(result.error)
      }
      return session?.user
    } catch (error) {
      console.error("Twitter auth error:", error)
      throw error
    }
  }

  return {
    connectTwitter,
    user: session?.user,
    isAuthenticated: !!session?.user
  }
}