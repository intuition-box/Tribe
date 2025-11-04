"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, ExternalLink, ShoppingCart, TrendingDown } from "lucide-react"
import { calculateBondingCurveProgress } from "@/lib/bonding-curve"
import QuickTradeModal from "./quick-trade-modal"
import type { mockTokens } from "@/lib/mock-data"

interface TokenCardProps {
  token: (typeof mockTokens)[0]
  onClick: () => void
  isAlpha?: boolean
}

export default function TokenCard({ token, onClick, isAlpha }: TokenCardProps) {
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy")

  const currentPrice = token.currentPrice ?? 0
  const startPrice = token.startPrice ?? 0

  const priceChange =
    startPrice && startPrice !== 0 ? (((currentPrice - startPrice) / startPrice) * 100).toFixed(2) : "0.00"

  const bondingCurveProgress = calculateBondingCurveProgress(token.currentSupply ?? 0) // use currentSupply instead of creatorSupplyPercent

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

  return (
    <>
      <Card
        className={`cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg ${
          isAlpha ? "alpha-shimmer bg-card/80 border-accent/30" : "bg-card border-border"
        }`}
        onClick={onClick}
      >
        <div className="p-6 space-y-4">
          {/* Token Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <img
                src={token.image || "/placeholder.svg"}
                alt={token.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate">{token.name}</h3>
                <p className="text-xs text-muted-foreground">${token.symbol}</p>
              </div>
            </div>
            {isAlpha && <Badge className="bg-accent text-accent-foreground">Alpha</Badge>}
          </div>

          {/* Price Info */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Price</span>
              <span className="font-semibold text-foreground">${currentPrice.toFixed(8)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Market Cap</span>
              <span className="font-semibold text-foreground">${((token.marketCap ?? 0) / 1000000).toFixed(2)}M</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Bonding Curve</span>
              <span className="font-semibold text-accent">{bondingCurveProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${bondingCurveProgress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Change</p>
                <p
                  className={`font-semibold text-sm ${Number.parseFloat(priceChange) >= 0 ? "text-accent" : "text-destructive"}`}
                >
                  {Number.parseFloat(priceChange) >= 0 ? "+" : ""}
                  {priceChange}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Holders</p>
                <p className="font-semibold text-sm text-foreground">{token.holders}</p>
              </div>
            </div>
          </div>

          {token.intuitionLink && (
            <div className="pt-2 border-t border-border">
              <a
                href={token.intuitionLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
              >
                View Identity
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {token.contractAddress && (
            <div className="pt-2 border-t border-border space-y-1">
              <p className="text-xs text-muted-foreground">Contract Address</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-mono text-foreground truncate">{token.contractAddress}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(token.contractAddress)
                  }}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <Button
              onClick={handleBuyClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy
            </Button>
            <Button
              onClick={handleSellClick}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center gap-2"
            >
              <TrendingDown className="w-4 h-4" />
              Sell
            </Button>
          </div>
        </div>
      </Card>

      {showTradeModal && (
        <QuickTradeModal token={token} onClose={() => setShowTradeModal(false)} initialMode={tradeMode} />
      )}
    </>
  )
}
