"use client"

import { useWallet } from "@/context/WalletContext"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export default function WalletConnectButton() {
  const { account, connectWallet, disconnectWallet, isConnected, isConnecting } = useWallet()

  return (
    <>
      {isConnected ? (
        <Button
          variant="outline"
          size="sm"
          onClick={disconnectWallet}
          className="border-primary/30 text-foreground hover:bg-primary/10"
        >
          <Wallet className="h-4 w-4 mr-2" />
          {account?.substring(0, 6)}...{account?.substring(38)}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={connectWallet}
          disabled={isConnecting}
          className="border-primary/30 text-foreground hover:bg-primary/10"
        >
          <Wallet className="h-4 w-4 mr-2" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </>
  )
}
