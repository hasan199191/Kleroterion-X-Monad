const deployedContracts = {
  10143: {
    MonadZSurvive: {
      address: "0x6797fb3F6B09dd2306e0D5Fb26999823417Fdb11",
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_entranceFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_ticketPrice",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_minBetAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_maxBetAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_eliminationInterval",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "OwnableInvalidOwner",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "OwnableUnauthorizedAccount",
          type: "error",
        },
        {
          inputs: [],
          name: "ReentrancyGuardReentrantCall",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "bettor",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "target",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "betType",
              type: "uint256",
            },
          ],
          name: "BetPlaced",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
          ],
          name: "BettingEnded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "endTime",
              type: "uint256",
            },
          ],
          name: "BettingStarted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "candidate",
              type: "address",
            },
          ],
          name: "CandidateEliminated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "champion",
              type: "address",
            },
          ],
          name: "ChampionDeclared",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "champion",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "eliminatedCount",
              type: "uint256",
            },
          ],
          name: "CompleteRandomElimination",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address[]",
              name: "candidates",
              type: "address[]",
            },
          ],
          name: "EliminationCandidatesSelected",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "player",
              type: "address",
            },
          ],
          name: "ManualEliminationTriggered",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "entranceFee",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "ticketPrice",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "minBetAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "maxBetAmount",
              type: "uint256",
            },
          ],
          name: "ParametersUpdated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "percentage",
              type: "uint256",
            },
          ],
          name: "PlatformFeePercentageUpdated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "PlatformFeesWithdrawn",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "player",
              type: "address",
            },
          ],
          name: "PlayerEliminated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "player",
              type: "address",
            },
          ],
          name: "PlayerJoined",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "player",
              type: "address",
            },
          ],
          name: "PlayerRejoinedPool",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "platformFee",
              type: "uint256",
            },
          ],
          name: "PoolCompleted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "entranceFee",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "ticketPrice",
              type: "uint256",
            },
          ],
          name: "PoolCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
          ],
          name: "PoolFinalized",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "entranceFee",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "ticketPrice",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "minBetAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "maxBetAmount",
              type: "uint256",
            },
          ],
          name: "PoolParametersUpdated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
          ],
          name: "PoolPaused",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
          ],
          name: "PoolResumed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "enum MonadZSurvive.PoolState",
              name: "newState",
              type: "uint8",
            },
          ],
          name: "PoolStateChanged",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "player",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "RewardClaimed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "player",
              type: "address",
            },
          ],
          name: "TicketProtectedPlayer",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "player",
              type: "address",
            },
          ],
          name: "TicketPurchased",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "player",
              type: "address",
            },
          ],
          name: "TicketUsed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "UnclaimedBetFundsTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "voter",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "candidate",
              type: "address",
            },
          ],
          name: "VoteCast",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
          ],
          name: "VotingEnded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "poolId",
              type: "uint256",
            },
            {
              indexed: true,
              internalType: "address",
              name: "buyer",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "additionalVotes",
              type: "uint256",
            },
          ],
          name: "VotingTicketPurchased",
          type: "event",
        },
        {
          stateMutability: "payable",
          type: "fallback",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "additionalVotes",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "betTypeToBettors",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "bettor",
              type: "address",
            },
          ],
          name: "calculateBetReward",
          outputs: [
            {
              internalType: "uint256",
              name: "totalReward",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "player",
              type: "address",
            },
          ],
          name: "calculatePoolReward",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "candidateVotes",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "claimBetReward",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "claimPoolReward",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "completeEliminationRandomly",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "correctBetsPerType",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_entranceFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_ticketPrice",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_minBetAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_maxBetAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_eliminationInterval",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_candidatesToSelect",
              type: "uint256",
            },
          ],
          name: "createCustomPool",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "createPool",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "eliminationInterval",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "emergencyCompletePool",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "endBettingPeriod",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "endRegistrationAndSelectCandidates",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "entranceFee",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "finalizePool",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "getActivePlayerCount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "getActivePlayersList",
          outputs: [
            {
              internalType: "address[]",
              name: "players",
              type: "address[]",
            },
            {
              internalType: "bool[]",
              name: "statuses",
              type: "bool[]",
            },
            {
              internalType: "uint256[]",
              name: "joinTimes",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "getAllPlayers",
          outputs: [
            {
              internalType: "address[]",
              name: "activePlayers",
              type: "address[]",
            },
            {
              internalType: "address[]",
              name: "eliminatedPlayers",
              type: "address[]",
            },
            {
              internalType: "bool[]",
              name: "statuses",
              type: "bool[]",
            },
            {
              internalType: "uint256[]",
              name: "joinTimes",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "getEliminatedPlayers",
          outputs: [
            {
              internalType: "address[]",
              name: "",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "getEliminatedPlayersList",
          outputs: [
            {
              internalType: "address[]",
              name: "players",
              type: "address[]",
            },
            {
              internalType: "bool[]",
              name: "statuses",
              type: "bool[]",
            },
            {
              internalType: "uint256[]",
              name: "joinTimes",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "getPlayerCounts",
          outputs: [
            {
              internalType: "uint256",
              name: "activePlayers",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "eliminatedPlayers",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalPlayers",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "getPoolState",
          outputs: [
            {
              internalType: "enum MonadZSurvive.PoolState",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "getPoolStateAsString",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_user",
              type: "address",
            },
          ],
          name: "getRemainingVotes",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "getTopTenPlayers",
          outputs: [
            {
              internalType: "address[]",
              name: "top10Players",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "getTopTenPlayersWithRanks",
          outputs: [
            {
              internalType: "address[]",
              name: "players",
              type: "address[]",
            },
            {
              internalType: "uint8[]",
              name: "ranks",
              type: "uint8[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_voter",
              type: "address",
            },
          ],
          name: "getTotalVotingRights",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_bettor",
              type: "address",
            },
          ],
          name: "getUserBetCount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_bettor",
              type: "address",
            },
          ],
          name: "getUserBets",
          outputs: [
            {
              internalType: "address[]",
              name: "targetPlayers",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "amounts",
              type: "uint256[]",
            },
            {
              internalType: "enum MonadZSurvive.BetType[]",
              name: "betTypes",
              type: "uint8[]",
            },
            {
              internalType: "bool[]",
              name: "isCorrect",
              type: "bool[]",
            },
            {
              internalType: "bool[]",
              name: "isClaimed",
              type: "bool[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_voter",
              type: "address",
            },
          ],
          name: "getUserVotes",
          outputs: [
            {
              internalType: "address[]",
              name: "votedFor",
              type: "address[]",
            },
            {
              internalType: "uint256",
              name: "totalVotesCast",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "hasClaimedReward",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "hasTicket",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "hasUsedTicket",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "hasVoted",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_voter",
              type: "address",
            },
            {
              internalType: "address",
              name: "_candidate",
              type: "address",
            },
          ],
          name: "hasVotedForCandidate",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "bettor",
              type: "address",
            },
          ],
          name: "isBetWinner",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "player",
              type: "address",
            },
          ],
          name: "isPlayerEliminated",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "player",
              type: "address",
            },
          ],
          name: "isPlayerInPool",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "joinPool",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "maxBetAmount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "minBetAmount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "nextPoolId",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "pausePool",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "target",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "betTypeValue",
              type: "uint256",
            },
          ],
          name: "placeBet",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "platformFeePercentage",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "platformFees",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "poolFinalized",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "poolLastEliminationTime",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "pools",
          outputs: [
            {
              internalType: "bool",
              name: "isActive",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "isCompleted",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "isPaused",
              type: "bool",
            },
            {
              internalType: "enum MonadZSurvive.PoolState",
              name: "state",
              type: "uint8",
            },
            {
              internalType: "uint256",
              name: "startTime",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "eliminationStartTime",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "bettingEndTime",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalEntranceFees",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalBetFees",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "totalTicketFees",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "champion",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "poolEntranceFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "poolTicketPrice",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "poolMinBetAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "poolMaxBetAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "poolEliminationInterval",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isEliminationActive",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "candidatesToSelect",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "purchaseTicket",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "purchaseVotingTicket",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "resumePool",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_platformFeePercentage",
              type: "uint256",
            },
          ],
          name: "setPlatformFeePercentage",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_durationInSeconds",
              type: "uint256",
            },
          ],
          name: "startBettingPeriod",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "ticketExpirationTimes",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "ticketPrice",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "totalBetPerType",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "totalClaimedBetRewards",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_entranceFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_ticketPrice",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_minBetAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_maxBetAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_eliminationInterval",
              type: "uint256",
            },
          ],
          name: "updateParameters",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_percentage",
              type: "uint256",
            },
          ],
          name: "updatePlatformFeePercentage",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_entranceFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_ticketPrice",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_minBetAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_maxBetAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_eliminationInterval",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_candidatesToSelect",
              type: "uint256",
            },
          ],
          name: "updatePoolParameters",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "useTicket",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
          ],
          name: "useTicketToRejoin",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "userBets",
          outputs: [
            {
              internalType: "address",
              name: "target",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "enum MonadZSurvive.BetType",
              name: "betType",
              type: "uint8",
            },
            {
              internalType: "bool",
              name: "claimed",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "isCorrect",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "userVoteCount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_poolId",
              type: "uint256",
            },
            {
              internalType: "address[]",
              name: "_candidates",
              type: "address[]",
            },
          ],
          name: "voteForCandidates",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "recipient",
              type: "address",
            },
          ],
          name: "withdrawPlatformFees",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "withdrawPlatformFeesToOwner",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
  },
}

export default deployedContracts
