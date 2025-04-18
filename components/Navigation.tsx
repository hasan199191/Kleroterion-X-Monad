"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, User, Activity, Shield } from "lucide-react"
import WalletConnectButton from "@/components/WalletConnectButton"
import { useWallet } from "@/context/WalletContext"

export default function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // useWallet hook'unu ekleyelim
  const { account } = useWallet()
  // navItems dizisine Admin sayfasını ekleyelim, ancak sadece owner için gösterilecek
  // navItems değişkenini güncelleyelim
  const [isOwner, setIsOwner] = useState(false)

  // OWNER_ADDRESS sabitini ekleyelim
  const OWNER_ADDRESS = "0x2e6229b4939EDc2b3E4EE4320e1EA51Ed595cdda"

  // useEffect içinde owner kontrolü yapalım
  useEffect(() => {
    // Check if connected account is owner
    if (account) {
      setIsOwner(account.toLowerCase() === OWNER_ADDRESS.toLowerCase())
    } else {
      setIsOwner(false)
    }
  }, [account])

  // navItems dizisini güncelleyelim
  const navItems = [
    { name: "Home", path: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Arena", path: "/arena", icon: <Users className="h-4 w-4 mr-2" /> },
    { name: "Profile", path: "/profile", icon: <User className="h-4 w-4 mr-2" /> },
    { name: "Activity", path: "/activity", icon: <Activity className="h-4 w-4 mr-2" /> },
    // Admin sayfasını sadece owner için göster
    ...(isOwner ? [{ name: "Admin", path: "/admin", icon: <Shield className="h-4 w-4 mr-2" /> }] : []),
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-heading font-bold text-xl mr-8 neon-text">
          Kleroterion X Monad
          </Link>

          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center text-sm ${
                  pathname === item.path ? "text-primary" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <WalletConnectButton />

          <button className="md:hidden text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-primary/20">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center text-sm ${
                    pathname === item.path ? "text-primary" : "text-foreground/60 hover:text-foreground"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
