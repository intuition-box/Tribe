"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useContract } from "@/hooks/use-contract"
import { useWallet } from "@/hooks/use-wallet"
import type { mockTokens } from "@/lib/mock-data"

interface TradePanelProps {
  token: (typeof mockTokens)[0]
}

export default function TradePanel({ token }: TradePanelProps) {
  const [mode, setMode] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState("")
  const [trustAmount, setTrustAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { buyTokens, sellTokens } = useContract()
  const { address } = useWallet()

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (value) {
      const currentPrice = token.currentPrice || 0.0001533
      const trust = Number.parseFloat(value) * currentPrice
      setTrustAmount(trust.toFixed(6))
    } else {
      setTrustAmount("")
    }
  }

  const handleTrustChange = (value: string) => {
    setTrustAmount(value)
    if (value) {
      const currentPrice = token.currentPrice || 0.0001533
      const tokens = Number.parseFloat(value) / currentPrice
      setAmount(tokens.toFixed(6))
    } else {
      setAmount("")
    }
  }

  const handleTrade = async () => {
    if (!address) {
      setError("Please connect your wallet first")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!token.id || token.id === "") {
      setError("Invalid token contract address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      if (mode === "buy") {
        const minTokensOut = (Number.parseFloat(amount) * 0.995).toFixed(6) // 0.5% slippage
        console.log(
          "[v0] Buying tokens - tokenAddress:",
          token.id,
          "trustAmount:",
          trustAmount,
          "minTokensOut:",
          minTokensOut,
        )
        await buyTokens(token.id, trustAmount, minTokensOut)
      } else {
        console.log("[v0] Selling tokens - tokenAddress:", token.id, "tokenAmount:", amount)
        await sellTokens(token.id, amount)
      }

      // Reset form on success
      setAmount("")
      setTrustAmount("")
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} tokens`)
      console.error(`[v0] ${mode} error:`, err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border p-6 sticky top-24">
      <h2 className="text-xl font-bold text-foreground mb-4">Trade</h2>

      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-2 mb-6 bg-muted/30 p-1 rounded-lg">
        <Button
          onClick={() => setMode("buy")}
          variant={mode === "buy" ? "default" : "ghost"}
          className={mode === "buy" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
          disabled={isLoading}
        >
          Buy
        </Button>
        <Button
          onClick={() => setMode("sell")}
          variant={mode === "sell" ? "default" : "ghost"}
          className={mode === "sell" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground"}
          disabled={isLoading}
        >
          Sell
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 mb-4">{error}</div>
      )}

      {/* Input Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Amount ({token.symbol})</label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="bg-input border-border text-foreground"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Cost (TTRUST)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={trustAmount}
            onChange={(e) => handleTrustChange(e.target.value)}
            className="bg-input border-border text-foreground"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Price Info */}
      <div className="space-y-2 mb-6 p-4 bg-muted/20 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Price per token</span>
          <span className="text-foreground font-semibold">${(token.currentPrice || 0.0001533).toFixed(8)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Slippage</span>
          <span className="text-foreground font-semibold">0.5%</span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={handleTrade}
        disabled={isLoading || !address}
        className={`w-full font-semibold py-6 text-lg disabled:opacity-50 ${
          mode === "buy"
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {mode === "buy" ? "Buying..." : "Selling..."}
          </>
        ) : (
          `${mode === "buy" ? "Buy " : "Sell "} ${token.symbol}`
        )}
      </Button>

      {/* Info */}
      <p className="text-xs text-muted-foreground mt-4 text-center">
        {!address
          ? "Connect wallet to trade"
          : mode === "buy"
            ? "Price increases as you buy"
            : "Price decreases as you sell"}
      </p>
    </Card>
  )
}
