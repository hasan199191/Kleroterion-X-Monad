"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useContract } from "@/hooks/useContract"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Users, Clock, Crown } from "lucide-react"

interface Pool {
  id: number
  state: string
  entranceFee: string
  activePlayers: number
  totalPlayers: number
  isCompleted: boolean
  champion: string
}

export default function ArenaPage() {
  const [pools, setPools] = useState<Pool[]>([])
  // Tüm havuzları tutacak state'i ekleyelim
  const [allPools, setAllPools] = useState<Pool[]>([])
  const [activeFilter, setActiveFilter] = useState<string>("all") // "all", "active", "completed"
  const [isLoading, setIsLoading] = useState(true)
  // useContract hook'undan getAllPools fonksiyonunu da alalım
  const { getActivePools, getAllPools } = useContract()

  // useEffect içinde tüm havuzları da çekelim
  useEffect(() => {
    const fetchPools = async () => {
      setIsLoading(true)
      try {
        console.log("Fetching all pools...")
        const activePools = await getActivePools()
        const allPoolsData = await getAllPools()
        console.log("Fetched active pools:", activePools)
        console.log("Fetched all pools:", allPoolsData)
        setPools(activePools)
        setAllPools(allPoolsData)
      } catch (error) {
        console.error("Error in fetchData:", error)
        setPools([])
        setAllPools([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPools()
  }, [getActivePools, getAllPools])

  // Filtreleme fonksiyonu ekleyelim
  const filteredPools = () => {
    switch (activeFilter) {
      case "active":
        return pools.filter((pool) => !pool.isCompleted)
      case "completed":
        return allPools.filter((pool) => pool.isCompleted)
      default:
        return allPools
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary">Arena Pools</h1>
      </div>

      {/* Filtreleme butonları */}
      <div className="flex space-x-2 mb-4">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("all")}
          className={
            activeFilter === "all"
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "border-primary/30 text-primary hover:bg-primary/10"
          }
        >
          All Pools
        </Button>
        <Button
          variant={activeFilter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("active")}
          className={
            activeFilter === "active"
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "border-primary/30 text-primary hover:bg-primary/10"
          }
        >
          Active Pools
        </Button>
        <Button
          variant={activeFilter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("completed")}
          className={
            activeFilter === "completed"
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "border-primary/30 text-primary hover:bg-primary/10"
          }
        >
          Completed Pools
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full bg-primary/5" />
          ))}
        </div>
      ) : filteredPools().length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPools().map((pool) => (
            <Link key={pool.id} href={`/arena/${pool.id}`}>
              <div
                className={`pool-card rounded-lg p-6 h-full flex flex-col hover-glow ${pool.isCompleted ? "border-green-500/30 bg-green-500/5" : ""}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-primary">Pool #{pool.id}</h3>
                  <span
                    className={`px-3 py-1 ${pool.isCompleted ? "bg-green-500/20 text-green-500" : "bg-primary/10 text-primary"} text-xs rounded-full`}
                  >
                    {pool.isCompleted ? "Completed" : pool.state}
                  </span>
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

                  {pool.isCompleted && pool.champion ? (
                    <div className="flex items-center text-green-500">
                      <Crown className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        Champion: {pool.champion.substring(0, 6)}...{pool.champion.substring(38)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-primary/70">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">Elimination every 24h</span>
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/10">
                  {pool.isCompleted ? "View Results" : "Enter Arena"}
                </Button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-primary/10 rounded-lg bg-primary/5">
          <p className="text-primary/70">No pools found</p>
        </div>
      )}
    </div>
  )
}
