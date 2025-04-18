"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from "@/lib/utils"
import { Player } from "@/services/playerService"

interface PlayerCardProps {
  player: Player
  rank?: number
  status?: 'active' | 'eliminated' | 'champion'
  rarity?: number
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  poolStatus?: {
    isInPool: boolean
    poolId?: number
  }
}

export default function PlayerCard({ 
  player, 
  rank, 
  status = 'active',
  rarity = 4,
  size = 'sm',
  showDetails = false,
  poolStatus
}: PlayerCardProps) {
  const [imageError, setImageError] = useState(false)
  const [highQualityImage, setHighQualityImage] = useState(player.profile_image)

  useEffect(() => {
    if (player.profile_image) {
      const getHighQualityImage = (url: string) => {
        if (url.includes('_normal.')) {
          return url.replace('_normal.', '_400x400.')
        }
        return url.replace(/_\d+x\d+\./, '_400x400.')
      }

      const highQuality = getHighQualityImage(player.profile_image)
      setHighQualityImage(highQuality)
    }
  }, [player.profile_image])

  const renderStars = () => {
    return Array(rarity).fill(0).map((_, i) => (
      <div key={i} className="w-2 h-2 bg-purple-500 rounded-full" />
    ))
  }

  return (
    <div className="fantasy-card-container">
      <div className={cn(
        "relative fantasy-card",
        size === 'sm' ? "w-[200px] h-[300px]" : 
        size === 'md' ? "w-[280px] h-[420px]" :
        "w-[400px] h-[600px]"
      )}>
        {/* Rarity ve rank göstergeleri */}
        <div className="absolute top-1 left-1 flex gap-0.5">
          {renderStars()}
        </div>
        {rank && (
          <div className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center">
            <span className="text-lg font-bold text-purple-400">#{rank}</span>
          </div>
        )}

        {/* Profil resmi - yükseklik azaltıldı */}
        <div className="relative w-full h-[200px] fantasy-image-container">
          <Image
            src={highQualityImage}
            alt={player.twitter_username}
            fill
            className="object-cover fantasy-image"
            quality={100}
            priority
            sizes="(max-width: 200px) 100vw, 200px"
            onError={() => {
              setImageError(true)
              setHighQualityImage(player.profile_image)
            }}
          />
        </div>

        {/* Kart bilgileri */}
        <div className="absolute bottom-0 left-0 w-full fantasy-info">
          <div className="px-3 py-2">
            <h3 className="text-sm font-bold text-white mb-0.5 truncate">
              @{player.twitter_username}
            </h3>
            <p className="text-xs text-purple-200 opacity-80">
              {`${player.wallet_address.slice(0, 4)}...${player.wallet_address.slice(-4)}`}
            </p>
            
            {/* Sadece havuzda ise durum göster */}
            <div className="mt-1 flex items-center justify-between">
              {poolStatus?.isInPool && (
                <div className={cn(
                  "px-1.5 py-0.5 rounded text-xs font-semibold",
                  status === 'active' && "bg-green-500/80",
                  status === 'eliminated' && "bg-red-500/80",
                  status === 'champion' && "bg-yellow-500/80"
                )}>
                  {status.toUpperCase()}
                </div>
              )}
              
              {/* Havuz durumu */}
              {poolStatus && (
                <div className={cn(
                  "px-1.5 py-0.5 rounded text-xs font-semibold",
                  poolStatus.isInPool ? "bg-blue-500/80" : "bg-gray-500/80"
                )}>
                  {poolStatus.isInPool 
                    ? `POOL #${poolStatus.poolId}` 
                    : 'NOT IN POOL'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detay kısmı sadece showDetails true ise gösterilecek */}
        {showDetails && (
          <div className="mt-4 p-4 border-t border-purple-500/20">
            <h4 className="text-sm font-semibold mb-2">Player Details</h4>
            {/* Ek detaylar burada gösterilecek */}
          </div>
        )}
      </div>
    </div>
  )
}