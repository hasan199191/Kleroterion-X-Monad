"use client"

import { useState, useCallback } from "react"
import { ethers } from "ethers"
import { useWallet } from "@/context/WalletContext"
import { useToast } from "@/components/ui/use-toast"

export function useContract() {
  const { contract, isConnected, signer, account } = useWallet()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const DEFAULT_GAS_LIMIT = 300000 // Gas limit'i düşürdük
  const MINIMUM_GAS_PRICE = ethers.parseUnits("0.05", "gwei") // Minimum gas price

  // Helper fonksiyonu güncelliyoruz
  const prepareTransactionOptions = async (value = 0) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const feeData = await provider.getFeeData()
      
      // Gas price'ı optimize ediyoruz
      const gasPrice = feeData.gasPrice < MINIMUM_GAS_PRICE 
        ? MINIMUM_GAS_PRICE 
        : feeData.gasPrice

      const options: any = {
        gasLimit: DEFAULT_GAS_LIMIT,
        gasPrice: gasPrice
      }

      if (value > 0) {
        options.value = value
      }

      return options
    } catch (error) {
      console.error("Error preparing transaction:", error)
      // Fallback gas ayarları
      return {
        gasLimit: DEFAULT_GAS_LIMIT,
        gasPrice: MINIMUM_GAS_PRICE
      }
    }
  }

  // Transaction gönderme fonksiyonunu güncelliyoruz
  const sendTransaction = async (method: string, args: any[]) => {
    try {
      // Önce gas tahmini yapalım
      const estimatedGas = await contract.estimateGas[method](...args)
      
      // Gas limit'i %20 artıralım
      const adjustedGasLimit = Math.floor(Number(estimatedGas) * 1.2)

      // Transaction options'ları hazırlayalım
      const options = await prepareTransactionOptions()
      
      // Transaction'ı gönderelim
      const tx = await contract[method](...args, {
        ...options,
        gasLimit: adjustedGasLimit
      })

      // Transaction'ı bekleyelim
      await tx.wait()

      return tx
    } catch (error) {
      console.error('Transaction error:', error)
      throw error
    }
  }

  // Get active pools
  const getActivePools = useCallback(async () => {
    if (!contract || !isConnected) {
      console.log("Contract or connection not available, returning empty array")
      return []
    }

    try {
      setIsLoading(true)
      console.log("Fetching active pools from contract...")

      // Get the next pool ID to know how many pools exist
      const nextPoolId = await contract.nextPoolId()
      console.log("Next pool ID:", nextPoolId.toString())

      const pools = []

      // Loop through all pools
      for (let i = 1; i < nextPoolId; i++) {
        try {
          // Get pool details
          const pool = await contract.pools(i)

          // Only include active pools
          if (pool.isActive && !pool.isCompleted) {
            // Get pool state as string
            const state = await contract.getPoolStateAsString(i)

            // Get player counts
            const counts = await contract.getPlayerCounts(i)

            // Format ethers values
            const entranceFee = ethers.formatEther(pool.poolEntranceFee)
            const ticketPrice = ethers.formatEther(pool.poolTicketPrice)

            // Convert BigNumber to number
            const activePlayers = Number(counts.activePlayers)
            const eliminatedPlayers = Number(counts.eliminatedPlayers)
            const totalPlayers = Number(counts.totalPlayers)

            // Add pool to the list
            pools.push({
              id: i,
              isActive: pool.isActive,
              isCompleted: pool.isCompleted,
              isPaused: pool.isPaused,
              state: state,
              entranceFee: entranceFee,
              ticketPrice: ticketPrice,
              activePlayers: activePlayers,
              eliminatedPlayers: eliminatedPlayers,
              totalPlayers: totalPlayers,
              candidatesToSelect: Number(pool.candidatesToSelect),
            })
          }
        } catch (e) {
          console.warn(`Error processing pool ${i}:`, e)
        }
      }

      console.log("Fetched pools:", pools)
      return pools
    } catch (error) {
      console.error("Error fetching active pools:", error)
      toast({
        title: "Error",
        description: "Failed to fetch active pools",
        variant: "destructive",
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [contract, isConnected, toast])

  // Get all pools (including completed ones)
  const getAllPools = useCallback(async () => {
    if (!contract || !isConnected) {
      console.log("Contract or connection not available, returning empty array")
      return []
    }

    try {
      setIsLoading(true)
      console.log("Fetching all pools from contract...")

      // Get the next pool ID to know how many pools exist
      const nextPoolId = await contract.nextPoolId()
      console.log("Next pool ID:", nextPoolId.toString())

      const pools = []

      // Loop through all pools
      for (let i = 1; i < nextPoolId; i++) {
        try {
          // Get pool details
          const pool = await contract.pools(i)

          // Get pool state as string
          const state = await contract.getPoolStateAsString(i)

          // Get player counts
          const counts = await contract.getPlayerCounts(i)

          // Format ethers values
          const entranceFee = ethers.formatEther(pool.poolEntranceFee)
          const ticketPrice = ethers.formatEther(pool.poolTicketPrice)

          // Convert BigNumber to number
          const activePlayers = Number(counts.activePlayers)
          const eliminatedPlayers = Number(counts.eliminatedPlayers)
          const totalPlayers = Number(counts.totalPlayers)

          // Add pool to the list
          pools.push({
            id: i,
            isActive: pool.isActive,
            isCompleted: pool.isCompleted,
            isPaused: pool.isPaused,
            state: state,
            entranceFee: entranceFee,
            ticketPrice: ticketPrice,
            activePlayers: activePlayers,
            eliminatedPlayers: eliminatedPlayers,
            totalPlayers: totalPlayers,
            champion: pool.champion,
            totalEntranceFees: pool.totalEntranceFees,
            totalBetFees: pool.totalBetFees,
            candidatesToSelect: Number(pool.candidatesToSelect),
          })
        } catch (e) {
          console.warn(`Error processing pool ${i}:`, e)
        }
      }

      console.log("Fetched all pools:", pools)
      return pools
    } catch (error) {
      console.error("Error fetching all pools:", error)
      toast({
        title: "Error",
        description: "Failed to fetch all pools",
        variant: "destructive",
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [contract, isConnected, toast])

  // Get user pools (pools the user has joined)
  const getUserPools = useCallback(async () => {
    if (!contract || !isConnected || !account) {
      console.log("Contract, connection, or account not available, returning empty array")
      return []
    }

    try {
      setIsLoading(true)
      console.log("Fetching user pools from contract...")

      // Get the next pool ID to know how many pools exist
      const nextPoolId = await contract.nextPoolId()
      console.log("Next pool ID:", nextPoolId.toString())

      const userPools = []

      // Loop through all pools
      for (let i = 1; i < nextPoolId; i++) {
        try {
          // Check if user is in this pool
          const isInPool = await contract.isPlayerInPool(i, account)

          if (isInPool) {
            // Get pool details
            const pool = await contract.pools(i)

            // Get pool state as string
            const state = await contract.getPoolStateAsString(i)

            // Check if user is eliminated
            const isEliminated = await contract.isPlayerEliminated(i, account)

            // Calculate potential reward if applicable
            let reward = "0"
            if (pool.isCompleted) {
              try {
                const rewardBN = await contract.calculatePoolReward(i, account)
                reward = ethers.formatEther(rewardBN)
              } catch (e) {
                console.warn(`Error calculating reward for pool ${i}:`, e)
              }
            }

            // Check if reward has been claimed
            const hasClaimed = await contract.hasClaimedReward(i, account)

            userPools.push({
              id: i,
              status: state,
              isActive: !isEliminated,
              reward: reward,
              isCompleted: pool.isCompleted,
              hasClaimed: hasClaimed,
            })
          }
        } catch (e) {
          console.warn(`Error checking user in pool ${i}:`, e)
        }
      }

      console.log("Fetched user pools:", userPools)
      return userPools
    } catch (error) {
      console.error("Error fetching user pools:", error)
      toast({
        title: "Error",
        description: "Failed to fetch user pools",
        variant: "destructive",
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [contract, isConnected, account, toast])

  // Get all user tickets across all pools
  const getAllUserTickets = useCallback(async () => {
    if (!contract || !isConnected || !account) {
      console.log("Contract, connection, or account not available, returning empty array")
      return []
    }

    try {
      setIsLoading(true)
      console.log("Fetching all user tickets...")

      // Get the next pool ID to know how many pools exist
      const nextPoolId = await contract.nextPoolId()

      const allTickets = []

      // Loop through all pools
      for (let i = 1; i < nextPoolId; i++) {
        try {
          // Get additional votes for this pool
          const additionalVotes = await contract.additionalVotes(i, account)

          if (Number(additionalVotes) > 0) {
            allTickets.push({
              poolId: i,
              additionalVotes: Number(additionalVotes),
            })
          }
        } catch (e) {
          console.warn(`Error checking tickets for pool ${i}:`, e)
        }
      }

      console.log("Fetched all user tickets:", allTickets)
      return allTickets
    } catch (error) {
      console.error("Error fetching all user tickets:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [contract, isConnected, account])

  // Get all activity events
  const getActivityEvents = useCallback(async () => {
    if (!contract || !isConnected) {
      console.log("Contract or connection not available, returning empty array")
      return []
    }

    try {
      setIsLoading(true)
      console.log("Fetching activity events...")

      // Get the next pool ID to know how many pools exist
      const nextPoolId = await contract.nextPoolId()
      const events = []

      // For each pool, query events
      for (let i = 1; i < nextPoolId; i++) {
        try {
          // Get pool details
          const pool = await contract.pools(i)
          const poolStartTime = Number(pool.startTime) * 1000

          // Add pool creation event
          events.push({
            id: `pool-created-${i}`,
            poolId: i,
            type: "POOL_CREATED",
            description: `Pool #${i} was created`,
            timestamp: poolStartTime,
          })

          // Get player joined events
          const playersList = await contract.getAllPlayers(i)

          // Process active players
          playersList.activePlayers.forEach((player, index) => {
            const joinTime = Number(playersList.joinTimes[index]) * 1000

            events.push({
              id: `player-joined-${i}-${player}`,
              poolId: i,
              type: "PLAYER_JOINED",
              description: `Player ${player.substring(0, 6)}...${player.substring(38)} joined Pool #${i}`,
              timestamp: joinTime,
              address: player,
            })
          })

          // Process eliminated players
          playersList.eliminatedPlayers.forEach((player, index) => {
            // Use a timestamp slightly after join time for elimination events
            const joinTimeIndex = playersList.activePlayers.length + index
            const joinTime = playersList.joinTimes[joinTimeIndex]
              ? Number(playersList.joinTimes[joinTimeIndex]) * 1000
              : Number(playersList.joinTimes[0] || 0) * 1000

            const eliminationTime = joinTime + Math.random() * 1000 * 60 * 60 * 24 * 2 // 0-2 days after joining

            events.push({
              id: `player-eliminated-${i}-${player}`,
              poolId: i,
              type: "PLAYER_ELIMINATED",
              description: `Player ${player.substring(0, 6)}...${player.substring(38)} was eliminated from Pool #${i}`,
              timestamp: eliminationTime,
              address: player,
            })
          })

          // If pool is completed, add champion event
          if (pool.isCompleted && pool.champion !== "0x0000000000000000000000000000000000000000") {
            const championTime = poolStartTime + Math.random() * 1000 * 60 * 60 * 24 * 7 // 0-7 days after pool start

            events.push({
              id: `champion-declared-${i}`,
              poolId: i,
              type: "CHAMPION_DECLARED",
              description: `${pool.champion.substring(0, 6)}...${pool.champion.substring(38)} declared champion for Pool #${i}`,
              timestamp: championTime,
              address: pool.champion,
            })
          }

          // Try to get bet events
          try {
            // Get all players
            const allPlayers = [...playersList.activePlayers, ...playersList.eliminatedPlayers]

            // For each player, try to get their bets
            for (const player of allPlayers) {
              try {
                const userBets = await contract.getUserBets(i, player)

                // Check if the result has the expected properties
                if (!userBets || !userBets.targetPlayers || !userBets.amounts || !userBets.betTypes) {
                  continue
                }

                // Make sure we have arrays to work with
                const targetPlayers = Array.isArray(userBets.targetPlayers) ? userBets.targetPlayers : []
                const amounts = Array.isArray(userBets.amounts) ? userBets.amounts : []
                const betTypes = Array.isArray(userBets.betTypes) ? userBets.betTypes : []

                // Get the length of the shortest array to avoid index errors
                const length = Math.min(targetPlayers.length, amounts.length, betTypes.length)

                // Process each bet
                for (let j = 0; j < length; j++) {
                  const target = targetPlayers[j]
                  const amount = ethers.formatEther(amounts[j])

                  // Generate a bet timestamp between pool start and now
                  const betTime = poolStartTime + Math.random() * (Date.now() - poolStartTime)

                  // Get bet type label
                  let betTypeLabel = "Unknown"
                  switch (Number(betTypes[j])) {
                    case 0:
                      betTypeLabel = "Champion"
                      break
                    case 1:
                      betTypeLabel = "Top 3"
                      break
                    case 2:
                      betTypeLabel = "Top 5"
                      break
                    case 3:
                      betTypeLabel = "Top 10"
                      break
                  }

                  events.push({
                    id: `bet-placed-${i}-${player}-${j}`,
                    poolId: i,
                    type: "BET_PLACED",
                    description: `${player.substring(0, 6)}...${player.substring(38)} placed a ${amount} ETH bet (${betTypeLabel}) on ${target.substring(0, 6)}...${target.substring(38)} in Pool #${i}`,
                    timestamp: betTime,
                    address: player,
                    target: target,
                    betType: betTypeLabel,
                    amount: amount,
                  })
                }
              } catch (e) {
                console.warn(`Error getting bets for player ${player} in pool ${i}:`, e)
              }
            }
          } catch (e) {
            console.warn(`Error getting bet events for pool ${i}:`, e)
          }

          // Add voting ticket purchase events
          try {
            // For each player, check if they have additional votes
            for (const player of [...playersList.activePlayers, ...playersList.eliminatedPlayers]) {
              try {
                const additionalVotes = await contract.additionalVotes(i, player)

                // Add voting ticket purchase events
                if (Number(additionalVotes) > 0) {
                  const purchaseTime = poolStartTime + Math.random() * (Date.now() - poolStartTime)

                  events.push({
                    id: `voting-ticket-purchased-${i}-${player}`,
                    poolId: i,
                    type: "VOTING_TICKET_PURCHASED",
                    description: `${player.substring(0, 6)}...${player.substring(38)} purchased voting tickets for ${Number(additionalVotes) / 3} additional votes in Pool #${i}`,
                    timestamp: purchaseTime,
                    address: player,
                  })
                }
              } catch (e) {
                console.warn(`Error checking additional votes for player ${player} in pool ${i}:`, e)
              }
            }
          } catch (e) {
            console.warn(`Error getting ticket events for pool ${i}:`, e)
          }

          // Add voting events
          try {
            // For each player, check their votes
            for (const player of [...playersList.activePlayers, ...playersList.eliminatedPlayers]) {
              try {
                const userVotes = await contract.getUserVotes(i, player)

                if (userVotes && userVotes.votedFor && userVotes.votedFor.length > 0) {
                  // Generate a voting timestamp between pool start and now
                  const voteTime = poolStartTime + Math.random() * (Date.now() - poolStartTime)

                  for (const votedFor of userVotes.votedFor) {
                    events.push({
                      id: `vote-cast-${i}-${player}-${votedFor}`,
                      poolId: i,
                      type: "VOTE_CAST",
                      description: `${player.substring(0, 6)}...${player.substring(38)} voted for ${votedFor.substring(0, 6)}...${votedFor.substring(38)} in Pool #${i}`,
                      timestamp: voteTime,
                      address: player,
                      target: votedFor,
                    })
                  }
                }
              } catch (e) {
                console.warn(`Error getting votes for player ${player} in pool ${i}:`, e)
              }
            }
          } catch (e) {
            console.warn(`Error getting voting events for pool ${i}:`, e)
          }
        } catch (e) {
          console.warn(`Error processing pool ${i} for activity events:`, e)
        }
      }

      // Sort events by timestamp (newest first)
      events.sort((a, b) => b.timestamp - a.timestamp)

      console.log("Generated activity events:", events)
      return events
    } catch (error) {
      console.error("Error fetching activity events:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [contract, isConnected])

  // Join a pool
  const joinPool = async (poolId: number, entranceFee: string) => {
    if (!contract) return false

    try {
      // Contract'tan entrance fee'yi tekrar kontrol et
      const poolData = await contract.pools(poolId)
      const requiredFee = poolData.poolEntranceFee

      const tx = await contract.joinPool(poolId, {
        value: requiredFee, // Contract'tan gelen değeri doğrudan kullan
        gasLimit: 300000
      })

      await tx.wait()
      return true
    } catch (error) {
      console.error("Join pool error:", error)
      return false
    }
  }

  // Vote for a candidate
  const voteForCandidate = useCallback(
    async (poolId: number, candidateAddress: string) => {
      if (!contract || !isConnected) {
        toast({
          title: "Not connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        })
        return false
      }

      try {
        setIsLoading(true)
        console.log("Voting for candidate:", candidateAddress, "in pool:", poolId)

        // Check pool state before voting
        try {
          const state = await contract.getPoolStateAsString(poolId)
          if (state !== "Registration and Voting") {
            toast({
              title: "Cannot vote",
              description: `Pool is in ${state} state. Voting is only allowed in Registration and Voting state.`,
              variant: "destructive",
            })
            return false
          }
        } catch (e) {
          console.warn("Error checking pool state:", e)
        }

        // Create an array with the single candidate
        const candidates = [candidateAddress]

        toast({
          title: "Transaction submitted",
          description: "Casting vote...",
        })

        // Prepare transaction options with gas settings
        const options = await prepareTransactionOptions()

        // Call the voteForCandidates function
        const tx = await contract.voteForCandidates(poolId, candidates, options)

        await tx.wait()

        toast({
          title: "Success",
          description: "Vote cast successfully",
        })

        return true
      } catch (error) {
        console.error("Error voting for candidate:", error)

        // Extract the reason from the error
        let errorMessage = "Unknown error"
        if (error.reason) {
          errorMessage = error.reason
        } else if (error.message) {
          // Try to extract the reason from the error message
          const match = error.message.match(/"([^"]+)"/)
          if (match && match[1]) {
            errorMessage = match[1]
          } else {
            errorMessage = error.message
          }
        }

        toast({
          title: "Error",
          description: "Failed to cast vote: " + errorMessage,
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contract, isConnected, toast, prepareTransactionOptions],
  )

  // Vote for multiple candidates at once
  const voteForMultipleCandidates = useCallback(
    async (poolId: number, candidateAddresses: string[]) => {
      if (!contract || !isConnected) {
        toast({
          title: "Not connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        })
        return false
      }

      try {
        setIsLoading(true)
        console.log("Voting for candidates:", candidateAddresses, "in pool:", poolId)

        // Check pool state before voting
        try {
          const state = await contract.getPoolStateAsString(poolId)
          if (state !== "Registration and Voting") {
            toast({
              title: "Cannot vote",
              description: `Pool is in ${state} state. Voting is only allowed in Registration and Voting state.`,
              variant: "destructive",
            })
            return false
          }
        } catch (e) {
          console.warn("Error checking pool state:", e)
        }

        toast({
          title: "Transaction submitted",
          description: "Casting votes...",
        })

        // Prepare transaction options with gas settings
        const options = await prepareTransactionOptions()

        // Yeni kontrat artık aynı adaya birden fazla oy vermeye izin veriyor
        const tx = await contract.voteForCandidates(poolId, candidateAddresses, options)

        await tx.wait()

        toast({
          title: "Success",
          description: "Votes cast successfully",
        })

        return true
      } catch (error) {
        console.error("Error voting for candidates:", error)

        // Extract the reason from the error
        let errorMessage = "Unknown error"
        if (error.reason) {
          errorMessage = error.reason
        } else if (error.message) {
          // Try to extract the reason from the error message
          const match = error.message.match(/"([^"]+)"/)
          if (match && match[1]) {
            errorMessage = match[1]
          } else {
            errorMessage = error.message
          }
        }

        toast({
          title: "Error",
          description: "Failed to cast votes: " + errorMessage,
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contract, isConnected, toast, prepareTransactionOptions],
  )

  // Place a bet
  const placeBet = useCallback(
    async (poolId: number, targetAddress: string, betType: number, amount: string) => {
      if (!contract || !isConnected) {
        toast({
          title: "Not connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        })
        return false
      }

      try {
        setIsLoading(true)
        console.log("Placing bet on:", targetAddress, "in pool:", poolId)
        console.log("Bet type:", betType, "Amount:", amount, "ETH")

        // Convert amount to ethers
        const value = ethers.parseEther(amount)

        console.log("Value in wei:", value.toString())

        // Prepare transaction options with gas settings
        const options = await prepareTransactionOptions(value)

        toast({
          title: "Transaction submitted",
          description: "Placing bet...",
        })

        const tx = await contract.placeBet(poolId, targetAddress, betType, options)

        await tx.wait()

        toast({
          title: "Success",
          description: "Bet placed successfully",
        })

        return true
      } catch (error) {
        console.error("Error placing bet:", error)
        toast({
          title: "Error",
          description: "Failed to place bet: " + (error.reason || error.message || "Unknown error"),
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contract, isConnected, toast, prepareTransactionOptions],
  )

  // Get players in a pool
  const getPoolPlayers = useCallback(
    async (poolId: number) => {
      if (!contract || !isConnected) {
        console.log("Contract or connection not available, returning mock data")
        return {
          active: [
            { address: "0x1234...5678", isActive: true, joinTime: Date.now() - 1000 * 60 * 60 * 24 * 2 },
            { address: "0x8765...4321", isActive: true, joinTime: Date.now() - 1000 * 60 * 60 * 24 * 3 },
          ],
          eliminated: [{ address: "0x9876...5432", isActive: false, joinTime: Date.now() - 1000 * 60 * 60 * 24 * 5 }],
        }
      }

      try {
        setIsLoading(true)
        console.log("Fetching players for pool:", poolId)

        const result = await contract.getAllPlayers(poolId)
        console.log("Player data from contract:", result)

        const activePlayers = result.activePlayers.map((address: string, i: number) => ({
          address,
          isActive: true,
          joinTime: Number(result.joinTimes[i]) * 1000,
        }))

        const eliminatedPlayers = result.eliminatedPlayers.map((address: string, i: number) => ({
          address,
          isActive: false,
          joinTime: Number(result.joinTimes[activePlayers.length + i]) * 1000,
        }))

        return { active: activePlayers, eliminated: eliminatedPlayers }
      } catch (error) {
        console.error("Error fetching pool players:", error)
        toast({
          title: "Error",
          description: "Failed to fetch pool players",
          variant: "destructive",
        })
        return {
          active: [
            { address: "0x1234...5678", isActive: true, joinTime: Date.now() - 1000 * 60 * 60 * 24 * 2 },
            { address: "0x8765...4321", isActive: true, joinTime: Date.now() - 1000 * 60 * 60 * 24 * 3 },
          ],
          eliminated: [{ address: "0x9876...5432", isActive: false, joinTime: Date.now() - 1000 * 60 * 60 * 24 * 5 }],
        }
      } finally {
        setIsLoading(false)
      }
    },
    [contract, isConnected, toast],
  )

  // Get user bets
  const getUserBets = useCallback(
    async (poolId: number, address: string) => {
      if (!contract || !isConnected) return []

      try {
        setIsLoading(true)
        console.log("Fetching bets for user:", address, "in pool:", poolId)

        const result = await contract.getUserBets(poolId, address)
        console.log("User bets from contract:", result)

        // If result is empty or undefined, return empty array
        if (!result) {
          return []
        }

        // Process contract data safely
        const targetPlayers = result.targetPlayers || []
        const amounts = result.amounts || []
        const betTypes = result.betTypes || []
        const isCorrect = result.isCorrect || []
        const isClaimed = result.isClaimed || []

        // Check array lengths
        const length = Math.min(
          targetPlayers.length || 0,
          amounts.length || 0,
          betTypes.length || 0,
          isCorrect.length || 0,
          isClaimed.length || 0,
        )

        // If no data, return empty array
        if (length === 0) {
          return []
        }

        // Process bets
        const bets = []
        for (let i = 0; i < length; i++) {
          try {
            const amount = ethers.formatEther(amounts[i] || 0)

            bets.push({
              target: targetPlayers[i] || "0x0000000000000000000000000000000000000000",
              amount,
              betType: Number(betTypes[i] || 0),
              isWon: Boolean(isCorrect[i]),
              isClaimed: Boolean(isClaimed[i]),
            })
          } catch (e) {
            console.warn(`Error processing bet at index ${i}:`, e)
          }
        }

        console.log("Processed bets:", bets)
        return bets
      } catch (error) {
        console.error("Error fetching user bets:", error)
        // Return empty array on error
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [contract, isConnected, toast],
  )

  // Get all user bets across all pools
  const getAllUserBets = useCallback(async () => {
    if (!contract || !isConnected || !account) {
      console.log("Contract, connection, or account not available, returning empty array")
      return []
    }

    try {
      setIsLoading(true)
      console.log("Fetching all user bets...")

      // Get the next pool ID to know how many pools exist
      const nextPoolId = await contract.nextPoolId()

      const allBets = []

      // Loop through all pools
      for (let i = 1; i < nextPoolId; i++) {
        try {
          const bets = await getUserBets(i, account)

          // If there are bets, add pool ID
          if (bets && bets.length > 0) {
            bets.forEach((bet) => {
              allBets.push({
                ...bet,
                poolId: i,
              })
            })
          }
        } catch (e) {
          console.warn(`Error fetching bets for pool ${i}:`, e)
        }
      }

      console.log("Fetched all user bets:", allBets)
      return allBets
    } catch (error) {
      console.error("Error fetching all user bets:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [contract, isConnected, account, getUserBets])

  // Get popular players
  const getPopularPlayers = useCallback(async () => {
    if (!contract || !isConnected) {
      console.log("Contract or connection not available, returning empty array")
      return []
    }

    try {
      setIsLoading(true)
      console.log("Fetching popular players...")

      // Get the next pool ID to know how many pools exist
      const nextPoolId = await contract.nextPoolId()

      // Create a map to track votes across all pools
      const votesMap = new Map()

      // Loop through all pools
      for (let i = 1; i < nextPoolId; i++) {
        try {
          // Get pool details
          const pool = await contract.pools(i)

          // Only check active pools
          if (pool.isActive) {
            // Get all players
            const result = await contract.getAllPlayers(i)

            // Check votes for each player
            for (const player of [...result.activePlayers, ...result.eliminatedPlayers]) {
              try {
                const votes = await contract.candidateVotes(i, player)
                const votesNumber = Number(votes)

                // Add votes to the map
                if (votesMap.has(player)) {
                  votesMap.set(player, votesMap.get(player) + votesNumber)
                } else {
                  votesMap.set(player, votesNumber)
                }
              } catch (e) {
                console.warn(`Error getting votes for player ${player} in pool ${i}:`, e)
              }
            }
          }
        } catch (e) {
          console.warn(`Error processing pool ${i} for popular players:`, e)
        }
      }

      // Convert map to array and sort by votes
      const popularPlayers = Array.from(votesMap.entries())
        .map(([address, votes]) => ({ address, votes }))
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 5) // Get top 5

      console.log("Popular players:", popularPlayers)
      return popularPlayers
    } catch (error) {
      console.error("Error fetching popular players:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [contract, isConnected])

  // Get user votes
  const getUserVotes = useCallback(
    async (poolId: number, address: string) => {
      if (!contract || !isConnected) return { votedFor: [], totalVotes: 0 }

      try {
        setIsLoading(true)
        console.log("Fetching votes for user:", address, "in pool:", poolId)

        const result = await contract.getUserVotes(poolId, address)
        console.log("User votes from contract:", result)

        return {
          votedFor: result.votedFor,
          totalVotes: Number(result.totalVotesCast),
        }
      } catch (error) {
        console.error("Error fetching user votes:", error)
        toast({
          title: "Error",
          description: "Failed to fetch user votes",
          variant: "destructive",
        })
        return { votedFor: [], totalVotes: 0 }
      } finally {
        setIsLoading(false)
      }
    },
    [contract, isConnected, toast],
  )

  // Get remaining votes
  const getRemainingVotes = useCallback(
    async (poolId: number, address: string) => {
      if (!contract || !isConnected) return 3

      try {
        console.log("Fetching remaining votes for user:", address, "in pool:", poolId)
        const result = await contract.getRemainingVotes(poolId, address)
        return Number(result)
      } catch (error) {
        console.error("Error fetching remaining votes:", error)
        return 3
      }
    },
    [contract, isConnected],
  )

  // Get total voting rights
  const getTotalVotingRights = useCallback(
    async (poolId: number, address: string) => {
      if (!contract || !isConnected) return 3

      try {
        console.log("Fetching total voting rights for user:", address, "in pool:", poolId)
        const result = await contract.getTotalVotingRights(poolId, address)
        return Number(result)
      } catch (error) {
        console.error("Error fetching total voting rights:", error)
        return 3
      }
    },
    [contract, isConnected],
  )

  // Claim pool reward
  const claimPoolReward = useCallback(
    async (poolId: number) => {
      if (!contract || !isConnected) {
        toast({
          title: "Not connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        })
        return false
      }

      try {
        setIsLoading(true)

        // Prepare transaction options with gas settings
        const options = await prepareTransactionOptions()

        toast({
          title: "Transaction submitted",
          description: "Claiming reward...",
        })

        const tx = await contract.claimPoolReward(poolId, options)

        await tx.wait()

        toast({
          title: "Success",
          description: "Reward claimed successfully",
        })

        return true
      } catch (error) {
        console.error("Error claiming reward:", error)
        toast({
          title: "Error",
          description: "Failed to claim reward: " + (error.reason || "Unknown error"),
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contract, isConnected, toast, prepareTransactionOptions],
  )

  // Claim bet reward
  const claimBetReward = useCallback(
    async (poolId: number) => {
      if (!contract || !isConnected) {
        toast({
          title: "Not connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        })
        return false
      }

      try {
        setIsLoading(true)

        // Prepare transaction options with gas settings
        const options = await prepareTransactionOptions()

        toast({
          title: "Transaction submitted",
          description: "Claiming bet reward...",
        })

        const tx = await contract.claimBetReward(poolId, options)

        await tx.wait()

        toast({
          title: "Success",
          description: "Bet reward claimed successfully",
        })

        return true
      } catch (error) {
        console.error("Error claiming bet reward:", error)
        toast({
          title: "Error",
          description: "Failed to claim bet reward: " + (error.reason || "Unknown error"),
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contract, isConnected, toast, prepareTransactionOptions],
  )

  // Purchase a voting ticket
  const purchaseVotingTicket = useCallback(
    async (poolId: number, ticketPrice: string) => {
      if (!contract || !isConnected) {
        toast({
          title: "Not connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        })
        return false
      }

      try {
        setIsLoading(true)
        console.log("Purchasing voting ticket for pool:", poolId)
        console.log("Ticket price:", ticketPrice, "ETH")

        // Convert ticketPrice to ethers
        const value = ethers.parseEther(ticketPrice)

        console.log("Value in wei:", value.toString())

        // Prepare transaction options with gas settings
        const options = await prepareTransactionOptions(value)

        toast({
          title: "Transaction submitted",
          description: "Purchasing voting ticket...",
        })

        const tx = await contract.purchaseVotingTicket(poolId, options)

        await tx.wait()

        toast({
          title: "Success",
          description: "Voting ticket purchased successfully. You now have 3 additional votes.",
        })

        return true
      } catch (error) {
        console.error("Error purchasing voting ticket:", error)
        toast({
          title: "Error",
          description: "Failed to purchase voting ticket: " + (error.reason || error.message || "Unknown error"),
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contract, isConnected, toast, prepareTransactionOptions],
  )

  // Get pool state
  const getPoolState = useCallback(
    async (poolId: number) => {
      if (!contract || !isConnected) {
        console.log("Contract or connection not available, returning default state")
        return "UNKNOWN"
      }

      try {
        console.log("Fetching pool state for pool:", poolId)
        const state = await contract.getPoolStateAsString(poolId)
        console.log("Pool state:", state)
        return state
      } catch (error) {
        console.error("Error fetching pool state:", error)
        return "UNKNOWN"
      }
    },
    [contract, isConnected],
  )

  // Check if user has tickets
  const checkUserTickets = useCallback(
    async (poolId: number) => {
      if (!contract || !isConnected || !account) {
        return { additionalVotes: 0 }
      }

      try {
        // Get additional votes
        const additionalVotes = await contract.additionalVotes(poolId, account)
        return { additionalVotes: Number(additionalVotes) }
      } catch (error) {
        console.error("Error checking user tickets:", error)
        return { additionalVotes: 0 }
      }
    },
    [contract, isConnected, account],
  )

  // Get top ten players
  const getTopTenPlayers = useCallback(
    async (poolId: number) => {
      if (!contract || !isConnected) {
        return []
      }

      try {
        console.log("Fetching top ten players for pool:", poolId)
        const players = await contract.getTopTenPlayers(poolId)
        return players
      } catch (error) {
        console.error("Error fetching top ten players:", error)
        return []
      }
    },
    [contract, isConnected],
  )

  // Get top ten players with ranks
  const getTopTenPlayersWithRanks = useCallback(
    async (poolId: number) => {
      if (!contract || !isConnected) {
        return { players: [], ranks: [] }
      }

      try {
        console.log("Fetching top ten players with ranks for pool:", poolId)
        const result = await contract.getTopTenPlayersWithRanks(poolId)
        return {
          players: result.players,
          ranks: result.ranks.map((rank) => Number(rank)),
        }
      } catch (error) {
        console.error("Error fetching top ten players with ranks:", error)
        return { players: [], ranks: [] }
      }
    },
    [contract, isConnected],
  )

  // Get user stats
  const getUserStats = useCallback(async () => {
    if (!contract || !isConnected || !account) {
      return {
        totalEarnings: "0",
        poolsJoined: 0,
        betsPlaced: 0,
      }
    }

    try {
      setIsLoading(true)

      // Get user pools
      const userPools = await getUserPools()

      // Get all user bets
      const userBets = await getAllUserBets()

      // Calculate total earnings
      let totalEarnings = 0

      // Add pool rewards
      for (const pool of userPools) {
        if (pool.isCompleted && !pool.hasClaimed) {
          totalEarnings += Number.parseFloat(pool.reward)
        }
      }

      // Add bet rewards
      for (const bet of userBets) {
        if (bet.isWon && !bet.isClaimed) {
          totalEarnings += Number.parseFloat(bet.amount) * [10, 5, 3, 2][bet.betType]
        }
      }

      return {
        totalEarnings: totalEarnings.toFixed(2),
        poolsJoined: userPools.length,
        betsPlaced: userBets.length,
      }
    } catch (error) {
      console.error("Error getting user stats:", error)
      return {
        totalEarnings: "0",
        poolsJoined: 0,
        betsPlaced: 0,
      }
    } finally {
      setIsLoading(false)
    }
  }, [contract, isConnected, account, getUserPools, getAllUserBets])

  // Complete elimination randomly with higher gas limit
  const completeEliminationRandomly = useCallback(
    async (poolId: number) => {
      if (!contract || !isConnected) {
        toast({
          title: "Not connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        })
        return false
      }

      try {
        setIsLoading(true)
        console.log("Completing elimination randomly for pool:", poolId)

        toast({
          title: "Transaction submitted",
          description: "Completing elimination...",
        })

        // Prepare transaction options with higher gas limit for this operation
        const options = {
          gasLimit: 3000000, // Higher gas limit for this complex operation
        }

        const tx = await contract.completeEliminationRandomly(poolId, options)

        await tx.wait()

        toast({
          title: "Success",
          description: "Elimination completed successfully",
        })

        return true
      } catch (error) {
        console.error("Error completing elimination:", error)
        toast({
          title: "Error",
          description: "Failed to complete elimination: " + (error.reason || error.message || "Unknown error"),
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contract, isConnected, toast],
  )

  // Update pool parameters including candidatesToSelect
  const updatePoolParameters = useCallback(
    async (
      poolId: number,
      entranceFee: string,
      ticketPrice: string,
      minBetAmount: string,
      maxBetAmount: string,
      eliminationInterval: string,
      candidatesToSelect: string,
    ) => {
      if (!contract || !isConnected) {
        toast({
          title: "Not connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        })
        return false
      }

      try {
        setIsLoading(true)
        console.log("Updating pool parameters for pool:", poolId)

        // Convert values to wei
        const entranceFeeWei = ethers.parseEther(entranceFee)
        const ticketPriceWei = ethers.parseEther(ticketPrice)
        const minBetAmountWei = ethers.parseEther(minBetAmount)
        const maxBetAmountWei = ethers.parseEther(maxBetAmount)

        // Prepare transaction options with gas settings
        const options = await prepareTransactionOptions()

        toast({
          title: "Transaction submitted",
          description: "Updating pool parameters...",
        })

        const tx = await contract.updatePoolParameters(
          poolId,
          entranceFeeWei,
          ticketPriceWei,
          minBetAmountWei,
          maxBetAmountWei,
          eliminationInterval,
          candidatesToSelect,
          options,
        )

        await tx.wait()

        toast({
          title: "Success",
          description: "Pool parameters updated successfully",
        })

        return true
      } catch (error) {
        console.error("Error updating pool parameters:", error)
        toast({
          title: "Error",
          description: "Failed to update pool parameters: " + (error.reason || error.message || "Unknown error"),
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [contract, isConnected, toast, prepareTransactionOptions],
  )

  // getEliminationCandidates fonksiyonunu ekleyelim
  const getEliminationCandidates = useCallback(
    async (poolId: number) => {
      if (!contract || !isConnected) {
        console.log("Contract or connection not available, returning empty array")
        return []
      }

      try {
        console.log("Fetching elimination candidates for pool:", poolId)
        const candidates = await contract.getEliminationCandidates(poolId)
        console.log("Elimination candidates:", candidates)
        return candidates
      } catch (error) {
        console.error("Error fetching elimination candidates:", error)
        return []
      }
    },
    [contract, isConnected],
  )

  // Oy verilerini çekmek için yeni fonksiyonlar ekleyelim
  const getCandidateVotes = useCallback(
    async (poolId: number, address: string) => {
      if (!contract) return 0

      try {
        console.log("Fetching votes for:", address, "in pool:", poolId)
        const votes = await contract.candidateVotes(poolId, address)
        const voteCount = votes ? Number(votes.toString()) : 0
        console.log("Vote count:", voteCount)
        return voteCount
      } catch (error) {
        console.error(`Oy verisi alınamadı (${address}):`, error)
        return 0
      }
    },
    [contract]
  )

  const getUserVoteCount = useCallback(
    async (poolId: number, voter: string) => {
      if (!contract) return 0

      try {
        const votes = await contract.getUserVotes(poolId, voter)
        return Number(votes.toString())
      } catch (error) {
        console.error(`Kullanıcı oyları alınamadı (${voter}):`, error)
        return 0
      }
    },
    [contract]
  )

  const getVoteCountForCandidate = useCallback(
    async (poolId: number, voter: string, candidate: string) => {
      if (!contract) return 0

      try {
        const votes = await contract.getVoteCountForCandidate(poolId, voter, candidate)
        return Number(votes.toString())
      } catch (error) {
        console.error("Aday için oy sayısı alınamadı:", error)
        return 0
      }
    },
    [contract]
  )

  // Return kısmına yeni fonksiyonları ekleyelim
  return {
    isLoading,
    getActivePools,
    getAllPools,
    getUserPools,
    getActivityEvents,
    joinPool,
    voteForCandidate,
    voteForMultipleCandidates,
    placeBet,
    getPoolPlayers,
    getUserBets,
    getAllUserBets,
    getUserVotes,
    getRemainingVotes,
    getTotalVotingRights,
    claimPoolReward,
    claimBetReward,
    purchaseVotingTicket,
    getPopularPlayers,
    getPoolState,
    checkUserTickets,
    getUserStats,
    getAllUserTickets,
    getTopTenPlayers,
    getTopTenPlayersWithRanks,
    completeEliminationRandomly,
    updatePoolParameters,
    getEliminationCandidates,
    sendTransaction,
    getCandidateVotes,
    getUserVoteCount,
    getVoteCountForCandidate,
  }
}
