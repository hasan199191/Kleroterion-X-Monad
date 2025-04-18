"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useWallet } from "@/context/WalletContext"
import { useContract } from "@/hooks/useContract"
import { Player, playerService } from "@/services/playerService"
import PlayerCard from "@/components/PlayerCard"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Coins, Trophy, VoteIcon } from "lucide-react"

interface PoolEntry {
  id: number
  status: string
  reward: string
  isActive: boolean
  isCompleted: boolean
  hasClaimed: boolean
}

interface BetHistory {
  poolId: number
  target: string
  amount: string
  betType: number
  isWon: boolean
  isClaimed: boolean
}

interface TicketInfo {
  poolId: number
  additionalVotes: number
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { account, isConnected, connectWallet, address } = useWallet()
  const {
    getUserPools,
    getAllUserBets,
    claimPoolReward,
    claimBetReward,
    getUserStats,
    getAllUserTickets,
    getPoolState,
    purchaseVotingTicket,
  } = useContract()

  const [player, setPlayer] = useState<Player | null>(null)
  const [pools, setPools] = useState<PoolEntry[]>([])
  const [bets, setBets] = useState<BetHistory[]>([])
  const [tickets, setTickets] = useState<TicketInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: "0",
    poolsJoined: 0,
    betsPlaced: 0,
  })
  const [processingVotingTicket, setProcessingVotingTicket] = useState<number | null>(null)
  const [poolStatuses, setPoolStatuses] = useState<Record<number, string>>({})
  const [isPurchasingVotingTicket, setIsPurchasingVotingTicket] = useState(false)

  const handlePurchaseVotingTicket = async (poolId: number, ticketPrice: string) => {
    setProcessingVotingTicket(poolId)
    setIsPurchasingVotingTicket(true)

    try {
      const success = await purchaseVotingTicket(poolId, ticketPrice)
      if (success) {
        // Update tickets after purchase
        const updatedTickets = [...tickets]
        const ticketIndex = updatedTickets.findIndex((t) => t.poolId === poolId)

        if (ticketIndex >= 0) {
          updatedTickets[ticketIndex].additionalVotes += 3
        } else {
          updatedTickets.push({
            poolId,
            additionalVotes: 3,
          })
        }

        setTickets(updatedTickets)
      }
      return success
    } catch (error) {
      console.error("Error purchasing voting ticket:", error)
      return false
    } finally {
      setProcessingVotingTicket(null)
      setIsPurchasingVotingTicket(false)
    }
  }

  useEffect(() => {
    const fetchPlayer = async () => {
      if (session?.user?.id) {
        const data = await playerService.getPlayerByTwitterId(session.user.id)
        if (data) setPlayer(data)
      }
    }

    fetchPlayer()
  }, [session?.user?.id])

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !account) return

      setIsLoading(true)
      try {
        // Fetch user pools from contract
        const userPools = await getUserPools()
        setPools(userPools)

        // Fetch user bets from contract
        const userBets = await getAllUserBets()
        setBets(userBets)

        // Fetch user tickets
        const userTickets = await getAllUserTickets()
        setTickets(userTickets)

        // Get user stats
        const userStats = await getUserStats()
        setStats(userStats)

        // Get pool statuses
        const statuses = {}
        // Collect all pool IDs from bets
        const poolIds = [...new Set(userBets.map((bet) => bet.poolId))]

        // Get status for each pool
        for (const poolId of poolIds) {
          try {
            const status = await getPoolState(poolId)
            statuses[poolId] = status
          } catch (error) {
            console.error(`Error fetching pool ${poolId} status:`, error)
          }
        }

        setPoolStatuses(statuses)
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isConnected, account, getUserPools, getAllUserBets, getUserStats, getAllUserTickets, getPoolState])

  // Update the handleClaimPoolReward function to update total earnings after claiming
  const handleClaimPoolReward = async (poolId: number) => {
    const success = await claimPoolReward(poolId)

    if (success) {
      // Get the reward amount before updating
      const claimedPool = pools.find((p) => p.id === poolId)
      const rewardAmount = claimedPool ? Number.parseFloat(claimedPool.reward) : 0

      // Update pools after claiming
      setPools(pools.map((pool) => (pool.id === poolId ? { ...pool, reward: "0", hasClaimed: true } : pool)))

      // Update total earnings
      setStats({
        ...stats,
        totalEarnings: (Number.parseFloat(stats.totalEarnings) - rewardAmount).toFixed(2),
      })
    }
  }

  // Update the handleClaimBetReward function to update total earnings after claiming
  const handleClaimBetReward = async (poolId: number) => {
    const success = await claimBetReward(poolId)

    if (success) {
      // Calculate total reward from this pool's bets before updating
      const poolBets = bets.filter((bet) => bet.poolId === poolId && bet.isWon && !bet.isClaimed)
      let totalReward = 0

      poolBets.forEach((bet) => {
        // Calculate reward based on bet type multiplier (updated for new contract)
        const multiplier = [10, 5, 3, 2][bet.betType] || 1
        totalReward += Number.parseFloat(bet.amount) * multiplier
      })

      // Update bets after claiming - mark all bets for this pool as claimed
      setBets(bets.map((bet) => (bet.poolId === poolId ? { ...bet, isClaimed: true } : bet)))

      // Update total earnings
      setStats({
        ...stats,
        totalEarnings: (Number.parseFloat(stats.totalEarnings) - totalReward).toFixed(2),
      })
    }
  }

  // Update the getBetTypeLabel function to handle undefined betType
  const getBetTypeLabel = (betType: number | undefined) => {
    switch (betType) {
      case 0:
        return "Champion"
      case 1:
        return "Top 3"
      case 2:
        return "Top 5"
      case 3:
        return "Top 10"
      default:
        return "Unknown"
    }
  }

  // Update the getBetStatusLabel function to better handle bet statuses
  const getBetStatusLabel = (bet: BetHistory, poolStatus?: string) => {
    // If pool is not completed, show "Pending"
    if (poolStatus && !poolStatus.includes("COMPLETED") && !poolStatus.includes("Completed")) {
      return "Pending"
    }

    if (bet.isWon === undefined || bet.isWon === null) {
      return "Pending"
    }
    if (bet.isWon) {
      return bet.isClaimed ? "Claimed" : "Won"
    }
    return "Lost"
  }

  // Update the getBetStatusColor function to better handle bet status colors
  const getBetStatusColor = (bet: BetHistory, poolStatus?: string) => {
    // If pool is not completed, show yellow
    if (poolStatus && !poolStatus.includes("COMPLETED") && !poolStatus.includes("Completed")) {
      return "bg-yellow-500/20 text-yellow-500" // Pending
    }

    if (bet.isWon === undefined || bet.isWon === null) {
      return "bg-yellow-500/20 text-yellow-500" // Pending
    }
    if (bet.isWon) {
      return bet.isClaimed
        ? "bg-green-500/20 text-green-500" // Claimed
        : "bg-primary/20 text-primary" // Won but not claimed
    }
    return "bg-red-500/20 text-red-500" // Lost
  }

  if (!session || !player) {
    return <div>Loading...</div>
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Profile</h1>
        <p className="text-primary/70 mb-8">Please connect your wallet to view your profile</p>
        <Button
          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
          onClick={connectWallet}
        >
          Connect Wallet
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8 bg-primary/5" />
        <Skeleton className="h-24 w-full mb-8 bg-primary/5" />
        <Skeleton className="h-8 w-full mb-4 bg-primary/5" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-primary/5" />
          ))}
        </div>
      </div>
    )
  }

  // Update the display of bets to group them by pool
  const groupedBets = bets.reduce((acc, bet) => {
    if (!acc[bet.poolId]) {
      acc[bet.poolId] = []
    }
    acc[bet.poolId].push(bet)
    return acc
  }, {})

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Avatar Card */}
      <div className="flex justify-center mb-8">
        <PlayerCard 
          player={player}
          status={pools.some(p => p.isActive) ? 'active' : 'eliminated'}
          poolStatus={{
            isInPool: pools.some(p => p.isActive),
            poolId: pools.find(p => p.isActive)?.id
          }}
        />
      </div>

      <h1 className="text-3xl font-bold text-primary mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 flex flex-col items-center">
          <Trophy className="h-8 w-8 text-primary mb-2" />
          <h3 className="text-lg font-medium text-primary mb-1">Total Earnings</h3>
          <p className="text-2xl font-bold text-primary">{stats.totalEarnings} MON</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 flex flex-col items-center">
          <VoteIcon className="h-8 w-8 text-primary mb-2" />
          <h3 className="text-lg font-medium text-primary mb-1">Pools Joined</h3>
          <p className="text-2xl font-bold text-primary">{stats.poolsJoined}</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 flex flex-col items-center">
          <Coins className="h-8 w-8 text-primary mb-2" />
          <h3 className="text-lg font-medium text-primary mb-1">Bets Placed</h3>
          <p className="text-2xl font-bold text-primary">{stats.betsPlaced}</p>
        </div>
      </div>

      <Tabs defaultValue="pools" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 bg-background border border-primary/30">
          <TabsTrigger value="pools" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            My Pools
          </TabsTrigger>
          <TabsTrigger value="bets" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Bet History
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            My Voting Tickets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pools">
          <div className="space-y-4">
            {pools.length > 0 ? (
              pools.map((pool) => (
                <div
                  key={pool.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    pool.isCompleted && Number.parseFloat(pool.reward) > 0 && !pool.hasClaimed
                      ? "border-green-500 bg-green-500/10"
                      : "border-primary/20 bg-primary/5"
                  }`}
                >
                  <div>
                    <h3 className="text-primary font-medium">Pool #{pool.id}</h3>
                    <p className="text-sm text-primary/70">Status: {pool.status}</p>
                    {pool.isCompleted && Number.parseFloat(pool.reward) > 0 && !pool.hasClaimed && (
                      <p className="text-sm text-green-500 font-medium">You have unclaimed rewards!</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    {pool.isCompleted && Number.parseFloat(pool.reward) > 0 && !pool.hasClaimed && (
                      <>
                        <p className="text-green-600 font-medium mr-4">Reward: {pool.reward} MON</p>
                        <Button
                          onClick={() => handleClaimPoolReward(pool.id)}
                          size="sm"
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-600 border border-green-500/30"
                        >
                          Claim
                        </Button>
                      </>
                    )}

                    {pool.isCompleted && pool.hasClaimed && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">Claimed</span>
                    )}

                    {!pool.isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => (window.location.href = `/arena/${pool.id}`)}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-primary/10 rounded-lg bg-primary/5">
                <AlertCircle className="h-10 w-10 text-primary/50 mx-auto mb-3" />
                <p className="text-primary/70">You haven't joined any pools yet</p>
                <Button
                  className="mt-4 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  onClick={() => (window.location.href = "/arena")}
                >
                  Browse Available Pools
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bets">
          <div className="space-y-4">
            {Object.keys(groupedBets).length > 0 ? (
              Object.entries(groupedBets).map(([poolId, poolBets]) => {
                // Check if there are any unclaimed winning bets
                const hasUnclaimedWinnings = poolBets.some((bet) => bet.isWon && !bet.isClaimed)

                return (
                  <div
                    key={poolId}
                    className={`border ${
                      hasUnclaimedWinnings ? "border-green-500 bg-green-500/5" : "border-primary/20 bg-primary/5"
                    } rounded-lg p-4`}
                  >
                    <h3 className="text-primary font-medium mb-3">
                      Pool #{poolId}
                      {hasUnclaimedWinnings && (
                        <span className="ml-2 text-sm text-green-500 font-medium">You have unclaimed bet rewards!</span>
                      )}
                    </h3>
                    <div className="space-y-3">
                      {poolBets.map((bet, index) => (
                        <div
                          key={index}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border ${
                            bet.isWon && !bet.isClaimed
                              ? "border-green-500/30 bg-green-500/5"
                              : "border-primary/10 bg-background"
                          }`}
                        >
                          <div className="mb-2 sm:mb-0">
                            <p className="text-sm text-primary">
                              <span className="font-medium">Target:</span>{" "}
                              {bet.target && typeof bet.target === "string" && bet.target.length >= 40
                                ? `${bet.target.substring(0, 6)}...${bet.target.substring(38)}`
                                : String(bet.target || "Unknown")}
                            </p>
                            <p className="text-sm text-primary/70">
                              <span className="font-medium">Amount:</span> {bet.amount || "0"} MON
                            </p>
                            <p className="text-sm text-primary/70">
                              <span className="font-medium">Type:</span> {getBetTypeLabel(bet.betType)}
                            </p>
                          </div>

                          <div className="flex items-center">
                            <span
                              className={`px-3 py-1 ${getBetStatusColor(bet, poolStatuses[Number(poolId)])} text-xs rounded-full`}
                            >
                              {getBetStatusLabel(bet, poolStatuses[Number(poolId)])}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add a claim button for the pool if any bet is won and not claimed */}
                    {poolBets.some((bet) => bet.isWon && !bet.isClaimed) && (
                      <Button
                        onClick={() => handleClaimBetReward(Number(poolId))}
                        size="sm"
                        className="mt-3 bg-green-500/20 hover:bg-green-500/30 text-green-600 border border-green-500/30"
                      >
                        Claim Bet Rewards
                      </Button>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 border border-primary/10 rounded-lg bg-primary/5">
                <AlertCircle className="h-10 w-10 text-primary/50 mx-auto mb-3" />
                <p className="text-primary/70">You haven't placed any bets yet</p>
                <Button
                  className="mt-4 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  onClick={() => (window.location.href = "/arena")}
                >
                  Browse Pools to Place Bets
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <div className="space-y-4">
            {tickets.length > 0 ? (
              tickets.map((ticket, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5"
                >
                  <div>
                    <h3 className="text-primary font-medium">Pool #{ticket.poolId}</h3>

                    {/* Voting Tickets Status */}
                    {ticket.additionalVotes > 0 && (
                      <p className="text-sm text-primary/70">Additional Votes: {ticket.additionalVotes}</p>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 mt-3 md:mt-0">
                    {/* Voting Ticket Actions */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => handlePurchaseVotingTicket(ticket.poolId, "0.05")}
                      disabled={isPurchasingVotingTicket}
                    >
                      {isPurchasingVotingTicket && processingVotingTicket === ticket.poolId ? (
                        "Purchasing..."
                      ) : (
                        <div className="flex items-center">
                          <VoteIcon className="h-4 w-4 mr-1" />
                          Buy More Voting Tickets
                        </div>
                      )}
                    </Button>

                    {/* View Pool Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => (window.location.href = `/arena/${ticket.poolId}`)}
                    >
                      View Pool
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-primary/10 rounded-lg bg-primary/5">
                <AlertCircle className="h-10 w-10 text-primary/50 mx-auto mb-3" />
                <p className="text-primary/70">You don't have any voting tickets yet</p>
                <Button
                  className="mt-4 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  onClick={() => (window.location.href = "/arena")}
                >
                  Browse Pools to Buy Voting Tickets
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
