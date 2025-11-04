"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"
import { Menu, LogOut, Settings, Wallet, Sparkles } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

interface HeaderProps {
  onCreateClick: () => void
  onAlphaClick?: () => void
}

export default function Header({ onCreateClick, onAlphaClick }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const { address, balance, isConnecting, connect, disconnect } = useWallet()
  const hasAlphaAccess = Number(balance) >= 2000

  const handleConnect = async () => {
    await connect()
    setShowMenu(false)
  }

  const handleDisconnect = async () => {
    await disconnect()
    setShowMenu(false)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative w-56 h-20">
            <Image src="/tribe-logo.png" alt="TRIBE Logo" fill className="object-contain" priority />
          </div>
          <div className="hidden lg:block h-10 w-px bg-border" />
          <p className="hidden lg:block text-sm text-muted-foreground font-medium">Bonding Curve Launchpad</p>
        </div>

        <div className="flex items-center gap-4">
          {address && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30">
              <span className="text-sm text-muted-foreground">Balance:</span>
              <span className="font-semibold text-foreground">{Number(balance).toFixed(2)} TTRUST</span>
            </div>
          )}

          {hasAlphaAccess && (
            <Button
              onClick={onAlphaClick}
              className="bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 text-primary-foreground font-semibold relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              <Sparkles className="w-4 h-4 mr-2" />
              Alpha Room
            </Button>
          )}

          <Button onClick={onCreateClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Create Token
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              className="border-border hover:bg-muted/50"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                {address ? (
                  <>
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center gap-2 px-3 py-2 rounded bg-muted/30">
                        <Wallet className="w-4 h-4 text-primary" />
                        <span className="text-sm font-mono text-foreground">{formatAddress(address)}</span>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors">
                      <Wallet className="w-4 h-4" />
                      Portfolio
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-muted/50 flex items-center gap-2 transition-colors border-t border-border"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors font-semibold"
                  >
                    <Wallet className="w-4 h-4" />
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
