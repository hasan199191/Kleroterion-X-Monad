"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { Player } from "@/services/playerService"

interface AuthContextType {
  player: Player | null
  setPlayer: (player: Player | null) => void
  twitterData: any | null
  setTwitterData: (data: any) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null)
  const [twitterData, setTwitterData] = useState<any | null>(null)

  useEffect(() => {
    const storedPlayer = localStorage.getItem("player")
    if (storedPlayer) setPlayer(JSON.parse(storedPlayer))
  }, [])

  return (
    <AuthContext.Provider value={{ player, setPlayer, twitterData, setTwitterData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}