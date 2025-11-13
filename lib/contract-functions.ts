import { getContract } from "./web3-provider"
import { parseEther, formatEther, Contract, toBigInt } from "ethers"

// ERC20 ABI for token approval
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
]

function formatAddress(address: string): string {
  // If it's already a valid address format, return it
  if (address.startsWith("0x") && address.length === 42) {
    return address
  }
  // If it looks like a UUID or other format, throw an error
  throw new Error(`Invalid address format: ${address}`)
}

// Helper function to wait for blockchain state updates
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function createToken(name: string, symbol: string, metadata: string) {
  try {
    const contract = await getContract()
    const tx = await contract.createToken(name, symbol, metadata)
    const receipt = await tx.wait()

    // Extract token address from event
    const event = receipt?.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log)
        } catch {
          return null
        }
      })
      .find((e: any) => e?.name === "TokenCreated")

    return event?.args?.tokenAddress
  } catch (error) {
    console.error("Failed to create token:", error)
    throw error
  }
}

export async function buyTokens(tokenAddress: string, trustAmount: string, minTokensOut = "0") {
  try {
    if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("Invalid token address provided to buyTokens")
    }

    if (!tokenAddress.startsWith("0x")) {
      throw new Error(`Invalid token address format. Expected 0x-prefixed address, got: ${tokenAddress}`)
    }

    // Validate amounts
    const trustAmountNum = Number.parseFloat(trustAmount)
    if (isNaN(trustAmountNum) || trustAmountNum <= 0) {
      throw new Error(`Invalid TRUST amount: ${trustAmount}`)
    }

    const contract = await getContract()
    console.log("[v0] buyTokens - Validating token exists...")

    // Check if token exists by calling getTokenInfo first
    const tokenInfo = await contract.getTokenInfo(tokenAddress)
    if (!tokenInfo || !tokenInfo.creator || tokenInfo.creator === "0x0000000000000000000000000000000000000000") {
      throw new Error("Token does not exist or has not been created yet")
    }

    if (tokenInfo.completed) {
      throw new Error("Token launch has been completed. Trading is disabled.")
    }

    console.log("[v0] buyTokens - Token validated, preparing transaction...")
    console.log("[v0] buyTokens - Parameters:", {
      tokenAddress,
      trustAmount: `${trustAmount} TRUST`,
      trustAmountWei: parseEther(trustAmount).toString(),
      minTokensOut,
    })

    // Parse minTokensOut more carefully - if it's "0" or empty, use 0
    let minTokensOutWei
    if (!minTokensOut || minTokensOut === "0" || Number.parseFloat(minTokensOut) === 0) {
      minTokensOutWei = toBigInt(0)
      console.log("[v0] buyTokens - No minimum tokens requirement (slippage protection disabled)")
    } else {
      minTokensOutWei = parseEther(minTokensOut)
      console.log("[v0] buyTokens - Minimum tokens out:", minTokensOut, "tokens")
    }

    // Estimate gas first to catch errors before sending transaction
    try {
      console.log("[v0] buyTokens - Estimating gas...")
      const gasEstimate = await contract.buyTokens.estimateGas(tokenAddress, minTokensOutWei, {
        value: parseEther(trustAmount),
      })
      console.log("[v0] buyTokens - Gas estimate:", gasEstimate.toString())
    } catch (gasError: any) {
      console.error("[v0] buyTokens - Gas estimation failed:", gasError)

      // Provide more helpful error messages based on common failures
      if (gasError.message?.includes("insufficient funds")) {
        throw new Error("Insufficient TRUST balance to complete this purchase")
      } else if (gasError.message?.includes("execution reverted")) {
        throw new Error(
          "Transaction would fail. Possible reasons: insufficient TRUST, invalid slippage settings, or token launch completed",
        )
      }
      throw new Error(`Transaction validation failed: ${gasError.message || "Unknown error"}`)
    }

    const tx = await contract.buyTokens(tokenAddress, minTokensOutWei, {
      value: parseEther(trustAmount),
    })
    console.log("[v0] buyTokens - Transaction sent:", tx.hash)

    const receipt = await tx.wait()
    console.log("[v0] buyTokens - Transaction confirmed:", receipt?.transactionHash)
    return receipt
  } catch (error: any) {
    console.error("[v0] Failed to buy tokens:", error)

    // Improve error messages for common issues
    if (error.message?.includes("user rejected")) {
      throw new Error("Transaction rejected by user")
    } else if (error.message?.includes("insufficient funds")) {
      throw new Error("Insufficient TRUST balance in your wallet")
    } else if (error.message?.includes("execution reverted")) {
      throw new Error("Transaction failed. Please check: token exists, launch not completed, and you have enough TRUST")
    }

    throw error
  }
}

export async function sellTokens(tokenAddress: string, tokenAmount: string) {
  try {
    const contract = await getContract()
    const signer = await contract.runner

    // Get the token contract instance
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer)

    // Check current allowance
    const currentAllowance = await tokenContract.allowance(signer?.address, contract.target)
    const amountToSell = parseEther(tokenAmount)

    // If allowance is insufficient, approve the contract
    if (currentAllowance < amountToSell) {
      console.log("[v0] Approving token contract for selling...")
      const approveTx = await tokenContract.approve(contract.target, amountToSell)
      await approveTx.wait()
      console.log("[v0] Approval successful")
    }

    // Now sell the tokens
    const tx = await contract.sellTokens(tokenAddress, amountToSell)
    const receipt = await tx.wait()
    return receipt
  } catch (error) {
    console.error("Failed to sell tokens:", error)
    throw error
  }
}

export async function getTokenInfo(tokenAddress: string) {
  try {
    const contract = await getContract()
    const info = await contract.getTokenInfo(tokenAddress)

    if (!info || !info.currentSupply || info.currentSupply === null || info.currentSupply === 0n) {
      console.log("[v0] Token info returned null or zero values")
      return null
    }

    return {
      name: info.name,
      symbol: info.symbol,
      metadata: info.metadata,
      creator: info.creator,
      creatorAllocation: formatEther(info.creatorAllocation || 0),
      heldTokens: formatEther(info.heldTokens || 0),
      maxSupply: formatEther(info.maxSupply || 0),
      currentSupply: formatEther(info.currentSupply || 0),
      virtualTrust: formatEther(info.virtualTrust || 0),
      virtualTokens: formatEther(info.virtualTokens || 0),
      completed: info.completed || false,
      creationTime: Number(info.creationTime || 0),
    }
  } catch (error) {
    console.error("[v0] Failed to get token info:", error)
    return null
  }
}

export async function getTokenInfoWithRetry(
  tokenAddress: string,
  maxRetries = 3,
  delayMs = 1500,
): Promise<ReturnType<typeof getTokenInfo>> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Wait a bit before fetching (give blockchain time to update)
      if (attempt > 0) {
        console.log(`[v0] Waiting ${delayMs}ms before retry...`)
        await delay(delayMs)
      }

      const info = await getTokenInfo(tokenAddress)
      if (info === null) {
        throw new Error("Token info not available yet")
      }
      console.log("[v0] Token info fetched successfully")
      return info
    } catch (error) {
      console.log(`[v0] Token info fetch attempt ${attempt + 1} failed`)
      lastError = error as Error
    }
  }

  console.log("[v0] All retry attempts failed, token data will not be updated")
  return null
}

export async function getCurrentPrice(tokenAddress: string) {
  try {
    const contract = await getContract()
    const price = await contract.getCurrentPrice(tokenAddress)

    if (!price || price === null) {
      console.log("[v0] Price not yet available")
      return null
    }

    return formatEther(price)
  } catch (error) {
    console.error("[v0] Failed to get current price:", error)
    return null
  }
}

export async function getAllTokens() {
  try {
    const contract = await getContract()
    return await contract.getAllTokens()
  } catch (error) {
    console.error("Failed to get all tokens:", error)
    throw error
  }
}

export async function getUserTokenBalance(tokenAddress: string, userAddress: string) {
  try {
    const contract = await getContract()
    const signer = await contract.runner

    // Get the token contract instance
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer)

    // Get the user's balance
    const balance = await tokenContract.balanceOf(userAddress)
    return formatEther(balance)
  } catch (error) {
    console.error("Failed to get user token balance:", error)
    return "0"
  }
}

export async function calculateMarketCap(tokenAddress: string): Promise<number> {
  try {
    const info = await getTokenInfo(tokenAddress)
    if (!info) {
      return 0
    }

    const price = await getCurrentPrice(tokenAddress)
    if (!price) {
      return 0
    }

    // Market cap = current supply * current price
    const currentSupply = Number.parseFloat(info.currentSupply)
    const currentPrice = Number.parseFloat(price)

    return currentSupply * currentPrice
  } catch (error) {
    console.error("Failed to calculate market cap:", error)
    return 0
  }
}
