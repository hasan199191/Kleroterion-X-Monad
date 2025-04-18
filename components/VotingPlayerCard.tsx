"use client"

import { Player } from "@/services/playerService"
import Image from "next/image"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface VotingPlayerCardProps {
  player: Player
  voteCount?: number
  playerNumber: number
  isEliminated?: boolean
  onVote?: () => void
}

export default function VotingPlayerCard({
  player,
  voteCount = 0,
  playerNumber,
  isEliminated = false,
  onVote
}: VotingPlayerCardProps) {
  const twitterProfileUrl = `https://x.com/${player.twitter_username}`

  return (
    <div className={cn(
      "w-full bg-gray-800/50 rounded-lg p-2 transition-all",
      "border border-purple-500/20 hover:border-purple-500/40",
      "flex items-center justify-between gap-4",
      isEliminated && "opacity-60"
    )}>
      {/* Sol taraf - Oyuncu numarası */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center">
          <span className="text-2xl font-mono font-bold text-purple-400">
            {playerNumber}
          </span>
        </div>

        {/* Oyuncu bilgileri */}
        <div className="flex items-center gap-3">
          {/* Profil resmi */}
          <div className="relative w-10 h-10">
            <Image
              src={player.profile_image}
              alt={player.twitter_username}
              fill
              className="object-cover rounded-lg"
            />
          </div>

          {/* İsim ve cüzdan */}
          <div className="flex flex-col">
            <Link 
              href={twitterProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-medium hover:text-purple-400 transition-colors"
            >
              @{player.twitter_username}
            </Link>
            <span className="text-xs text-gray-400">
              {player.wallet_address.slice(0, 6)}...{player.wallet_address.slice(-4)}
            </span>
          </div>
        </div>
      </div>

      {/* Sağ taraf - Durum ve oy */}
      <div className="flex items-center gap-4">
        <div className={cn(
          "px-3 py-1 rounded-full text-sm",
          isEliminated 
            ? "bg-red-500/20 text-red-300" 
            : "bg-green-500/20 text-green-300"
        )}>
          {isEliminated ? "Eliminated" : "Active"}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-purple-300 font-medium">{voteCount}</span>
          <span className="text-purple-400 text-sm">votes</span>
        </div>
      </div>
    </div>
  )
}