"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import type { Session } from "next-auth"
import { useWallet } from "@/context/WalletContext"
import { Player, playerService } from "@/services/playerService"

interface UserContextValue {
  player: Player | null
  isReady: boolean
  registerPlayer: () => Promise<Player | null>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null)
  const { data: session } = useSession()
  const wallet = useWallet()
  const address = wallet.address

  useEffect(() => {
    if (session?.user?.id) {
      playerService.getPlayerByTwitterId(session.user.id)
        .then(data => {
          if (data) {
            setPlayer(data)
          }
        })
        .catch(console.error)
    }
  }, [session])

  const registerPlayer = async () => {
    if (!session?.user || !address) return null

    try {
      const newPlayer = await playerService.createPlayer({
        wallet_address: address,
        twitter_id: session.user.id,
        twitter_username: session.user.name || "",
        profile_image: session.user.image || ""
      })

      setPlayer(newPlayer)
      return newPlayer
    } catch (error) {
      console.error("Player registration failed:", error)
      return null
    }
  }

  const isReady = Boolean(player)

  return (
    <UserContext.Provider value={{ player, isReady, registerPlayer }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within UserProvider")
  }
  return context
}