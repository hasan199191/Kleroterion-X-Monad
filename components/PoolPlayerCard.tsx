import { cn } from "@/lib/utils"
import Image from "next/image"
import { VoteIcon } from "lucide-react"
import { useState, useEffect } from "react"

interface PoolPlayerCardProps {
  player: {
    address: string
    twitter_username?: string
    profile_image?: string
    votes: number
    isActive: boolean
  }
}

export default function PoolPlayerCard({ player }: PoolPlayerCardProps) {
  const [imageError, setImageError] = useState(false)
  const [localVotes, setLocalVotes] = useState(player.votes)

  // Vote güncellemelerini takip et
  useEffect(() => {
    if (player.votes !== localVotes) {
      setLocalVotes(player.votes)
      console.log(`Vote güncellendi: ${player.address} - ${player.votes} oy`)
    }
  }, [player.votes])

  // Debug için detaylı log
  useEffect(() => {
    console.log("Player Vote Data:", {
      address: player.address,
      votes: player.votes,
      localVotes,
      timestamp: new Date().toISOString()
    })
  }, [player.votes, localVotes])

  // Debug için
  useEffect(() => {
    console.log("Player Data:", player)
  }, [player])

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border",
      "border-primary/20 hover:border-primary/40 transition-colors",
      "bg-primary/5"
    )}>
      <div className="flex items-center space-x-4">
        {/* Profil Resmi */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          {!imageError && player.profile_image ? (
            <Image
              src={player.profile_image}
              alt={player.twitter_username || "Player"}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Image
              src={`https://api.dicebear.com/7.x/avatars/svg?seed=${player.address}`}
              alt={player.twitter_username || "Player"}
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Kullanıcı Bilgileri */}
        <div>
          {player.twitter_username ? (
            <>
              <p className="font-medium text-primary">@{player.twitter_username}</p>
              <p className="text-sm text-primary/60">
                {player.address.slice(0, 6)}...{player.address.slice(-4)}
              </p>
            </>
          ) : (
            <p className="font-medium text-primary/60">
              {player.address.slice(0, 6)}...{player.address.slice(-4)}
            </p>
          )}
        </div>
      </div>

      {/* Oy Bilgisi - Loading state ekle */}
      <div className="flex items-center space-x-2">
        <VoteIcon className="h-4 w-4 text-primary/60" />
        <span className="text-primary/80">
          {localVotes === undefined ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            `${localVotes} votes`
          )}
        </span>
      </div>
    </div>
  )
}