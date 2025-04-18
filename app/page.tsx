"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useWallet } from "@/context/WalletContext"
import { useTwitterAuth } from "@/context/TwitterAuthContext"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FaTwitter } from "react-icons/fa"
import { RiWallet3Fill } from "react-icons/ri"

export default function LandingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { connectTwitter } = useTwitterAuth()
  const wallet = useWallet()
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Check if both X and wallet are connected
  useEffect(() => {
    if (session?.user && wallet.address) {
      handlePlayerRegistration()
    }
  }, [session, wallet.address])

  // Handle player registration and redirect
  const handlePlayerRegistration = async () => {
    try {
      const response = await fetch('/api/check-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: wallet.address })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Welcome to Arena!",
        })
        router.push('/home')
      } else {
        toast({
          title: "Error",
          description: "Registration failed. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle X account connection
  const handleTwitterConnect = async () => {
    try {
      await connectTwitter()
      toast({
        title: "Success",
        description: "X account connection initiated",
      })
    } catch (error) {
      console.error("X connection error:", error)
      toast({
        title: "Error",
        description: "Could not connect X account",
        variant: "destructive",
      })
    }
  }

  // Handle wallet connection
  const handleWalletConnect = async () => {
    try {
      await wallet.connectWallet()
      toast({
        title: "Success",
        description: "Wallet connected successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not connect wallet",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground space-y-12 p-4 relative">
      {/* Neon efektli başlık */}
      <div className="space-y-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold font-spacemono text-green-500 animate-pulse glow-text">
          Kleroterion X Monad
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-spacemono">
          The chosen enter the arena. The rest are written into the chain
        </p>
      </div>

      {/* Join Arena butonu */}
      <Button 
        size="lg" 
        onClick={() => setIsModalOpen(true)}
        className="px-12 py-6 text-xl bg-green-500/20 border-2 border-green-500 text-green-500 
                 hover:bg-green-500/30 hover:border-green-400 transition-all duration-300
                 shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.7)]"
      >
        Join Arena
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect to Enter Arena</DialogTitle>
            <DialogDescription>
              Connect your X account and wallet to join the game.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button
              onClick={handleTwitterConnect}
              disabled={!!session?.user}
              className="flex items-center justify-center gap-2"
            >
              <FaTwitter className="w-5 h-5" />
              {session?.user ? "X Connected" : "Connect X"}
            </Button>
            <Button
              onClick={handleWalletConnect}
              disabled={!session?.user || wallet.address}
              className="flex items-center justify-center gap-2"
            >
              <RiWallet3Fill className="w-5 h-5" />
              {wallet.address ? "Wallet Connected" : "Connect Wallet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Neon efekti için CSS */}
      <style jsx global>{`
        .glow-text {
          text-shadow: 0 0 10px rgba(34,197,94,0.7),
                     0 0 20px rgba(34,197,94,0.5),
                     0 0 30px rgba(34,197,94,0.3);
        }
      `}</style>
    </main>
  )
}