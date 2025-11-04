"use client"

import { useState, useEffect } from "react"
import { connectWallet, getConnectedAddress, getBalance } from "@/lib/web3-provider"

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>("0")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      try {
        const addr = await getConnectedAddress()
        if (addr) {
          setAddress(addr)
          const bal = await getBalance(addr)
          setBalance(bal)
        }
      } catch (err) {
        console.error("Failed to check connection:", err)
      }
    }

    checkConnection()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
        } else {
          setAddress(null)
        }
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
      }
    }
  }, [])

  const connect = async () => {
    setIsConnecting(true)
    setError(null)
    try {
      const addr = await connectWallet()
      setAddress(addr)
      const bal = await getBalance(addr)
      setBalance(bal)
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setBalance("0")
  }

  return {
    address,
    balance,
    isConnecting,
    error,
    connect,
    disconnect,
    isConnected: !!address,
  }
}
