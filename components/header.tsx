"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"
import { Menu, LogOut, Wallet, Sparkles, TrendingUp, Plus, Shield, User, AlertTriangle, X } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useRouter } from "next/navigation"
import HeaderProfile from "@/components/header-profile"
import { isAdmin } from "@/lib/admin-config"
import EditProfileModal from "@/components/edit-profile-modal"

interface HeaderProps {
  onCreateClick: () => void
  onAlphaClick?: () => void
}

export default function Header({ onCreateClick, onAlphaClick }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const { address, balance, isConnecting, connect, disconnect } = useWallet()
  const router = useRouter()
  const hasAlphaAccess = Number(balance) >= 2000
  const userIsAdmin = isAdmin(address)

  const handleConnect = async () => {
    await connect()
  }

  const handleDisconnect = async () => {
    await disconnect()
    setShowMenu(false)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`
  }

  return (
    <>
      {showDisclaimer && (
        <div className="bg-yellow-500/90 text-black px-4 py-2 flex items-center justify-center gap-3 relative">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-medium text-center">Warning: This app runs on non-audited smart contracts.</p>
          <button
            onClick={() => setShowDisclaimer(false)}
            className="absolute right-4 p-1 hover:bg-yellow-600/50 rounded transition-colors"
            aria-label="Dismiss disclaimer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <header className="border-b border-border bg-black sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <div className="relative w-56 h-20 cursor-pointer" onClick={() => router.push("/")}>
              <Image src="/tribe-logo.png" alt="TRIBE Logo" fill className="object-contain" priority />
            </div>
            <div className="hidden lg:block h-10 w-px bg-border" />
            <Button
              onClick={onCreateClick}
              className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold px-6"
            >
              <Plus className="w-4 h-4" />
              Create Token
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {address && <HeaderProfile />}

            {address && hasAlphaAccess && (
              <Button
                onClick={onAlphaClick}
                className="bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 text-primary-foreground font-semibold relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                <Sparkles className="w-4 h-4 mr-2" />
                Alpha Room
              </Button>
            )}

            {!address ? (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
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
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center gap-2 px-3 py-2 rounded bg-muted/30">
                        <Wallet className="w-4 h-4 text-primary" />
                        <span className="text-sm font-mono text-foreground">{formatAddress(address)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileModal(true)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        router.push("/portfolio")
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Portfolio
                    </button>
                    {userIsAdmin && (
                      <button
                        onClick={() => {
                          router.push("/admin")
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </button>
                    )}
                    <button
                      onClick={handleDisconnect}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-muted/50 flex items-center gap-2 transition-colors border-t border-border"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {address && (
        <EditProfileModal
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
          walletAddress={address}
          onProfileUpdated={() => {
            // Optionally refresh header profile display
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
