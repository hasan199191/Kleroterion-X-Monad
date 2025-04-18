"use client"

import { createContext, useContext } from "react"
import { signIn } from "next-auth/react"

interface TwitterAuthContextType {
  connectTwitter: () => Promise<void>
  user?: {
    id: string
    username: string
    image?: string
  }
}

const TwitterAuthContext = createContext<TwitterAuthContextType | undefined>(undefined)

export function TwitterAuthProvider({ children }: { children: React.ReactNode }) {
  const connectTwitter = async () => {
    try {
      await signIn("twitter")
    } catch (error) {
      console.error("Twitter bağlantı hatası:", error)
    }
  }

  return (
    <TwitterAuthContext.Provider value={{ connectTwitter }}>
      {children}
    </TwitterAuthContext.Provider>
  )
}

export function useTwitterAuth() {
  const context = useContext(TwitterAuthContext)
  if (context === undefined) {
    throw new Error("useTwitterAuth must be used within a TwitterAuthProvider")
  }
  return context
}