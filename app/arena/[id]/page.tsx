"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useWallet } from "@/context/WalletContext"
import { useContract } from "@/hooks/useContract"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, AlertTriangle, Info, ShieldAlert, VoteIcon, Trophy, Users, Crown, AlertCircle } from "lucide-react"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"
import PlayerCard from "@/components/PlayerCard"

interface Player {
  address: string
  isActive: boolean
  joinTime: number
  votes?: number
  isCurrentUser?: boolean
  twitter_username?: string
  profile_image?: string
}

interface PoolDetails {
  id: number
  state: string
  entranceFee: string
  ticketPrice: string
  activePlayers: number
  totalPlayers: number
  isActive: boolean
  isPaused: boolean
  isCompleted?: boolean
  champion?: string
  totalEntranceFees?: ethers.BigNumberish
  totalBetFees?: ethers.BigNumberish
  candidatesToSelect?: number
}

// Safe contract call helper function
const safeContractCall = async (method: string, ...args: any[]) => {
  if (!contract) {
    console.log("Contract is not initialized")
    return null
  }
  
  const maxRetries = 3
  let retryCount = 0
  
  while (retryCount < maxRetries) {
    try {
      // @ts-ignore - Dynamic method call
      return await contract[method](...args)
    } catch (error) {
      retryCount++
      console.log(`Call to ${method} failed (${retryCount}/${maxRetries}):`, error)
      
      if (retryCount >= maxRetries) {
        console.error(`Failed after ${maxRetries} retries`)
        return null
      }
      
      // Wait before retrying (increasing delay)
      await new Promise(r => setTimeout(r, 1000 * retryCount))
    }
  }
  return null
}

export default function ArenaDetailPage() {
  const { id } = useParams()
  const poolId = Number(id)
  const { account, isConnected, contract } = useWallet()
  const {
    getPoolPlayers,
    voteForCandidate,
    placeBet,
    getRemainingVotes,
    getTotalVotingRights,
    joinPool,
    getPoolState,
    checkUserTickets,
    purchaseVotingTicket,
    voteForMultipleCandidates,
    getTopTenPlayers,
    getTopTenPlayersWithRanks,
  } = useContract()
  const { toast } = useToast()

  const [pool, setPool] = useState<PoolDetails | null>(null)
  const [allPlayers, setAllPlayers] = useState<Player[]>([]) // Will store all players
  const [displayedPlayers, setDisplayedPlayers] = useState<Player[]>([]) // Players being displayed
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [remainingVotes, setRemainingVotes] = useState(3)
  const [totalVotingRights, setTotalVotingRights] = useState(3)
  const [activeTab, setActiveTab] = useState("voting")
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [userTickets, setUserTickets] = useState({ additionalVotes: 0 })
  const [isPlayerInPool, setIsPlayerInPool] = useState(false)
  const [isSubmittingVotes, setIsSubmittingVotes] = useState(false)
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [isPurchasingVotingTicket, setIsPurchasingVotingTicket] = useState(false)
  const [resultsTab, setResultsTab] = useState("pool-rewards")
  const [topTenPlayers, setTopTenPlayers] = useState<string[]>([])
  const [topTenPlayersWithRanks, setTopTenPlayersWithRanks] = useState<{ players: string[]; ranks: number[] }>({
    players: [],
    ranks: [],
  })

  // Bet dialog state
  const [betDialogOpen, setBetDialogOpen] = useState(false)
  const [betTarget, setBetTarget] = useState("")
  const [betType, setBetType] = useState(0) // 0: CHAMPION, 1: TOP3, 2: TOP5, 3: TOP10
  const [betAmount, setBetAmount] = useState("")

  // Join pool dialog state
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)

  // Buy voting ticket dialog state
  const [buyVotingTicketDialogOpen, setBuyVotingTicketDialogOpen] = useState(false)

  // Function to refresh data
  const refreshData = async () => {
    if (!isConnected) return

    try {
      // Get pool state from contract
      const state = await getPoolState(poolId)

      if (pool) {
        setPool({
          ...pool,
          state: state,
        })
      }

      // If connected, get remaining votes and total voting rights
      if (account) {
        const votes = await getRemainingVotes(poolId, account)
        setRemainingVotes(votes)

        const rights = await getTotalVotingRights(poolId, account)
        setTotalVotingRights(rights)
      }

      // Get top ten players if pool is completed
      if (state === "Completed") {
        try {
          const topPlayers = await getTopTenPlayers(poolId)
          setTopTenPlayers(topPlayers)

          const topPlayersWithRanks = await getTopTenPlayersWithRanks(poolId)
          setTopTenPlayersWithRanks(topPlayersWithRanks)
        } catch (error) {
          console.error("Error fetching top players:", error)
        }
      }

      // Fetch all players
      await fetchAllPlayers()

      // Update displayed players based on active tab
      updateDisplayedPlayers(activeTab)
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }

  // Update fetchAllPlayers function
  const fetchAllPlayers = async () => {
    try {
      // Kontrat kontrolü ekle
      if (!contract) {
        console.log("Contract is not initialized yet, waiting...");
        return [];
      }

      const result = await getPoolPlayers(poolId);
      const { playerService } = await import('@/services/playerService');

      // Process active players with error handling
      const activePlayers = await Promise.all(
        result.active.map(async (p) => {
          try {
            const [playerInfo, voteCount] = await Promise.all([
              playerService.getPlayerByWallet(p.address),
              contract.candidateVotes(poolId, p.address).catch(err => {
                console.error(`Error fetching votes for ${p.address}:`, err);
                return 0;
              })
            ]);

            // Vote count handling
            const votes = voteCount ? Number(voteCount.toString()) : 0;
            
            return {
              ...p,
              votes: votes,
              isCurrentUser: p.address.toLowerCase() === account?.toLowerCase(),
              twitter_username: playerInfo?.twitter_username,
              profile_image: playerInfo?.profile_image
            };
          } catch (error) {
            console.error(`Error processing player ${p.address}:`, error);
            return {
              ...p,
              votes: 0,
              isCurrentUser: p.address.toLowerCase() === account?.toLowerCase()
            };
          }
        })
      );

      // Benzer şekilde eliminatedPlayers için de hata yönetimi ekleyin
      const eliminatedPlayers = await Promise.all(
        result.eliminated.map(async (p) => {
          try {
            const [playerInfo, voteCount] = await Promise.all([
              playerService.getPlayerByWallet(p.address),
              contract.candidateVotes(poolId, p.address).catch(err => {
                console.error(`Error fetching votes for ${p.address}:`, err);
                return 0;
              })
            ]);

            const votes = voteCount ? Number(voteCount.toString()) : 0;

            return {
              ...p,
              votes: votes,
              isCurrentUser: p.address.toLowerCase() === account?.toLowerCase(),
              twitter_username: playerInfo?.twitter_username,
              profile_image: playerInfo?.profile_image
            };
          } catch (error) {
            console.error(`Error processing player ${p.address}:`, error);
            return {
              ...p,
              votes: 0,
              isCurrentUser: p.address.toLowerCase() === account?.toLowerCase()
            };
          }
        })
      );

      const players = [...activePlayers, ...eliminatedPlayers];
      setAllPlayers(players);
      return players;
    } catch (error) {
      console.error("Error fetching players:", error);
      return [];
    }
  }

  // Add periodic vote count update
  useEffect(() => {
    if (!contract || !poolId) return

    const updateVoteCounts = async () => {
      const updatedPlayers = await Promise.all(
        allPlayers.map(async (player) => {
          try {
            const voteCount = await contract.candidateVotes(poolId, player.address)
            return {
              ...player,
              votes: voteCount ? Number(voteCount.toString()) : 0
            }
          } catch (error) {
            console.error(`Error updating votes for ${player.address}:`, error)
            return player
          }
        })
      )
      setAllPlayers(updatedPlayers)
    }

    // Update vote counts every 15 seconds
    const interval = setInterval(updateVoteCounts, 15000)

    return () => clearInterval(interval)
  }, [contract, poolId, allPlayers])

  // Update displayed players based on active tab
  const updateDisplayedPlayers = (tab) => {
    if (!allPlayers || allPlayers.length === 0) return

    switch (tab) {
      case "voting":
        // Show all players in the voting tab
        setDisplayedPlayers([...allPlayers])
        break

      case "arena":
        // Show top voted players based on owner-defined count
        const candidateCount = pool?.candidatesToSelect || 10
        const topVotedPlayers = [...allPlayers].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, candidateCount)
        setDisplayedPlayers(topVotedPlayers)
        break

      case "results":
        // Show all players in results tab (if pool is completed)
        setDisplayedPlayers([...allPlayers])
        break

      default:
        setDisplayedPlayers([...allPlayers])
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const state = await getPoolState(poolId)
        const players = await fetchAllPlayers()

        if (contract) {
          const poolData = await contract.pools(poolId)

          // Use real values from contract
          setPool({
            id: poolId,
            state: state,
            // Convert BigNumber to ETH
            entranceFee: ethers.formatEther(poolData.poolEntranceFee),
            ticketPrice: ethers.formatEther(poolData.poolTicketPrice),
            activePlayers: players.filter((p) => p.isActive).length,
            totalPlayers: players.length,
            isActive: poolData.isActive,
            isPaused: poolData.isPaused,
            isCompleted: poolData.isCompleted,
            champion: poolData.champion,
            totalEntranceFees: poolData.totalEntranceFees,
            totalBetFees: poolData.totalBetFees,
            candidatesToSelect: Number(poolData.candidatesToSelect),
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [
    poolId,
    isConnected,
    account,
    getPoolPlayers,
    getRemainingVotes,
    getTotalVotingRights,
    getPoolState,
    checkUserTickets,
    contract,
    getTopTenPlayers,
    getTopTenPlayersWithRanks,
  ])

  // Update displayed players when tab changes
  useEffect(() => {
    updateDisplayedPlayers(activeTab)
  }, [activeTab])

  const handleVoteSelection = (address) => {
    // Prevent selecting yourself
    if (address.toLowerCase() === account?.toLowerCase()) {
      toast({
        title: "Cannot vote for yourself",
        description: "You are not allowed to vote for your own address",
        variant: "destructive",
      })
      return
    }

    if (selectedPlayers.includes(address)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p !== address))
    } else {
      if (selectedPlayers.length < remainingVotes) {
        setSelectedPlayers([...selectedPlayers, address])
      } else {
        toast({
          title: "Maximum votes reached",
          description: `You can only select up to ${remainingVotes} players with your current voting rights`,
          variant: "destructive",
        })
      }
    }
  }

  // Update the handleSubmitVotes function to use the new voteForMultipleCandidates function
  const handleSubmitVotes = async () => {
    if (selectedPlayers.length === 0) {
      toast({
        title: "No players selected",
        description: "Please select at least one player to vote for",
        variant: "destructive",
      })
      return
    }

    // Only allow voting in the "Registration and Voting" state
    if (pool?.state !== "Registration and Voting") {
      toast({
        title: "Cannot vote",
        description: `Pool is in ${pool?.state} state. Voting is only allowed in Registration and Voting state.`,
        variant: "destructive",
      })
      return
    }

    // Check if user is trying to vote for themselves
    if (account && selectedPlayers.some((address) => address.toLowerCase() === account.toLowerCase())) {
      toast({
        title: "Cannot vote for yourself",
        description: "You are not allowed to vote for your own address",
      })
      return
    }

    // Check if user has enough remaining votes
    if (selectedPlayers.length > remainingVotes) {
      toast({
        title: "Not enough votes",
        description: `You only have ${remainingVotes} votes remaining, but selected ${selectedPlayers.length} players.`,
        variant: "destructive",
      })
      return
    }

    setIsSubmittingVotes(true)

    try {
      console.log("Submitting votes for:", selectedPlayers)
      // Use the function to vote for multiple candidates at once
      const success = await voteForMultipleCandidates(poolId, selectedPlayers)

      if (success) {
        // Reset selection and update remaining votes
        setSelectedPlayers([])

        // Refresh data after voting
        await refreshData()

        toast({
          title: "Success",
          description: "Your votes have been submitted successfully",
        })
      }
    } catch (error) {
      console.error("Error submitting votes:", error)

      // Extract error message
      let errorMessage = "Failed to submit votes. Please try again."
      if (error.reason) {
        errorMessage = error.reason
      } else if (error.message && error.message.includes("Cannot vote for yourself")) {
        errorMessage = "Cannot vote for yourself"
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmittingVotes(false)
    }
  }

  const handlePlaceBet = async (address) => {
    if (!betTarget || !betAmount) {
      toast({
        title: "Missing information",
        description: "Please select a target and enter a bet amount",
        variant: "destructive",
      })
      return
    }

    // Check if pool is in BETTING state
    if (pool?.state !== "Betting") {
      toast({
        title: "Cannot place bet",
        description: `Pool is in ${pool?.state} state. Betting is only allowed in Betting state.`,
      })
      setBetDialogOpen(false)
      return
    }

    setIsPlacingBet(true)

    try {
      const success = await placeBet(poolId, address, betType, betAmount)
      if (success) {
        setBetDialogOpen(false)
        setBetTarget("")
        setBetAmount("")
        toast({
          title: "Success",
          description: "Your bet has been placed successfully",
        })
      }
    } catch (error) {
      console.error("Error placing bet:", error)
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPlacingBet(false)
    }
  }

  // Update the handleJoinPool function to allow joining in "Registration and Voting" state
  const handleJoinPool = async () => {
    if (!pool || !contract) return

    try {
      // Get entrance fee from contract
      const poolData = await contract.pools(poolId)
      const entranceFee = poolData.poolEntranceFee

      const success = await joinPool(poolId, ethers.formatEther(entranceFee))
      if (success) {
        setJoinDialogOpen(false)
        window.location.reload()
      }
    } catch (error) {
      console.error("Error joining pool:", error)
      toast({
        title: "Error",
        description: "Failed to join pool. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleBuyVotingTicket = async () => {
    if (!pool) return

    console.log("Buying voting ticket with price:", pool.ticketPrice)
    setIsPurchasingVotingTicket(true)

    try {
      const success = await purchaseVotingTicket(poolId, pool.ticketPrice)
      if (success) {
        setBuyVotingTicketDialogOpen(false)
        // Refresh data to update voting rights
        await refreshData()

        toast({
          title: "Success",
          description: "Voting ticket purchased successfully. You now have 3 additional votes.",
        })
      }
    } catch (error) {
      console.error("Error purchasing voting ticket:", error)
      toast({
        title: "Error",
        description: "Failed to purchase voting ticket. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPurchasingVotingTicket(false)
    }
  }

  const filteredPlayers = () => {
    if (!displayedPlayers) return []

    switch (filter) {
      case "alive":
        return displayedPlayers.filter((p) => p.isActive)
      case "eliminated":
        return displayedPlayers.filter((p) => !p.isActive)
      case "most-bets":
        // In a real app, sort by actual bet amounts
        return [...displayedPlayers].sort((a, b) => (b.votes || 0) - (a.votes || 0))
      default:
        return displayedPlayers
    }
  }

  // Check if user can join the pool
  const canJoinPool = () => {
    if (!pool) return false
    if (isPlayerInPool) return false
    return pool.state === "Registration and Voting"
  }

  // Check if user can vote
  const canVote = () => {
    if (!pool) {
      console.log("canVote: pool is null")
      return false
    }

    // Case-insensitive state check
    const stateMatches = pool.state.toLowerCase() === "registration and voting".toLowerCase()
    console.log("canVote: pool state matches:", stateMatches, "current state:", pool.state)

    const hasVotes = remainingVotes > 0
    console.log("canVote: user has votes:", hasVotes, "remaining votes:", remainingVotes)

    // Removed isPlayerInPool check - now users can vote even if they haven't joined the pool
    return stateMatches && hasVotes
  }

  // Check if user can place bets
  const canPlaceBets = () => {
    if (!pool) return false
    return pool.state === "Betting"
  }

  // Check if user can buy voting tickets
  const canBuyVotingTickets = () => {
    if (!pool) return false
    return pool.state === "Registration and Voting"
  }

  // Check if pool is completed (for results tab)
  const isPoolCompleted = () => {
    if (!pool) return false

    // Check pool state (case insensitive)
    const state = pool.state.toUpperCase()
    return (
      state.includes("COMPLETED") ||
      state.includes("FINALIZED") ||
      pool.isCompleted === true ||
      state === "COMPLETED" ||
      state === "FINALIZED"
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8 bg-primary/5" />
        <Skeleton className="h-8 w-full mb-4 bg-primary/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full bg-primary/5" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Arena Pool #{poolId}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-bold">
              State: {pool?.state}
            </span>
            {isPlayerInPool && <span className="text-green-500">You are participating</span>}
            <Button variant="ghost" size="sm" onClick={refreshData} className="text-primary/70 hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
                disabled={!canJoinPool()}
                title={isPlayerInPool ? "You are already in this pool" : "Join Pool"}
              >
                Join Pool
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-primary/30">
              <DialogHeader>
                <DialogTitle className="text-primary">Join Pool #{poolId}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-primary/70">Entrance Fee:</span>
                  <span className="text-primary font-bold">{pool?.entranceFee} MON</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary/70">Active Players:</span>
                  <span className="text-primary">{pool?.activePlayers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary/70">Total Players:</span>
                  <span className="text-primary">{pool?.totalPlayers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary/70">Pool State:</span>
                  <span className="text-primary">{pool?.state}</span>
                </div>
                {pool?.state !== "REGISTRATION" && pool?.state !== "Registration and Voting" && (
                  <div className="bg-yellow-100 p-3 rounded-md flex items-start">
                    <Info className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700">
                      Note: This pool is in {pool?.state} state. You can only join pools in REGISTRATION or Registration
                      and Voting state.
                    </p>
                  </div>
                )}
                <div className="bg-primary/10 p-3 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-primary/80">
                    By joining this pool, you agree to pay the entrance fee. If eliminated, you will lose your stake.
                  </p>
                </div>
                <Button
                  onClick={handleJoinPool}
                  className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                >
                  Confirm & Join
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={buyVotingTicketDialogOpen} onOpenChange={setBuyVotingTicketDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
                disabled={!canBuyVotingTickets()}
              >
                <VoteIcon className="h-4 w-4 mr-2" />
                Buy Voting Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-primary/30">
              <DialogHeader>
                <DialogTitle className="text-primary">Buy Voting Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-primary/70">Ticket Price:</span>
                  <span className="text-primary font-bold">{pool?.ticketPrice} MON</span>
                </div>
                <div className="bg-primary/10 p-3 rounded-md flex items-start">
                  <Info className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-primary/80">
                    Voting tickets give you 3 additional votes to use in this pool. You can purchase multiple voting
                    tickets.
                  </p>
                </div>
                <Button
                  onClick={handleBuyVotingTicket}
                  disabled={isPurchasingVotingTicket}
                  className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                >
                  {isPurchasingVotingTicket ? "Processing..." : "Confirm Purchase"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="voting" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8 bg-background border border-primary/30">
          <TabsTrigger value="voting" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Voting
          </TabsTrigger>
          <TabsTrigger value="arena" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Arena
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voting" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">Vote for Elimination</h2>
            <div className="text-sm text-primary/70">
              Voting Rights: <span className="font-bold">{totalVotingRights}</span> (Used:{" "}
              <span className="font-bold">{totalVotingRights - remainingVotes}</span>, Remaining:{" "}
              <span className="font-bold">{remainingVotes}</span>)
            </div>
          </div>

          {pool?.state !== "Registration and Voting" ? (
            <div className="bg-yellow-100 p-4 rounded-md flex items-start mb-4">
              <Info className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700 font-medium">Voting is currently not available</p>
                <p className="text-xs text-yellow-600 mt-1">
                  The pool is in {pool?.state} state. Voting is only allowed when the pool is in Registration and Voting
                  state.
                </p>
              </div>
            </div>
          ) : remainingVotes === 0 ? (
            <div className="bg-yellow-100 p-4 rounded-md flex items-start mb-4">
              <Info className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700 font-medium">You have used all your votes</p>
                <p className="text-xs text-yellow-600 mt-1">
                  You have used all your voting rights. You can purchase additional voting tickets to get more votes.
                </p>
                <Button
                  onClick={() => setBuyVotingTicketDialogOpen(true)}
                  size="sm"
                  className="mt-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                >
                  <VoteIcon className="h-4 w-4 mr-1" />
                  Buy Voting Ticket
                </Button>
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            {filteredPlayers().map((player) => (
              <div
                key={player.address}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  selectedPlayers.includes(player.address)
                    ? "border-primary bg-primary/10"
                    : player.isCurrentUser
                      ? "border-red-300 bg-red-50"
                      : "border-primary/20 hover:border-primary/40"
                } cursor-pointer transition-colors`}
                onClick={() => handleVoteSelection(player.address)}
              >
                <div className="flex items-center">
                  {/* Profile Image */}
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-4">
                    <img
                      src={player.profile_image || `https://api.dicebear.com/7.x/avatars/svg?seed=${player.address}`}
                      alt={player.twitter_username || "Player"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      {player.twitter_username ? (
                        <p className="text-primary">@{player.twitter_username}</p>
                      ) : (
                        <p className="text-primary">{player.address.slice(0, 6)}...{player.address.slice(-4)}</p>
                      )}
                      {player.isCurrentUser && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full flex items-center">
                          <ShieldAlert className="h-3 w-3 mr-1" /> You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-primary/60">
                      {player.isActive ? "Active" : "Eliminated"} • {player.votes} votes
                    </p>
                  </div>
                </div>

                {selectedPlayers.includes(player.address) && <Check className="h-5 w-5 text-primary" />}
                {player.isCurrentUser && <div className="text-xs text-red-600">Cannot vote for yourself</div>}
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubmitVotes}
            disabled={
              selectedPlayers.length === 0 ||
              isSubmittingVotes ||
              !(remainingVotes > 0 && pool?.state?.toLowerCase() === "registration and voting".toLowerCase())
            }
            className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 mt-4"
          >
            {isSubmittingVotes
              ? "Submitting..."
              : `Submit ${selectedPlayers.length} Vote${selectedPlayers.length !== 1 ? "s" : ""}`}
          </Button>
        </TabsContent>

        <TabsContent value="arena">
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-primary/20 text-primary" : ""}
              >
                All
              </Button>
              {/* ...other filter buttons... */}
            </div>

            {/* Arena Candidates heading */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-heading">Arena Candidates</h2>
              <p className="text-sm text-primary/60">
                These are the top 100 most voted players who are candidates for elimination. 
                You can place bets on these players to predict their final ranking.
              </p>
            </div>

            {/* Betting warning */}
            {pool?.state !== "Betting" && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-500">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium">Betting is currently not available</p>
                </div>
                <p className="mt-1 text-sm text-yellow-500/80">
                  The pool is in {pool?.state} state. Betting is only allowed when the pool is in Betting state.
                </p>
              </div>
            )}

            {/* Player cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredPlayers().map((player, index) => (
                <div key={player.address} className="relative group">
                  {/* Main card */}
                  <PlayerCard
                    player={{
                      twitter_username: player.twitter_username || `player_${player.address.slice(2,6)}`,
                      profile_image: player.profile_image || `https://api.dicebear.com/7.x/avatars/svg?seed=${player.address}`,
                      wallet_address: player.address
                    }}
                    status={player.isActive ? 'active' : 'eliminated'}
                    rarity={4}
                    size="sm"
                    showDetails={false}
                    poolStatus={{
                      isInPool: true,
                      poolId: poolId
                    }}
                  />

                  {/* Stable positioning for Place Bet button */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <Button
                      className="w-[100px] py-1 text-xs bg-primary/90 hover:bg-primary 
                                 text-white rounded-full shadow-lg transition-all duration-200
                                 backdrop-blur-sm"
                      onClick={() => handlePlaceBet(player.address)}
                      disabled={pool?.state !== "Betting"}
                    >
                      Place Bet
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-6">
            {!isPoolCompleted() ? (
              <div className="bg-yellow-100 p-4 rounded-md flex items-start mb-4">
                <Info className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Results are not available yet</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    The pool is in {pool?.state} state. Results will be available when the pool is completed.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 mb-6">
                  <h3 className="text-lg font-medium text-primary mb-4">Pool Summary</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-background rounded-lg border border-primary/10">
                      <p className="text-sm text-primary/70">Total Collected</p>
                      <p className="text-xl font-bold text-primary">
                        {pool?.totalEntranceFees
                          ? Number(ethers.formatEther(pool.totalEntranceFees.toString())).toFixed(4)
                          : "0"}{" "}
                        MON
                      </p>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-primary/10">
                      <p className="text-sm text-primary/70">Distributed Rewards</p>
                      <p className="text-xl font-bold text-primary">
                        {pool?.totalEntranceFees
                          ? (Number(ethers.formatEther(pool.totalEntranceFees.toString())) * 0.9).toFixed(4)
                          : "0"}{" "}
                        MON
                      </p>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-primary/10">
                      <p className="text-sm text-primary/70">Platform Fee</p>
                      <p className="text-xl font-bold text-primary">
                        {pool?.totalEntranceFees
                          ? (Number(ethers.formatEther(pool.totalEntranceFees.toString())) * 0.1).toFixed(4)
                          : "0"}{" "}
                        MON
                      </p>
                    </div>
                  </div>
                </div>

                <Tabs value={resultsTab} onValueChange={setResultsTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6 bg-background border border-primary/30">
                    <TabsTrigger
                      value="pool-rewards"
                      className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      Pool Rewards
                    </TabsTrigger>
                    <TabsTrigger
                      value="bet-rewards"
                      className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      Bet Rewards
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pool-rewards">
                    <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 mb-6">
                      <h3 className="text-lg font-medium text-primary mb-4">Final Rankings & Rewards</h3>

                      {/* Display top ten players with ranks */}
                      {topTenPlayersWithRanks.players && topTenPlayersWithRanks.players.length > 0 ? (
                        <div className="space-y-3">
                          {topTenPlayersWithRanks.players.map((player, index) => {
                            const rank = topTenPlayersWithRanks.ranks[index]
                            let rewardPercent = "0%"
                            let rewardAmount = "0"

                            // Determine reward percentage based on contract data
                            if (rank === 1) rewardPercent = "35%"
                            else if (rank === 2) rewardPercent = "25%"
                            else if (rank === 3) rewardPercent = "15%"
                            else if (rank === 4) rewardPercent = "10%"
                            else if (rank === 5) rewardPercent = "5%"
                            else rewardPercent = "2%"

                            // Calculate total pool amount
                            const totalPoolAmount = pool?.totalEntranceFees
                              ? Number(ethers.formatEther(pool.totalEntranceFees.toString()))
                              : 0

                            // Calculate reward amount
                            const rewardPercentValue = Number.parseFloat(rewardPercent) / 100
                            rewardAmount = (totalPoolAmount * rewardPercentValue).toFixed(4)

                            return (
                              <div key={index} className="p-4 rounded-lg border border-primary/20 bg-primary/5 mb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 text-primary font-bold">
                                      {rank}
                                    </div>
                                    <div>
                                      <p className="font-medium text-primary">
                                        {rank === 1
                                          ? "Champion"
                                          : rank === 2
                                            ? "Runner-up"
                                            : rank === 3
                                              ? "Third Place"
                                              : `${rank}th Place`}
                                      </p>
                                      <p className="text-primary/80">
                                        {player.substring(0, 6)}...{player.substring(38)}
                                        {player.toLowerCase() === account?.toLowerCase() && (
                                          <span className="ml-2 text-xs text-primary font-bold">(You)</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-lg text-primary">{rewardPercent}</p>
                                    <p className="text-sm text-primary/80">{rewardAmount} MON</p>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-primary/70">No ranking data available</p>
                        </div>
                      )}

                      <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-primary/80">
                            <p className="font-medium text-primary">Reward Distribution</p>
                            <ul className="mt-1 space-y-1 list-disc list-inside text-primary/70">
                              <li>Champion: 35% of the total pool</li>
                              <li>Runner-up (2nd place): 25% of the total pool</li>
                              <li>Third place: 15% of the total pool</li>
                              <li>Fourth place: 10% of the total pool</li>
                              <li>Fifth place: 5% of the total pool</li>
                              <li>6th-10th places: 2% each (total 10%)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="bet-rewards">
                    <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 mb-6">
                      <h3 className="text-lg font-medium text-primary mb-4">Bet Winners & Rewards</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-background rounded-lg border border-primary/10">
                          <p className="text-sm text-primary/70">Total Bet Amount</p>
                          <p className="text-xl font-bold text-primary">
                            {pool?.totalBetFees ? ethers.formatEther(pool.totalBetFees.toString()) : "0"} MON
                          </p>
                        </div>
                        <div className="p-3 bg-background rounded-lg border border-primary/10">
                          <p className="text-sm text-primary/70">Distributed Bet Rewards</p>
                          <p className="text-xl font-bold text-primary">
                            {pool?.totalBetFees
                              ? (Number(ethers.formatEther(pool.totalBetFees.toString())) * 0.9).toFixed(4)
                              : "0"}{" "}
                            MON
                          </p>
                        </div>
                      </div>

                      {/* Example bet winners */}
                      <div className="space-y-3 mt-6">
                        <h4 className="font-medium text-primary">Top Bet Winners</h4>

                        {/* Sample bet winners - should be replaced with real data from contract integration */}
                        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 mb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-600">
                                <Trophy className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium text-primary">Champion Bet Winner</p>
                                <p className="text-primary/80">0xf39F...92266</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-green-600">10x</p>
                              <p className="text-sm text-primary/80">0.5 MON</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 mb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium text-primary">Top 3 Bet Winner</p>
                                <p className="text-primary/80">0x8765...4321</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-blue-600">5x</p>
                              <p className="text-sm text-primary/80">0.25 MON</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 mb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 text-purple-600">
                                <Crown className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium text-primary">Top 5 Bet Winner</p>
                                <p className="text-primary/80">0x1234...5678</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-purple-600">3x</p>
                              <p className="text-sm text-primary/80">0.15 MON</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-primary/80">
                            <p className="font-medium text-primary">Bet Reward Multipliers</p>
                            <ul className="mt-1 space-y-1 list-disc list-inside text-primary/70">
                              <li>Champion Bet: 10x multiplier</li>
                              <li>Top 3 Bet: 5x multiplier</li>
                              <li>Top 5 Bet: 3x multiplier</li>
                              <li>Top 10 Bet: 2x multiplier</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
