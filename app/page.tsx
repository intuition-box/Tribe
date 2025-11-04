"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import CreateTokenModal from "@/components/create-token-modal"
import TokenGrid from "@/components/token-grid"
import BondingCurveView from "@/components/bonding-curve-view"
import type { mockTokens } from "@/lib/mock-data"

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedToken, setSelectedToken] = useState<(typeof mockTokens)[0] | null>(null)
  const [tokens, setTokens] = useState([])
  const [showAlphaRoom, setShowAlphaRoom] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedTokens = localStorage.getItem("memeTokens")
    if (savedTokens) {
      try {
        setTokens(JSON.parse(savedTokens))
      } catch (error) {
        console.error("Failed to parse saved tokens:", error)
        setTokens([])
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("memeTokens", JSON.stringify(tokens))
    }
  }, [tokens, isLoaded])

  const handleCreateToken = (newToken: (typeof mockTokens)[0]) => {
    setTokens([newToken, ...tokens])
    setShowCreateModal(false)
  }

  if (showAlphaRoom) {
    return (
      <main className="min-h-screen bg-background">
        <Header onCreateClick={() => setShowCreateModal(true)} onAlphaClick={() => setShowAlphaRoom(false)} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 blur-3xl animate-pulse" />
              <h1 className="text-5xl font-bold text-foreground relative">✨ Alpha Room</h1>
            </div>
            <p className="text-xl text-muted-foreground">Private room for TRUST Card holders</p>
            <p className="text-muted-foreground">Exclusive access to premium tokens and early opportunities</p>
            <button
              onClick={() => setShowAlphaRoom(false)}
              className="mt-8 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
            >
              Back to Launchpad
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header onCreateClick={() => setShowCreateModal(true)} onAlphaClick={() => setShowAlphaRoom(true)} />

      {selectedToken ? (
        <BondingCurveView token={selectedToken} onBack={() => setSelectedToken(null)} />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <TokenGrid tokens={tokens} onSelectToken={setSelectedToken} />
        </div>
      )}

      {showCreateModal && (
        <CreateTokenModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateToken}
          existingTokens={tokens}
        />
      )}
    </main>
  )
}
