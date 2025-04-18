export const contractAddress = "0x6797fb3F6B09dd2306e0D5Fb26999823417Fdb11"

export const contractABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_poolId", "type": "uint256"},
      {"internalType": "address", "name": "_candidate", "type": "address"}
    ],
    "name": "candidateVotes",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "pools",
    "outputs": [
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "isCompleted", "type": "bool"},
      {"internalType": "bool", "name": "isPaused", "type": "bool"},
      {"internalType": "enum MonadZSurvive.PoolState", "name": "state", "type": "uint8"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "eliminationStartTime", "type": "uint256"},
      {"internalType": "uint256", "name": "bettingEndTime", "type": "uint256"},
      {"internalType": "uint256", "name": "totalEntranceFees", "type": "uint256"},
      {"internalType": "uint256", "name": "totalBetFees", "type": "uint256"},
      {"internalType": "uint256", "name": "totalTicketFees", "type": "uint256"},
      {"internalType": "address[]", "name": "players", "type": "address[]"},
      {"internalType": "address[]", "name": "eliminatedPlayers", "type": "address[]"},
      {"internalType": "address[]", "name": "bettors", "type": "address[]"},
      {"internalType": "address[]", "name": "eliminationCandidates", "type": "address[]"},
      {"internalType": "address", "name": "champion", "type": "address"},
      {"internalType": "uint256", "name": "poolEntranceFee", "type": "uint256"},
      {"internalType": "uint256", "name": "poolTicketPrice", "type": "uint256"},
      {"internalType": "uint256", "name": "poolMinBetAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "poolMaxBetAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "poolEliminationInterval", "type": "uint256"},
      {"internalType": "bool", "name": "isEliminationActive", "type": "bool"},
      {"internalType": "uint256", "name": "candidatesToSelect", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const