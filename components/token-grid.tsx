"use client"
import TokenCard from "@/components/token-card"
import type { mockTokens } from "@/lib/mock-data"

interface TokenGridProps {
  tokens: typeof mockTokens
  onSelectToken: (token: (typeof mockTokens)[0]) => void
  onTradeComplete?: () => void
  onStarToggle?: () => void
}

export default function TokenGrid({ tokens, onSelectToken, onTradeComplete, onStarToggle }: TokenGridProps) {
  const tribeOrientedTokens = tokens.filter((t) => t.intuitionLink && t.intuitionLink.trim() !== "")
  const allTokens = tokens.filter((t) => !t.intuitionLink || t.intuitionLink.trim() === "")

  return (
    <div className="space-y-6 md:space-y-12">
      {tribeOrientedTokens.length > 0 && (
        <section>
          <div className="mb-3 md:mb-6">
            <h2 className="text-xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">🚀 Tribe-Oriented</h2>
            <p className="text-xs md:text-base text-muted-foreground">Tokens with Intuition knowledge graph</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
            {tribeOrientedTokens.map((token) => (
              <div key={token.id} className="alpha-glow rounded-xl">
                <TokenCard
                  token={token}
                  onClick={() => onSelectToken(token)}
                  isAlpha
                  onTradeComplete={onTradeComplete}
                  onStarToggle={onStarToggle}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {allTokens.length > 0 && (
        <section>
          <div className="mb-3 md:mb-6">
            <h2 className="text-xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">All Tokens</h2>
            <p className="text-xs md:text-base text-muted-foreground">Discover new meme tokens</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
            {allTokens.map((token) => (
              <TokenCard
                key={token.id}
                token={token}
                onClick={() => onSelectToken(token)}
                onTradeComplete={onTradeComplete}
                onStarToggle={onStarToggle}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
