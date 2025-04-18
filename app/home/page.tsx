"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useContract } from "@/hooks/useContract"
import { useWallet } from "@/context/WalletContext"
import { Button } from "@/components/ui/button"
import { ArrowRight, Trophy, Users, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"

interface Pool {
  id: number
  state: string
  entranceFee: string
  activePlayers: number
  totalPlayers: number
}

interface PopularPlayer {
  address: string
  votes: number
}

export default function HomePage() {
  const { data: session } = useSession()
  const { isConnected } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!session || !isConnected) {
      router.push("/")
    }
  }, [session, isConnected, router])

  const [activePools, setActivePools] = useState<Pool[]>([])
  const [popularPlayers, setPopularPlayers] = useState<PopularPlayer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { getActivePools, getPopularPlayers } = useContract()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        console.log("Fetching active pools...")
        const pools = await getActivePools()
        console.log("Fetched pools:", pools)
        setActivePools(pools)

        // Get popular players from contract
        const popularPlayersData = await getPopularPlayers()
        setPopularPlayers(popularPlayersData)
      } catch (error) {
        console.error("Error in fetchData:", error)
        setActivePools([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [getActivePools, getPopularPlayers])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold font-spacemono">Welcome to the Arena</h1>
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Active Pools</h2>
          <Link href="/arena" className="text-primary/70 hover:text-primary text-sm flex items-center">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full bg-primary/5" />
            ))}
          </div>
        ) : activePools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePools.slice(0, 3).map((pool) => (
              <Link key={pool.id} href={`/arena/${pool.id}`}>
                <div className="pool-card rounded-lg p-6 h-full flex flex-col hover-glow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-primary">Pool #{pool.id}</h3>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">{pool.state}</span>
                  </div>

                  <div className="flex-grow space-y-3">
                    <div className="flex items-center text-primary/70">
                      <Trophy className="h-4 w-4 mr-2" />
                      <span className="text-sm">Entry Fee: {pool.entranceFee} MON</span>
                    </div>

                    <div className="flex items-center text-primary/70">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        Players: {pool.activePlayers}/{pool.totalPlayers}
                      </span>
                    </div>

                    <div className="flex items-center text-primary/70">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">Elimination every 24h</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/10">
                    Enter Arena
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-primary/10 rounded-lg bg-primary/5">
            <p className="text-primary/70">No active pools found</p>
          </div>
        )}
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Popular Players</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full bg-primary/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {popularPlayers.map((player, index) => (
              <div key={index} className="player-card rounded-lg p-4 text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">{index + 1}</span>
                </div>
                <p className="text-sm text-primary/80 truncate">{player.address}</p>
                <p className="text-xs text-primary/60">{player.votes} votes</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/arena">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-16 border-primary/30 text-primary hover:bg-primary/10 btn-glow"
            >
              <Users className="h-5 w-5 mr-2" />
              Join Pools
            </Button>
          </Link>

          <Link href="/arena">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-16 border-primary/30 text-primary hover:bg-primary/10 btn-glow"
            >
              <Trophy className="h-5 w-5 mr-2" />
              View Arena
            </Button>
          </Link>

          <Link href="/profile">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-16 border-primary/30 text-primary hover:bg-primary/10 btn-glow"
            >
              <Users className="h-5 w-5 mr-2" />
              My Profile
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
