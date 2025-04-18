"use client"

import { useState, useEffect } from "react"
import { useContract } from "@/hooks/useContract"
import { playerService } from "@/services/playerService"

const PoolPlayerCard = ({ player }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    eliminated: 'bg-red-100 text-red-800'
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <img
          src={player.profileImage || '/images/default-avatar.png'}
          alt={player.twitterUsername}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
          onError={(e) => {
            e.target.src = '/images/default-avatar.png'
          }}
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">
            {player.twitterUsername || `${player.address.slice(0, 6)}...${player.address.slice(-4)}`}
          </h3>
          
          <div className="flex justify-between items-center mt-2">
            <span className={`px-2 py-1 rounded-md text-sm ${statusColors[player.status]}`}>
              {player.status === 'active' ? 'Aktif' : 'Elendi'}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-blue-600 font-bold">{player.votes}</span>
              <span className="text-gray-500 text-sm">Oy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PoolPlayersPage() {
  const [players, setPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [poolId] = useState(1)
  const { contract, getPoolPlayers, getCandidateVotes } = useContract()

  const fetchPlayerData = async (players, isActive) => {
    return Promise.all(players.map(async (player) => {
      try {
        const [profile, votes] = await Promise.all([
          playerService.getPlayerByWallet(player.address),
          getCandidateVotes(poolId, player.address)
        ])

        return {
          address: player.address,
          twitterUsername: profile?.twitter_username || '',
          profileImage: profile?.profile_image || '',
          votes: votes,
          status: isActive ? 'active' : 'eliminated',
          joinTime: player.joinTime
        }
      } catch (error) {
        console.error(`Oyuncu verisi alınamadı: ${player.address}`, error)
        return {
          ...player,
          votes: 0,
          status: isActive ? 'active' : 'eliminated',
          twitterUsername: '',
          profileImage: ''
        }
      }
    }))
  }

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        // Kontrattan oyuncu listesini al
        const poolData = await getPoolPlayers(poolId)
        
        // Aktif ve elenmiş oyuncuları paralel işle
        const [activePlayers, eliminatedPlayers] = await Promise.all([
          fetchPlayerData(poolData.active, true),
          fetchPlayerData(poolData.eliminated, false)
        ])

        setPlayers([...activePlayers, ...eliminatedPlayers])
      } catch (error) {
        console.error("Oyuncu listesi yüklenemedi:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPlayers()
  }, [contract, poolId, getPoolPlayers])

  useEffect(() => {
    const voteUpdater = setInterval(async () => {
      if (players.length > 0) {
        const updatedPlayers = await Promise.all(
          players.map(async (player) => ({
            ...player,
            votes: await getCandidateVotes(poolId, player.address)
          }))
        )
        setPlayers(updatedPlayers)
      }
    }, 15000)

    return () => clearInterval(voteUpdater)
  }, [players, poolId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{poolId}. Pool Oy Durumu</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players
            .sort((a, b) => b.votes - a.votes)
            .map((player) => (
              <PoolPlayerCard 
                key={player.address}
                player={player}
              />
            ))}
        </div>

        {players.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Henüz katılımcı bulunmamaktadır
          </div>
        )}
      </div>
    </main>
  )
}