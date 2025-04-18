"use client"

import PlayerCard from "@/components/PlayerCard"
import VotingPlayerCard from "@/components/VotingPlayerCard"
import { useSession } from "next-auth/react"
import { useWallet } from "@/context/WalletContext"
import { useEffect, useState } from "react"

const fetchPlayer = async (twitterId: string) => {
  try {
    const response = await fetch(`/api/players/${twitterId}`)
    if (!response.ok) {
      throw new Error('API yanıt vermedi')
    }
    return await response.json()
  } catch (error) {
    console.error("Oyuncu bilgileri alınamadı:", error)
    return null
  }
}

export default function TestCardPage() {
  const { data: session } = useSession()
  const wallet = useWallet()
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchPlayer(session.user.id)
        .then(data => setPlayer(data))
        .catch(console.error)
    }
  }, [session])

  const mockPlayer = {
    id: "9ea70f6f-69c8-424f-9010-0fc26108b5c1",
    twitter_id: session?.user?.id || "",
    twitter_username: session?.user?.username || "chefcryptoz",
    wallet_address: wallet?.address || "0x0ba45d1a93974c460144640f9752ede1e47519a5",
    profile_image: session?.user?.image || "https://pbs.twimg.com/profile_images/1890098734047862784/1ug23ta2_normal.jpg",
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    is_active: true
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Arena Kartları */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Arena Kartları</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <PlayerCard player={mockPlayer} rank={1} status="active" rarity={6} />
          <PlayerCard player={mockPlayer} rank={2} status="eliminated" rarity={4} />
          <PlayerCard player={mockPlayer} rank={3} status="champion" rarity={5} />
          <PlayerCard player={mockPlayer} rank={4} status="active" rarity={3} />
          <PlayerCard player={mockPlayer} rank={5} status="active" rarity={2} />
          <PlayerCard player={mockPlayer} rank={6} status="active" rarity={1} />
        </div>
      </div>

      {/* Voting Kartları */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Voting Kartları</h2>
        <div className="space-y-3 max-w-3xl">
          <VotingPlayerCard 
            player={mockPlayer} 
            playerNumber={12} 
            voteCount={11} 
          />
          <VotingPlayerCard 
            player={mockPlayer} 
            playerNumber={87} 
            voteCount={14} 
          />
          <VotingPlayerCard 
            player={mockPlayer} 
            playerNumber={98} 
            voteCount={15} 
            isEliminated={true} 
          />
        </div>
      </div>
    </div>
  )
}