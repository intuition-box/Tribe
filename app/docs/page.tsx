"use client"

import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Footer from "@/components/footer"
import { BookOpen, Code, Rocket, Shield } from "lucide-react"

export default function DocsPage() {
  return (
    <main className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 ml-16">
        <Header onCreateClick={() => {}} />

        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center gap-3">
              <BookOpen className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Documentation</h1>
            </div>
            <p className="text-muted-foreground text-lg">Learn how to create and trade meme tokens on TRIBE</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
              <Rocket className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Getting Started</h3>
              <p className="text-muted-foreground">Connect your wallet and start creating or trading meme tokens</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
              <Code className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Smart Contracts</h3>
              <p className="text-muted-foreground">Learn about our bonding curve and tokenomics</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
              <Shield className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Security</h3>
              <p className="text-muted-foreground">Understanding safety features and best practices</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
              <BookOpen className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">API Reference</h3>
              <p className="text-muted-foreground">Technical documentation for developers</p>
            </div>
          </div>

          <div className="mt-12 bg-card border border-border rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">Quick Links</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Contract Address: 0xD9E849B6d44946B0D0FAEafe34b92C79c68cCbeF</li>
              <li>• Network: Intuition Mainnet (Chain ID: 1155)</li>
              <li>• RPC URL: https://intuition.calderachain.xyz/http</li>
              <li>• Currency: TRUST</li>
            </ul>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  )
}
