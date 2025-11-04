import { getContract } from "./web3-provider"
import { parseEther, formatEther, Contract } from "ethers"

// ERC20 ABI for token approval
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
]

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

    const contract = await getContract()
    console.log("[v0] buyTokens - Calling contract with:", { tokenAddress, trustAmount, minTokensOut })

    const minTokensOutWei = minTokensOut && minTokensOut !== "0" ? parseEther(minTokensOut) : "0"

    const tx = await contract.buyTokens(tokenAddress, minTokensOutWei, {
      value: parseEther(trustAmount),
    })
    console.log("[v0] buyTokens - Transaction sent:", tx.hash)

    const receipt = await tx.wait()
    console.log("[v0] buyTokens - Transaction confirmed:", receipt?.transactionHash)
    return receipt
  } catch (error) {
    console.error("Failed to buy tokens:", error)
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
    return {
      name: info.name,
      symbol: info.symbol,
      metadata: info.metadata,
      creator: info.creator,
      creatorAllocation: formatEther(info.creatorAllocation),
      heldTokens: formatEther(info.heldTokens),
      maxSupply: formatEther(info.maxSupply),
      currentSupply: formatEther(info.currentSupply),
      virtualTrust: formatEther(info.virtualTrust),
      virtualTokens: formatEther(info.virtualTokens),
      completed: info.completed,
      creationTime: Number(info.creationTime),
    }
  } catch (error) {
    console.error("Failed to get token info:", error)
    throw error
  }
}

export async function getCurrentPrice(tokenAddress: string) {
  try {
    const contract = await getContract()
    const price = await contract.getCurrentPrice(tokenAddress)
    return formatEther(price)
  } catch (error) {
    console.error("Failed to get current price:", error)
    throw error
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
