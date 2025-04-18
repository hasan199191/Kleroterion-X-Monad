"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/WalletContext"
import { useContract } from "@/hooks/useContract"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, AlertCircle } from "lucide-react"

interface ActivityEvent {
  id: number | string
  poolId: number
  type: string
  description: string
  timestamp: number
  address?: string
  target?: string
  betType?: string
  amount?: number
}

export default function ActivityPage() {
  const { isConnected } = useWallet()
  const { getActivityEvents } = useContract()
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [poolFilter, setPoolFilter] = useState<number | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        // Fetch events from contract
        const activityEvents = await getActivityEvents()

        // Sort events by timestamp (newest first)
        const sortedEvents = [...activityEvents].sort((a, b) => b.timestamp - a.timestamp)

        setEvents(sortedEvents)
        setFilteredEvents(sortedEvents)
      } catch (error) {
        console.error("Error fetching activity events:", error)
        setEvents([])
        setFilteredEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [getActivityEvents])

  useEffect(() => {
    // Apply filters
    let filtered = [...events]

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (event.address && event.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (event.target && event.target.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (event.type && event.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (event.poolId && event.poolId.toString().includes(searchQuery)),
      )
    }

    if (poolFilter !== null) {
      filtered = filtered.filter((event) => event.poolId === poolFilter)
    }

    // No need to sort here as we're already sorting when fetching

    setFilteredEvents(filtered)
  }, [searchQuery, poolFilter, events])

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getUniquePoolIds = () => {
    const poolIds = new Set<number>()
    events.forEach((event) => poolIds.add(event.poolId))
    return Array.from(poolIds).sort((a, b) => a - b)
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "POOL_CREATED":
        return "bg-blue-100 text-blue-700"
      case "PLAYER_JOINED":
        return "bg-green-100 text-green-700"
      case "PLAYER_ELIMINATED":
        return "bg-red-100 text-red-700"
      case "CHAMPION_DECLARED":
        return "bg-yellow-100 text-yellow-700"
      case "BET_PLACED":
        return "bg-purple-100 text-purple-700"
      case "TICKET_PURCHASED":
        return "bg-indigo-100 text-indigo-700"
      case "TICKET_USED":
        return "bg-cyan-100 text-cyan-700"
      case "VOTE_CAST":
        return "bg-amber-100 text-amber-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8 bg-primary/5" />
        <Skeleton className="h-12 w-full mb-8 bg-primary/5" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full bg-primary/5" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Activity Feed</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/50" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-primary/30 text-primary"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={poolFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setPoolFilter(null)}
            className={
              poolFilter === null
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "border-primary/30 text-primary hover:bg-primary/10"
            }
          >
            All Pools
          </Button>

          {getUniquePoolIds().map((id) => (
            <Button
              key={id}
              variant={poolFilter === id ? "default" : "outline"}
              size="sm"
              onClick={() => setPoolFilter(id)}
              className={
                poolFilter === id
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "border-primary/30 text-primary hover:bg-primary/10"
              }
            >
              Pool #{id}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    Pool #{event.poolId}
                  </span>
                  <span className={`px-3 py-1 ${getEventTypeColor(event.type)} text-xs rounded-full`}>
                    {event.type.replace(/_/g, " ")}
                  </span>
                  {event.betType && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{event.betType}</span>
                  )}
                  {event.amount && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {event.amount} MON
                    </span>
                  )}
                </div>
                <span className="text-xs text-primary/60 mt-2 md:mt-0">{formatTimestamp(event.timestamp)}</span>
              </div>

              <p className="text-primary mb-2">{event.description}</p>

              {(event.address || event.target) && (
                <div className="text-sm text-primary/70">
                  {event.address && (
                    <p className="flex items-center">
                      <span className="font-medium mr-1">User:</span>
                      <span className="bg-primary/5 px-2 py-0.5 rounded">{event.address}</span>
                    </p>
                  )}
                  {event.target && (
                    <p className="flex items-center mt-1">
                      <span className="font-medium mr-1">Target:</span>
                      <span className="bg-primary/5 px-2 py-0.5 rounded">{event.target}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-primary/10 rounded-lg bg-primary/5">
            <AlertCircle className="h-10 w-10 text-primary/50 mx-auto mb-3" />
            <p className="text-primary/70">No activity events found</p>
          </div>
        )}
      </div>
    </div>
  )
}
