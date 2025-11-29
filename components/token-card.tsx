"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, TrendingDown, ExternalLink, Copy, Star, Lock, LockOpen } from "lucide-react"
import { calculateBondingCurveProgress } from "@/lib/bonding-curve"
import QuickTradeModal from "./quick-trade-modal"
import { toggleStarToken, isTokenStarred } from "@/lib/starred-tokens"
import { useWallet } from "@/hooks/use-wallet"
import type { mockTokens } from "@/lib/mock-data"
import { isTokenUnlocked } from "@/lib/contract-functions"

interface TokenCardProps {
  token: (typeof mockTokens)[0]
  onClick: () => void
  isAlpha?: boolean
  onTradeComplete?: () => void
  onStarToggle?: () => void
}

export default function TokenCard({ token, onClick, isAlpha, onTradeComplete, onStarToggle }: TokenCardProps) {
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy")
  const [copied, setCopied] = useState(false)
  const [isStarred, setIsStarred] = useState(false)
  const [isStarring, setIsStarring] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isCheckingLock, setIsCheckingLock] = useState(true)
  const { address } = useWallet()

  useEffect(() => {
    if (address) {
      isTokenStarred(address, token.contractAddress).then(setIsStarred)
    }
  }, [address, token.contractAddress])

  useEffect(() => {
    const checkUnlockStatus = async () => {
      if (token.contractAddress && token.contractAddress !== "0x0000000000000000000000000000000000000000") {
        try {
          setIsCheckingLock(true)
          const unlocked = await isTokenUnlocked(token.contractAddress)
          setIsUnlocked(unlocked)
        } catch (error) {
          console.error("Failed to check unlock status:", error)
          setIsUnlocked(false)
        } finally {
          setIsCheckingLock(false)
        }
      } else {
        setIsCheckingLock(false)
      }
    }

    checkUnlockStatus()
  }, [token.contractAddress])

  const currentPrice = token.currentPrice ?? 0
  const startPrice = token.startPrice ?? 0

  const priceChange =
    startPrice && startPrice !== 0 ? (((currentPrice - startPrice) / startPrice) * 100).toFixed(2) : "0.00"

  const bondingCurveProgress = calculateBondingCurveProgress(token.currentSupply ?? 0)

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTradeMode("buy")
    setShowTradeModal(true)
  }

  const handleSellClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTradeMode("sell")
    setShowTradeModal(true)
  }

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(token.contractAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleIntuitionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (token.intuitionLink) {
      window.open(token.intuitionLink, "_blank", "noopener,noreferrer")
    }
  }

  const handleTradeComplete = () => {
    if (onTradeComplete) {
      onTradeComplete()
    }
  }

  const handleStarClick = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!address) {
      alert("Please connect your wallet to star tokens")
      return
    }

    setIsStarring(true)
    try {
      const newStarredState = await toggleStarToken(address, token.contractAddress)
      setIsStarred(newStarredState)
      if (onStarToggle) {
        onStarToggle()
      }
    } catch (error) {
      console.error("Failed to toggle star:", error)
      alert("Failed to star/unstar token. Please try again.")
    } finally {
      setIsStarring(false)
    }
  }

  return (
    <>
      <Card
        className={`cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg ${
          isAlpha ? "alpha-shimmer bg-card/80 border-accent/30" : "bg-card border-border"
        }`}
        onClick={onClick}
      >
        <div className="p-2 md:p-3 space-y-1.5 md:space-y-2">
          {/* Token Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5 md:gap-2 flex-1">
              <img
                src={token.image || "/placeholder.svg"}
                alt={token.name}
                className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[10px] md:text-xs text-foreground truncate">{token.name}</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground">${token.symbol}</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStarClick}
                disabled={isStarring || !address}
                className={`h-5 w-5 md:h-6 md:w-6 p-0 hover:bg-muted ${isStarred ? "text-yellow-500" : "text-muted-foreground"}`}
                title={isStarred ? "Unstar token" : "Star token"}
              >
                <Star className={`w-2.5 h-2.5 md:w-3 md:h-3 ${isStarred ? "fill-current" : ""}`} />
              </Button>
              {!isCheckingLock && (
                <div
                  className={`flex items-center justify-center h-5 w-5 md:h-6 md:w-6 rounded ${
                    isUnlocked ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}
                  title={
                    isUnlocked ? "Token unlocked - Available for trading" : "Token locked - Creator must buy 2% first"
                  }
                >
                  {isUnlocked ? (
                    <LockOpen className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  ) : (
                    <Lock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  )}
                </div>
              )}
              {isAlpha && (
                <Badge className="bg-accent text-accent-foreground text-[8px] md:text-xs px-1 py-0">Alpha</Badge>
              )}
              {token.isCompleted && (
                <Badge className="bg-orange-600 text-white text-[8px] md:text-xs whitespace-nowrap px-1 py-0">
                  Complete
                </Badge>
              )}
            </div>
          </div>

          {/* Contract Address section */}
          <div className="flex items-center gap-1.5 md:gap-2 pb-1 md:pb-1.5 border-b border-border">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] md:text-xs text-muted-foreground">Contract</p>
              <p className="text-[9px] md:text-xs font-mono text-foreground truncate">{token.contractAddress}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              className="h-5 w-5 md:h-6 md:w-6 p-0 hover:bg-muted"
              title="Copy address"
            >
              <Copy className={`w-2.5 h-2.5 md:w-3 md:h-3 ${copied ? "text-green-500" : ""}`} />
            </Button>
          </div>

          {/* Intuition Link section */}
          {token.intuitionLink && (
            <div className="flex items-center gap-1.5 md:gap-2 pb-1 md:pb-1.5 border-b border-border">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] md:text-xs text-muted-foreground">Intuition</p>
                <button
                  onClick={handleIntuitionClick}
                  className="text-[9px] md:text-xs text-primary hover:underline flex items-center gap-0.5 md:gap-1 truncate w-full"
                >
                  <span className="truncate">View on Portal</span>
                  <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* Price Info */}
          <div className="space-y-0.5 md:space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[9px] md:text-xs text-muted-foreground">Price</span>
              <span className="font-semibold text-[9px] md:text-xs text-foreground">${currentPrice.toFixed(8)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] md:text-xs text-muted-foreground">Trust Stock</span>
              <span className="font-semibold text-[9px] md:text-xs text-foreground">
                {(token.marketCap ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-0.5 md:space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[9px] md:text-xs text-muted-foreground">Bonding</span>
              <span className="font-semibold text-[9px] md:text-xs text-accent">
                {bondingCurveProgress.toFixed(1)}%
              </span>
            </div>
            <div className="bg-muted/30 rounded-full h-1 md:h-1.5" style={{ width: `${bondingCurveProgress}%` }}>
              <div className="bg-gradient-to-r from-primary to-accent h-1 md:h-1.5 rounded-full transition-all duration-300" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-1.5 md:gap-2 pt-1 md:pt-1.5 border-t border-border">
            <Button
              onClick={handleBuyClick}
              size="sm"
              disabled={token.isCompleted || !isUnlocked}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-[9px] md:text-xs h-6 md:h-8"
            >
              <ShoppingCart className="w-2.5 h-2.5 md:w-3 md:h-3" />
              Buy
            </Button>
            <Button
              onClick={handleSellClick}
              size="sm"
              disabled={token.isCompleted || !isUnlocked}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-[9px] md:text-xs h-6 md:h-8"
            >
              <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3" />
              Sell
            </Button>
          </div>

          {token.isCompleted && (
            <div className="pt-1 md:pt-1.5 border-t border-border">
              <p className="text-[8px] md:text-xs text-center text-orange-600 font-medium">
                Trading stopped - Launch completed
              </p>
            </div>
          )}
        </div>
      </Card>

      {showTradeModal && (
        <QuickTradeModal
          token={token}
          onClose={() => setShowTradeModal(false)}
          initialMode={tradeMode}
          onTradeComplete={handleTradeComplete}
        />
      )}
    </>
  )
}
