"use client"

import { useState, useEffect } from "react"
import { connectWallet, getConnectedAddress, getBalance, disconnectWallet } from "@/lib/web3-provider"

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>("0")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.log("[v0] useWallet: Running on server, skipping wallet check")
      return
    }

    // Check if already connected
    const checkConnection = async () => {
      try {
        console.log("[v0] useWallet: Checking wallet connection...")
        
        if (typeof localStorage === 'undefined') {
          return
        }
        
        const wasConnected = localStorage.getItem('walletConnected')
        console.log("[v0] useWallet: localStorage walletConnected =", wasConnected)
        
        if (!wasConnected) {
          console.log("[v0] useWallet: No previous connection found")
          return
        }
        
        const addr = await getConnectedAddress()
        console.log("[v0] useWallet: Retrieved address from wallet =", addr)
        
        if (addr) {
          setAddress(addr)
          console.log("[v0] useWallet: Address set in state =", addr)
          const bal = await getBalance(addr)
          setBalance(bal)
          console.log("[v0] useWallet: Balance retrieved =", bal)
        } else {
          console.log("[v0] useWallet: No address found, clearing localStorage")
          localStorage.removeItem('walletConnected')
        }
      } catch (err) {
        console.error("[v0] useWallet: Failed to check connection:", err)
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('walletConnected')
          }
        } catch (e) {
          // Ignore localStorage errors on server
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("[v0] useWallet: Accounts changed event =", accounts)
        if (accounts.length > 0) {
          setAddress(accounts[0])
          getBalance(accounts[0]).then(setBalance)
        } else {
          setAddress(null)
          setBalance("0")
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('walletConnected')
          }
        }
      }
      
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  const connect = async () => {
    if (isConnecting) {
      console.log("[v0] useWallet: Already connecting, ignoring duplicate request")
      return
    }

    setIsConnecting(true)
    setError(null)
    console.log("[v0] useWallet: Starting wallet connection...")
    
    try {
      const addr = await connectWallet()
      console.log("[v0] useWallet: Connection successful, address =", addr)
      
      setAddress(addr)
      const bal = await getBalance(addr)
      setBalance(bal)
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('walletConnected', 'true')
        console.log("[v0] useWallet: Saved connection to localStorage")
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to connect wallet"
      setError(errorMessage)
      console.error("[v0] useWallet: Connection error:", err)
      
      if (errorMessage.includes("No Web3 wallet detected")) {
        alert("Please install MetaMask or another Web3 wallet to connect.")
      } else if (errorMessage.includes("cancelled by user")) {
        // User cancelled, no need to alert
      } else if (!errorMessage.includes("already pending")) {
        // Show error for other cases except pending requests
        alert(errorMessage)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    console.log("[v0] useWallet: Disconnecting wallet...")
    try {
      await disconnectWallet()
      setAddress(null)
      setBalance("0")
      setError(null)
      console.log("[v0] useWallet: Wallet disconnected successfully")
    } catch (err) {
      console.error("[v0] useWallet: Failed to disconnect:", err)
    }
  }

  // Log the current state for debugging
  useEffect(() => {
    console.log("[v0] useWallet: Current state - address =", address, "isConnected =", !!address)
  }, [address])

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
