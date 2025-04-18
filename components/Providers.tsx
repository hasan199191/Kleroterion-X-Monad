"use client"

import { SessionProvider } from "next-auth/react"
import { TwitterAuthProvider } from "@/context/TwitterAuthContext"
import { WalletProvider } from "@/context/WalletContext"
import { UserProvider } from "@/context/UserContext"
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from 'next/navigation'
import Navigation from "@/components/Navigation"

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/'

  return (
    <SessionProvider>
      <WalletProvider>
        <UserProvider>
          <TwitterAuthProvider>
            {!isLandingPage && <Navigation />}
            <main className={`${!isLandingPage ? "pt-16" : ""} min-h-screen`}>
              {children}
            </main>
            <Toaster />
          </TwitterAuthProvider>
        </UserProvider>
      </WalletProvider>
    </SessionProvider>
  )
}
