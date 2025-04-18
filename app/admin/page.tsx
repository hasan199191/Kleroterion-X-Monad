"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/WalletContext"
import { useContract } from "@/hooks/useContract"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Info, Shield } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ethers } from "ethers"

// Owner address
const OWNER_ADDRESS = "0x2e6229b4939EDc2b3E4EE4320e1EA51Ed595cdda"

export default function AdminPage() {
  const { account, isConnected, contract } = useWallet()
  const { getAllPools, getPoolState, completeEliminationRandomly, updatePoolParameters } = useContract()
  const { toast } = useToast()
  const [isOwner, setIsOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pools, setPools] = useState([])
  const [selectedPool, setSelectedPool] = useState("")

  // Pool creation form state
  const [entranceFee, setEntranceFee] = useState("0.1")
  const [ticketPrice, setTicketPrice] = useState("0.05")
  const [minBetAmount, setMinBetAmount] = useState("0.01")
  const [maxBetAmount, setMaxBetAmount] = useState("1")
  const [eliminationInterval, setEliminationInterval] = useState("86400") // 24 hours in seconds
  const [candidatesToSelect, setCandidatesToSelect] = useState("3")

  // Pool management form state
  const [bettingDuration, setBettingDuration] = useState("3600") // 1 hour in seconds

  // Pool parameters update state
  const [updateEntranceFee, setUpdateEntranceFee] = useState("")
  const [updateTicketPrice, setUpdateTicketPrice] = useState("")
  const [updateMinBetAmount, setUpdateMinBetAmount] = useState("")
  const [updateMaxBetAmount, setUpdateMaxBetAmount] = useState("")
  const [updateEliminationInterval, setUpdateEliminationInterval] = useState("")
  const [updateCandidatesToSelect, setUpdateCandidatesToSelect] = useState("")

  useEffect(() => {
    const checkOwner = async () => {
      if (!isConnected || !account) {
        setIsOwner(false)
        return
      }

      // Check if connected account is owner
      setIsOwner(account.toLowerCase() === OWNER_ADDRESS.toLowerCase())
    }

    const fetchPools = async () => {
      if (!isConnected) return

      setIsLoading(true)
      try {
        const allPools = await getAllPools()
        setPools(allPools)
      } catch (error) {
        console.error("Error fetching pools:", error)
        toast({
          title: "Error",
          description: "Failed to fetch pools",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkOwner()
    fetchPools()
  }, [isConnected, account, getAllPools, toast])

  // Create a new pool
  const handleCreatePool = async () => {
    if (!contract || !isConnected || !isOwner) {
      toast({
        title: "Error",
        description: "Not authorized or not connected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Convert values to wei
      const entranceFeeWei = ethers.parseEther(entranceFee)
      const ticketPriceWei = ethers.parseEther(ticketPrice)
      const minBetAmountWei = ethers.parseEther(minBetAmount)
      const maxBetAmountWei = ethers.parseEther(maxBetAmount)

      // Prepare transaction options with gas settings
      const options = {
        gasLimit: 3000000, // Higher gas limit for pool creation
      }

      const tx = await contract.createCustomPool(
        entranceFeeWei,
        ticketPriceWei,
        minBetAmountWei,
        maxBetAmountWei,
        eliminationInterval,
        candidatesToSelect,
        options,
      )

      toast({
        title: "Transaction submitted",
        description: "Creating pool...",
      })

      await tx.wait()

      toast({
        title: "Success",
        description: "Pool created successfully",
      })

      // Refresh pools
      const allPools = await getAllPools()
      setPools(allPools)
    } catch (error) {
      console.error("Error creating pool:", error)
      toast({
        title: "Error",
        description: "Failed to create pool: " + (error.reason || error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Start betting period
  const handleStartBetting = async () => {
    if (!contract || !isConnected || !isOwner || !selectedPool) {
      toast({
        title: "Error",
        description: "Not authorized, not connected, or no pool selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const tx = await contract.startBettingPeriod(selectedPool, bettingDuration)

      toast({
        title: "Transaction submitted",
        description: "Starting betting period...",
      })

      await tx.wait()

      toast({
        title: "Success",
        description: "Betting period started successfully",
      })

      // Refresh pools
      const allPools = await getAllPools()
      setPools(allPools)
    } catch (error) {
      console.error("Error starting betting period:", error)
      toast({
        title: "Error",
        description: "Failed to start betting period: " + (error.reason || error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // End betting period
  const handleEndBetting = async () => {
    if (!contract || !isConnected || !isOwner || !selectedPool) {
      toast({
        title: "Error",
        description: "Not authorized, not connected, or no pool selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const tx = await contract.endBettingPeriod(selectedPool)

      toast({
        title: "Transaction submitted",
        description: "Ending betting period...",
      })

      await tx.wait()

      toast({
        title: "Success",
        description: "Betting period ended successfully",
      })

      // Refresh pools
      const allPools = await getAllPools()
      setPools(allPools)
    } catch (error) {
      console.error("Error ending betting period:", error)
      toast({
        title: "Error",
        description: "Failed to end betting period: " + (error.reason || error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // End registration and select candidates
  const handleEndRegistration = async () => {
    if (!contract || !isConnected || !isOwner || !selectedPool) {
      toast({
        title: "Error",
        description: "Not authorized, not connected, or no pool selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const tx = await contract.endRegistrationAndSelectCandidates(selectedPool)

      toast({
        title: "Transaction submitted",
        description: "Ending registration and selecting candidates...",
      })

      await tx.wait()

      toast({
        title: "Success",
        description: "Registration ended and candidates selected successfully",
      })

      // Refresh pools
      const allPools = await getAllPools()
      setPools(allPools)
    } catch (error) {
      console.error("Error ending registration:", error)
      toast({
        title: "Error",
        description: "Failed to end registration: " + (error.reason || error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Complete elimination randomly
  const handleCompleteElimination = async () => {
    if (!contract || !isConnected || !isOwner || !selectedPool) {
      toast({
        title: "Error",
        description: "Not authorized, not connected, or no pool selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Use the updated completeEliminationRandomly function with higher gas limit
      const success = await completeEliminationRandomly(selectedPool)

      if (success) {
        toast({
          title: "Success",
          description: "Elimination completed successfully",
        })

        // Refresh pools
        const allPools = await getAllPools()
        setPools(allPools)
      }
    } catch (error) {
      console.error("Error completing elimination:", error)
      toast({
        title: "Error",
        description: "Failed to complete elimination: " + (error.reason || error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Finalize pool
  const handleFinalizePool = async () => {
    if (!contract || !isConnected || !isOwner || !selectedPool) {
      toast({
        title: "Error",
        description: "Not authorized, not connected, or no pool selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const tx = await contract.finalizePool(selectedPool)

      toast({
        title: "Transaction submitted",
        description: "Finalizing pool...",
      })

      await tx.wait()

      toast({
        title: "Success",
        description: "Pool finalized successfully",
      })

      // Refresh pools
      const allPools = await getAllPools()
      setPools(allPools)
    } catch (error) {
      console.error("Error finalizing pool:", error)
      toast({
        title: "Error",
        description: "Failed to finalize pool: " + (error.reason || error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Emergency complete pool
  const handleEmergencyComplete = async () => {
    if (!contract || !isConnected || !isOwner || !selectedPool) {
      toast({
        title: "Error",
        description: "Not authorized, not connected, or no pool selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const tx = await contract.emergencyCompletePool(selectedPool)

      toast({
        title: "Transaction submitted",
        description: "Emergency completing pool...",
      })

      await tx.wait()

      toast({
        title: "Success",
        description: "Pool emergency completed successfully",
      })

      // Refresh pools
      const allPools = await getAllPools()
      setPools(allPools)
    } catch (error) {
      console.error("Error emergency completing pool:", error)
      toast({
        title: "Error",
        description: "Failed to emergency complete pool: " + (error.reason || error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Pause pool
  const handlePausePool = async () => {
    if (!contract || !isConnected || !isOwner || !selectedPool) {
      toast({
        title: "Error",
        description: "Not authorized, not connected, or no pool selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const tx = await contract.pausePool(selectedPool)

      toast({
        title: "Transaction submitted",
        description: "Pausing pool...",
      })

      await tx.wait()

      toast({
        title: "Success",
        description: "Pool paused successfully",
      })

      // Refresh pools
      const allPools = await getAllPools()
      setPools(allPools)
    } catch (error) {
      console.error("Error pausing pool:", error)
      toast({
        title: "Error",
        description: "Failed to pause pool: " + (error.reason || error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Resume pool
  const handleResumePool = async () => {
    if (!contract || !isConnected || !isOwner || !selectedPool) {
      toast({
        title: "Error",
        description: "Not authorized, not connected, or no pool selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const tx = await contract.resumePool(selectedPool)

      toast({
        title: "Transaction submitted",
        description: "Resuming pool...",
      })

      await tx.wait()

      toast({
        title: "Success",
        description: "Pool resumed successfully",
      })

      // Refresh pools
      const allPools = await getAllPools()
      setPools(allPools)
    } catch (error) {
      console.error("Error resuming pool:", error)
      toast({
        title: "Error",
        description: "Failed to resume pool: " + (error.reason || error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update pool parameters
  const handleUpdatePoolParameters = async () => {
    if (!contract || !isConnected || !isOwner || !selectedPool) {
      toast({
        title: "Error",
        description: "Not authorized, not connected, or no pool selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Get the selected pool to use its current values for any fields not being updated
      const selectedPoolData = pools.find((pool) => pool.id.toString() === selectedPool)

      // Use current values if new values are not provided
      const entranceFeeToUse = updateEntranceFee || selectedPoolData.entranceFee
      const ticketPriceToUse = updateTicketPrice || selectedPoolData.ticketPrice
      const minBetAmountToUse = updateMinBetAmount || selectedPoolData.minBetAmount || "0.01"
      const maxBetAmountToUse = updateMaxBetAmount || selectedPoolData.maxBetAmount || "1"
      const eliminationIntervalToUse = updateEliminationInterval || selectedPoolData.eliminationInterval || "86400"
      const candidatesToSelectToUse = updateCandidatesToSelect || selectedPoolData.candidatesToSelect || "3"

      const success = await updatePoolParameters(
        selectedPool,
        entranceFeeToUse,
        ticketPriceToUse,
        minBetAmountToUse,
        maxBetAmountToUse,
        eliminationIntervalToUse,
        candidatesToSelectToUse,
      )

      if (success) {
        // Reset form fields
        setUpdateEntranceFee("")
        setUpdateTicketPrice("")
        setUpdateMinBetAmount("")
        setUpdateMaxBetAmount("")
        setUpdateEliminationInterval("")
        setUpdateCandidatesToSelect("")

        // Refresh pools
        const allPools = await getAllPools()
        setPools(allPools)
      }
    } catch (error) {
      console.error("Error updating pool parameters:", error)
      toast({
        title: "Error",
        description: "Failed to update pool parameters: " + (error.reason || error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Withdraw platform fees
  const handleWithdrawFees = async () => {
    if (!contract || !isConnected || !isOwner) {
      toast({
        title: "Error",
        description: "Not authorized or not connected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const tx = await contract.withdrawPlatformFeesToOwner()

      toast({
        title: "Transaction submitted",
        description: "Withdrawing platform fees...",
      })

      await tx.wait()

      toast({
        title: "Success",
        description: "Platform fees withdrawn successfully",
      })
    } catch (error) {
      console.error("Error withdrawing fees:", error)
      toast({
        title: "Error",
        description: "Failed to withdraw fees: " + (error.reason || error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Admin Panel</h1>
        <p className="text-primary/70 mb-8">Please connect your wallet to access the admin panel</p>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Admin Panel</h1>
        <div className="bg-red-100 p-4 rounded-md flex items-start justify-center mb-4">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">Access denied. Only the contract owner can access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-500" />
          <span className="text-green-500 font-medium">Owner Access</span>
        </div>
      </div>

      <Tabs defaultValue="pools" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 bg-background border border-primary/30">
          <TabsTrigger value="pools" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Pool Management
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Create Pool
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Platform Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pools">
          <Card>
            <CardHeader>
              <CardTitle>Pool Management</CardTitle>
              <CardDescription>Manage existing pools and their states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pool-select">Select Pool</Label>
                <Select value={selectedPool} onValueChange={setSelectedPool}>
                  <SelectTrigger id="pool-select" className="w-full">
                    <SelectValue placeholder="Select a pool" />
                  </SelectTrigger>
                  <SelectContent>
                    {pools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id.toString()}>
                        Pool #{pool.id} - {pool.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPool && (
                <div className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Pool #{selectedPool} Details</h3>
                    {pools
                      .filter((pool) => pool.id.toString() === selectedPool)
                      .map((pool) => (
                        <div key={pool.id} className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-primary/70">State:</div>
                          <div className="font-medium">{pool.state}</div>
                          <div className="text-primary/70">Active Players:</div>
                          <div className="font-medium">{pool.activePlayers}</div>
                          <div className="text-primary/70">Total Players:</div>
                          <div className="font-medium">{pool.totalPlayers}</div>
                          <div className="text-primary/70">Entrance Fee:</div>
                          <div className="font-medium">{pool.entranceFee} MON</div>
                          <div className="text-primary/70">Ticket Price:</div>
                          <div className="font-medium">{pool.ticketPrice} MON</div>
                          <div className="text-primary/70">Candidates to Select:</div>
                          <div className="font-medium">{pool.candidatesToSelect || "3"}</div>
                          <div className="text-primary/70">Is Active:</div>
                          <div className="font-medium">{pool.isActive ? "Yes" : "No"}</div>
                          <div className="text-primary/70">Is Paused:</div>
                          <div className="font-medium">{pool.isPaused ? "Yes" : "No"}</div>
                          <div className="text-primary/70">Is Completed:</div>
                          <div className="font-medium">{pool.isCompleted ? "Yes" : "No"}</div>
                        </div>
                      ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="betting-duration">Betting Duration (seconds)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="betting-duration"
                        type="number"
                        value={bettingDuration}
                        onChange={(e) => setBettingDuration(e.target.value)}
                        className="flex-grow"
                      />
                      <Button onClick={handleStartBetting} disabled={isLoading}>
                        Start Betting
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={handleEndBetting} disabled={isLoading} variant="outline">
                      End Betting
                    </Button>
                    <Button onClick={handleEndRegistration} disabled={isLoading} variant="outline">
                      End Registration
                    </Button>
                    <Button onClick={handleCompleteElimination} disabled={isLoading} variant="outline">
                      Complete Elimination
                    </Button>
                    <Button onClick={handleFinalizePool} disabled={isLoading} variant="outline">
                      Finalize Pool
                    </Button>
                    <Button onClick={handlePausePool} disabled={isLoading} variant="outline">
                      Pause Pool
                    </Button>
                    <Button onClick={handleResumePool} disabled={isLoading} variant="outline">
                      Resume Pool
                    </Button>
                    <Button
                      onClick={handleEmergencyComplete}
                      disabled={isLoading}
                      variant="destructive"
                      className="col-span-2"
                    >
                      Emergency Complete Pool
                    </Button>
                  </div>

                  {/* Pool Parameters Update Section */}
                  <div className="mt-8 border-t pt-6">
                    <h3 className="font-medium mb-4">Update Pool Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="update-entrance-fee">Entrance Fee (MON)</Label>
                        <Input
                          id="update-entrance-fee"
                          type="number"
                          value={updateEntranceFee}
                          onChange={(e) => setUpdateEntranceFee(e.target.value)}
                          placeholder="Leave empty to keep current"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="update-ticket-price">Ticket Price (MON)</Label>
                        <Input
                          id="update-ticket-price"
                          type="number"
                          value={updateTicketPrice}
                          onChange={(e) => setUpdateTicketPrice(e.target.value)}
                          placeholder="Leave empty to keep current"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="update-min-bet">Min Bet Amount (MON)</Label>
                        <Input
                          id="update-min-bet"
                          type="number"
                          value={updateMinBetAmount}
                          onChange={(e) => setUpdateMinBetAmount(e.target.value)}
                          placeholder="Leave empty to keep current"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="update-max-bet">Max Bet Amount (MON)</Label>
                        <Input
                          id="update-max-bet"
                          type="number"
                          value={updateMaxBetAmount}
                          onChange={(e) => setUpdateMaxBetAmount(e.target.value)}
                          placeholder="Leave empty to keep current"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="update-elimination-interval">Elimination Interval (seconds)</Label>
                        <Input
                          id="update-elimination-interval"
                          type="number"
                          value={updateEliminationInterval}
                          onChange={(e) => setUpdateEliminationInterval(e.target.value)}
                          placeholder="Leave empty to keep current"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="update-candidates-to-select">Candidates to Select</Label>
                        <Input
                          id="update-candidates-to-select"
                          type="number"
                          value={updateCandidatesToSelect}
                          onChange={(e) => setUpdateCandidatesToSelect(e.target.value)}
                          placeholder="Leave empty to keep current"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button onClick={handleUpdatePoolParameters} disabled={isLoading} className="w-full">
                        Update Pool Parameters
                      </Button>
                    </div>
                    <div className="mt-4 bg-blue-50 p-3 rounded-md flex items-start">
                      <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">About Candidates to Select</p>
                        <p className="mt-1 text-blue-600">
                          This parameter determines how many players with the most votes will be selected for
                          elimination. For example, if set to 3, the top 3 most voted players will be candidates for
                          elimination.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Pool</CardTitle>
              <CardDescription>Set up parameters for a new pool</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entrance-fee">Entrance Fee (MON)</Label>
                  <Input
                    id="entrance-fee"
                    type="number"
                    value={entranceFee}
                    onChange={(e) => setEntranceFee(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-price">Ticket Price (MON)</Label>
                  <Input
                    id="ticket-price"
                    type="number"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-bet">Minimum Bet Amount (MON)</Label>
                  <Input
                    id="min-bet"
                    type="number"
                    value={minBetAmount}
                    onChange={(e) => setMinBetAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-bet">Maximum Bet Amount (MON)</Label>
                  <Input
                    id="max-bet"
                    type="number"
                    value={maxBetAmount}
                    onChange={(e) => setMaxBetAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elimination-interval">Elimination Interval (seconds)</Label>
                  <Input
                    id="elimination-interval"
                    type="number"
                    value={eliminationInterval}
                    onChange={(e) => setEliminationInterval(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidates">Candidates to Select</Label>
                  <Input
                    id="candidates"
                    type="number"
                    value={candidatesToSelect}
                    onChange={(e) => setCandidatesToSelect(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">Pool Parameters</p>
                  <p className="text-xs text-blue-600 mt-1">
                    These parameters will determine how the pool operates. The entrance fee is what players pay to join,
                    and the ticket price is what they pay for protection tickets. The elimination interval determines
                    how often eliminations occur (in seconds). The candidates to select parameter determines how many
                    players with the most votes will be selected for elimination.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreatePool} disabled={isLoading} className="w-full">
                Create Pool
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Manage global platform settings and fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-md flex items-start">
                <Info className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Platform Fees</p>
                  <p className="text-xs text-green-600 mt-1">
                    Platform fees are collected from each pool and can be withdrawn to the owner's wallet. These fees
                    help maintain the platform and provide revenue for the platform owner.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleWithdrawFees} disabled={isLoading} className="w-full md:w-1/2">
                  Withdraw Platform Fees
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Other Platform Settings</h3>
                <p className="text-sm text-primary/70">
                  Additional platform settings can be added here in future updates, such as:
                </p>
                <ul className="list-disc list-inside text-sm text-primary/70 space-y-1">
                  <li>Platform fee percentage adjustment</li>
                  <li>Default pool parameters</li>
                  <li>Whitelist/blacklist management</li>
                  <li>Emergency protocol settings</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
