"use client"

import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Footer from "@/components/footer"
import { HelpCircle, ChevronDown } from "lucide-react"
import { useState } from "react"

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "What is TRIBE Launchpad?",
      answer:
        "TRIBE is a revolutionary meme coin trading platform built for meme, designed to empower anyone to create, trade, and verify meme coins with unparalleled transparency and trust. Powered by Intuition Graphs' decentralized infograph technology, TRIBE introduces a Reputation Graph to eliminate duplicates and ensure authenticity, fostering a secure and scalable environment for meme coin traders across Ethereum and major Layer-2 (L2) networks.",
    },
    {
      question: "How do I create a token?",
      answer:
        "Connect your wallet, click 'Create Token', fill in the token details (name, symbol, image), with no creation fee (Free). Your token will be instantly deployed on the blockchain.",
    },
    {
      question: "What is the bonding curve?",
      answer:
        "A bonding curve is a mathematical formula that determines the token price based on supply. As more tokens are bought, the price increases automatically.",
    },
    {
      question: "How do I earn points?",
      answer:
        "You can earn points by trading tokens, creating tokens, and adding comments. Points are tracked on your profile and leaderboard.",
    },
    {
      question: "What does the lock icon mean?",
      answer:
        "A locked token means the creator hasn't bought the required 2% of total supply yet. Once unlocked, anyone can trade the token.",
    },
    {
      question: "How do comments work?",
      answer:
        "You can comment on any token by visiting its detail page. Each comment costs 0.025 TRUST and earns you 0.025 points.",
    },
  ]

  return (
    <main className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 ml-16">
        <Header onCreateClick={() => {}} />

        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center gap-3">
              <HelpCircle className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">FAQ</h1>
            </div>
            <p className="text-muted-foreground text-lg">Frequently asked questions about TRIBE Launchpad</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg font-semibold text-foreground pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6 text-muted-foreground border-t border-border pt-4">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground">Still have questions? Contact us through our community channels.</p>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  )
}
