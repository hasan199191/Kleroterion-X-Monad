"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"
import deployedContracts from "@/contracts/deployedContracts"
import Web3 from 'web3'

// Contract status enum to track contract state
export enum ContractStatus {
  INITIALIZING = "initializing",
  READY = "ready",
  ERROR = "error",
  NOT_CONNECTED = "not_connected"
}

// Update the WalletContextType to use the correct types
export interface WalletContextType {
  address: string | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnect: () => void
  account: string | null
  chainId: number | null
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  contract: ethers.Contract | null
  isConnecting: boolean
  contractStatus: ContractStatus
  reinitializeContract: () => Promise<ethers.Contract | null>
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  connectWallet: async () => {},
  disconnect: () => {},
  account: null,
  chainId: null,
  provider: null,
  signer: null,
  contract: null,
  isConnecting: false,
  contractStatus: ContractStatus.NOT_CONNECTED,
  reinitializeContract: async () => null
})

export const useWallet = () => useContext(WalletContext)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [contractStatus, setContractStatus] = useState<ContractStatus>(ContractStatus.NOT_CONNECTED)
  const { toast } = useToast()

  // Get environment variables
  const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID ? Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) : 10143
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x6797fb3F6B09dd2306e0D5Fb26999823417Fdb11"
  const networkName = process.env.NEXT_PUBLIC_NETWORK_NAME || "Monad Testnet"
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://testnet-rpc.monad.xyz"

  // Initialize contract with provider and signer
  const initializeContract = async (signer: ethers.Signer) => {
    try {
      setContractStatus(ContractStatus.INITIALIZING)

      const contractABI = deployedContracts[10143].MonadZSurvive.abi
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer)
      
      // Gas settings
      const overrides = {
        gasLimit: 300000,      // 300k gas limit
        gasPrice: ethers.parseUnits('1', 'gwei'),  // 1 gwei
        maxFeePerGas: ethers.parseUnits('2', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei')
      }

      // Add gas override settings to contract
      const enhancedContract = Object.assign(contractInstance, { 
        defaultOverrides: overrides 
      })

      // Try a simple read call to verify contract is working
      try {
        await enhancedContract.owner().catch(() => {
          console.log("Contract connection test completed")
        })
      } catch (testError) {
        console.log("Contract test call error:", testError)
      }

      setContract(enhancedContract)
      setContractStatus(ContractStatus.READY)
      console.log("Contract initialized with gas settings:", enhancedContract)
      return enhancedContract
    } catch (error) {
      console.error("Error initializing contract:", error)
      setContractStatus(ContractStatus.ERROR)
      toast({
        title: "Contract error", 
        description: "Failed to initialize contract",
        variant: "destructive",
      })
      return null
    }
  }

  const reinitializeContract = async (): Promise<ethers.Contract | null> => {
    if (!signer) {
      console.log("Cannot reinitialize contract: No signer available")
      return null
    }
    
    console.log("Reinitializing contract...")
    return await initializeContract(signer)
  }

  // Auto-reconnect on page load
  useEffect(() => {
    const autoConnect = async () => {
      const savedAccount = localStorage.getItem("walletAccount")
      if (savedAccount && window.ethereum) {
        try {
          setIsConnecting(true)

          // Check if already connected to the wallet
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            // Get provider and signer
            const ethereum = window.ethereum
            const web3Provider = new ethers.BrowserProvider(ethereum)
            const web3Signer = await web3Provider.getSigner()
            const network = await web3Provider.getNetwork()

            // Set state
            setProvider(web3Provider)
            setSigner(web3Signer)
            setAccount(accounts[0])
            setChainId(Number(network.chainId))

            // Initialize contract
            await initializeContract(web3Signer)

            // Set up event listeners
            ethereum.on("accountsChanged", handleAccountsChanged)
            ethereum.on("chainChanged", handleChainChanged)

            console.log("Auto-connected to wallet:", accounts[0])
          } else {
            // Clear saved account if not connected
            localStorage.removeItem("walletAccount")
          }
        } catch (error) {
          console.error("Error auto-connecting:", error)
          localStorage.removeItem("walletAccount")
        } finally {
          setIsConnecting(false)
        }
      }
    }

    autoConnect()

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected",
        variant: "destructive",
      })
    } else if (accounts[0] !== account) {
      setAccount(accounts[0])
      localStorage.setItem("walletAccount", accounts[0])

      // Re-initialize contract with new account
      if (provider) {
        provider.getSigner().then((newSigner) => {
          setSigner(newSigner)
          initializeContract(newSigner)
        })
      }

      toast({
        title: "Account changed",
        description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
      })
    }
  }

  // Handle chain changes
  const handleChainChanged = (chainIdHex: string) => {
    const newChainId = Number.parseInt(chainIdHex, 16)
    setChainId(newChainId)

    // Check if the chain ID matches the expected one
    if (newChainId !== expectedChainId) {
      toast({
        title: "Wrong network",
        description: `Please switch to ${networkName} (Chain ID: ${expectedChainId})`,
        variant: "destructive",
      })
    }

    // Reload if chain changed
    if (chainId && chainId !== newChainId) {
      window.location.reload()
    }
  }

  // Connect wallet
  const connectWallet = async () => {
    try {
      const web3 = new Web3(window.ethereum)
      
      // Gas price settings
      web3.eth.defaultGasPrice = '1000000000' // 1 gwei
      web3.eth.defaultGas = 3000000 // 3M gas limit
      
      if (!window.ethereum) {
        toast({
          title: "Wallet not found",
          description: "Please install MetaMask or another Ethereum wallet",
          variant: "destructive",
        })
        return
      }

      setIsConnecting(true)

      // Request accounts
      const ethereum = window.ethereum
      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      // Check network and switch if needed
      const currentChainIdHex = await ethereum.request({ method: "eth_chainId" })
      const currentChainId = Number.parseInt(currentChainIdHex, 16)

      if (currentChainId !== expectedChainId) {
        try {
          // Try to switch to the expected network
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
          })
        } catch (switchError: any) {
          // If the network doesn't exist in the wallet, try to add it
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${expectedChainId.toString(16)}`,
                    chainName: networkName,
                    rpcUrls: [rpcUrl],
                    nativeCurrency: {
                      name: "MON",
                      symbol: "MON",
                      decimals: 18,
                    },
                    blockExplorerUrls: ["https://testnet.monadexplorer.com"],
                  },
                ],
              })
            } catch (addError) {
              console.error("Error adding chain:", addError)
              toast({
                title: "Network error",
                description: `Failed to add ${networkName} to your wallet`,
                variant: "destructive",
              })
              setIsConnecting(false)
              return
            }
          } else {
            console.error("Error switching chain:", switchError)
            toast({
              title: "Network error",
              description: `Failed to switch to ${networkName}`,
              variant: "destructive",
            })
            setIsConnecting(false)
            return
          }
        }
      }

      // Get provider and signer using ethers v6
      const web3Provider = new ethers.BrowserProvider(ethereum)
      const web3Signer = await web3Provider.getSigner()
      const network = await web3Provider.getNetwork()

      // Set state
      setProvider(web3Provider)
      setSigner(web3Signer)
      setAccount(accounts[0])
      setChainId(Number(network.chainId))

      // Save to localStorage
      localStorage.setItem("walletAccount", accounts[0])

      // Initialize contract
      await initializeContract(web3Signer)

      // Set up event listeners
      ethereum.on("accountsChanged", handleAccountsChanged)
      ethereum.on("chainChanged", handleChainChanged)

      toast({
        title: "Wallet connected",
        description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    setAccount(null)
    setChainId(null)
    setProvider(null)
    setSigner(null)
    setContract(null)
    setContractStatus(ContractStatus.NOT_CONNECTED)
    localStorage.removeItem("walletAccount")

    // Remove event listeners if provider exists
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const value = {
    address: account,
    isConnected: !!account,
    connectWallet,
    disconnect,
    account,
    chainId,
    provider,
    signer,
    contract,
    isConnecting,
    contractStatus,
    reinitializeContract
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

// Add type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

// useContract hook'unda joinPool fonksiyonunu güncelleyelim
export const useContract = () => {
  const { contract } = useWallet()

  const joinPool = async (poolId: number) => {
    if (!contract) return
    
    try {
      const tx = await contract.joinPool(poolId, {
        value: ethers.parseEther("0.1"),
        gasLimit: 300000,
        maxFeePerGas: ethers.parseUnits('2', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei')
      })
      
      await tx.wait()
      return tx
    } catch (error) {
      console.error("Join pool error:", error)
      throw error
    }
  }

  return { joinPool }
}
