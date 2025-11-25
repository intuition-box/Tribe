"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createTokenInDatabase } from "@/lib/tokens"
import { useWallet } from "@/hooks/use-wallet"

export default function TestCreatePage() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const { address } = useWallet()

  const handleTestCreate = async () => {
    setLoading(true)
    setResult("Testing...")

    try {
      if (!address) {
        setResult("ERROR: No wallet connected")
        setLoading(false)
        return
      }

      const testToken = {
        name: "Test Token",
        symbol: "TEST",
        image: "/meme-token.jpg",
        currentPrice: 0.0001533,
        startPrice: 0.0001533,
        marketCap: 0,
        maxSupply: 1000000000,
        currentSupply: 0,
        holders: 1,
        creator: address,
        intuitionLink: "",
        isAlpha: true,
        contractAddress: `0xTEST${Date.now()}`,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      }

      console.log("[v0 TEST] Calling createTokenInDatabase with:", testToken)
      const savedToken = await createTokenInDatabase(testToken)

      if (savedToken) {
        setResult(`SUCCESS! Token created with ID: ${savedToken.id}`)
      } else {
        setResult("ERROR: createTokenInDatabase returned null - check console for details")
      }
    } catch (error) {
      setResult(`ERROR: ${error instanceof Error ? error.message : String(error)}`)
      console.error("[v0 TEST] Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-2xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Database Insert Test</h1>
        <p className="text-muted-foreground">
          This page directly tests the createTokenInDatabase function to diagnose why tokens aren't being saved.
        </p>

        <div className="space-y-2">
          <p className="text-sm">Wallet: {address || "Not connected"}</p>
          <Button onClick={handleTestCreate} disabled={loading || !address}>
            {loading ? "Testing..." : "Test Create Token"}
          </Button>
        </div>

        {result && (
          <div
            className={`p-4 rounded-lg ${result.startsWith("SUCCESS") ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}
          >
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>Check the browser console for detailed logs.</p>
        </div>
      </Card>
    </div>
  )
}
