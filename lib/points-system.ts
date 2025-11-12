import { createBrowserClient } from "./supabase/client"
import { getContract } from "./web3-provider"
import { formatEther } from "ethers"

// Points calculation constant (k value)
// Adjust this to scale the points (higher k = more points)
const POINTS_MULTIPLIER = 10

/**
 * Calculate points using anti-whale logarithmic formula
 * Points = k × log(1 + Trade Volume)
 *
 * This prevents whales from dominating while still rewarding higher volume
 */
export function calculatePoints(tradeVolume: number): number {
  if (tradeVolume <= 0) return 0

  // Using natural logarithm (Math.log is ln in JavaScript)
  const points = POINTS_MULTIPLIER * Math.log(1 + tradeVolume)

  return Math.max(0, points) // Ensure non-negative
}

/**
 * Fetch user's trading volume from the blockchain
 */
export async function getUserVolumeFromBlockchain(walletAddress: string): Promise<{
  buyVolume: number
  sellVolume: number
  totalVolume: number
}> {
  try {
    const contract = await getContract()
    const [buyVolumeWei, sellVolumeWei] = await contract.getUserVolume(walletAddress)

    const buyVolume = Number.parseFloat(formatEther(buyVolumeWei))
    const sellVolume = Number.parseFloat(formatEther(sellVolumeWei))
    const totalVolume = buyVolume + sellVolume

    return { buyVolume, sellVolume, totalVolume }
  } catch (error) {
    console.error("[v0] Failed to fetch user volume from blockchain:", error)
    return { buyVolume: 0, sellVolume: 0, totalVolume: 0 }
  }
}

/**
 * Update user points in the database based on their blockchain trading volume
 */
export async function updateUserPoints(walletAddress: string): Promise<{
  totalVolume: number
  points: number
} | null> {
  try {
    const supabase = createBrowserClient()

    // Fetch volume from blockchain
    const { buyVolume, sellVolume, totalVolume } = await getUserVolumeFromBlockchain(walletAddress)

    // Calculate points using anti-whale formula
    const points = calculatePoints(totalVolume)

    console.log("[v0] Updating points for", walletAddress, {
      buyVolume,
      sellVolume,
      totalVolume,
      points,
    })

    // Upsert user points in database
    const { data, error } = await supabase
      .from("user_points")
      .upsert(
        {
          wallet_address: walletAddress.toLowerCase(),
          total_buy_volume: buyVolume,
          total_sell_volume: sellVolume,
          total_volume: totalVolume,
          points: points,
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: "wallet_address",
        },
      )
      .select()
      .single()

    if (error) {
      // If table doesn't exist, still return the calculated values
      if (error.message?.includes("Could not find the table")) {
        console.warn(
          "[v0] user_points table not found. Please run the migration script: scripts/007_create_user_points_table.sql",
        )
        return { totalVolume, points }
      }
      console.error("[v0] Failed to update user points in database:", error)
      return null
    }

    return { totalVolume, points }
  } catch (error) {
    console.error("[v0] Error updating user points:", error)
    return null
  }
}

/**
 * Get user points from database
 */
export async function getUserPoints(walletAddress: string): Promise<{
  totalVolume: number
  points: number
  buyVolume: number
  sellVolume: number
  lastUpdated: string
} | null> {
  try {
    const supabase = createBrowserClient()

    const { data, error } = await supabase
      .from("user_points")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single()

    if (error) {
      // If table doesn't exist, fetch directly from blockchain
      if (error.message?.includes("Could not find the table")) {
        console.warn("[v0] user_points table not found. Fetching directly from blockchain...")
        const { buyVolume, sellVolume, totalVolume } = await getUserVolumeFromBlockchain(walletAddress)
        const points = calculatePoints(totalVolume)

        return {
          totalVolume,
          points,
          buyVolume,
          sellVolume,
          lastUpdated: new Date().toISOString(),
        }
      }

      // No record exists, fetch from blockchain and try to create it
      if (error.code === "PGRST116") {
        console.log("[v0] No points record found for user, fetching from blockchain...")
        const result = await updateUserPoints(walletAddress)
        if (!result) return null

        // Fetch volumes again for complete data
        const { buyVolume, sellVolume } = await getUserVolumeFromBlockchain(walletAddress)
        return {
          totalVolume: result.totalVolume,
          points: result.points,
          buyVolume,
          sellVolume,
          lastUpdated: new Date().toISOString(),
        }
      }

      console.error("[v0] Error fetching user points:", error)
      return null
    }

    if (!data) {
      console.log("[v0] No points record found for user, fetching from blockchain...")
      const result = await updateUserPoints(walletAddress)
      if (!result) return null

      const { buyVolume, sellVolume } = await getUserVolumeFromBlockchain(walletAddress)
      return {
        totalVolume: result.totalVolume,
        points: result.points,
        buyVolume,
        sellVolume,
        lastUpdated: new Date().toISOString(),
      }
    }

    return {
      totalVolume: Number(data.total_volume),
      points: Number(data.points),
      buyVolume: Number(data.total_buy_volume),
      sellVolume: Number(data.total_sell_volume),
      lastUpdated: data.last_updated,
    }
  } catch (error) {
    console.error("[v0] Error fetching user points:", error)
    return null
  }
}

/**
 * Get leaderboard (top users by points)
 */
export async function getPointsLeaderboard(limit = 100): Promise<
  Array<{
    walletAddress: string
    points: number
    totalVolume: number
  }>
> {
  try {
    const supabase = createBrowserClient()

    const { data, error } = await supabase
      .from("user_points")
      .select("wallet_address, points, total_volume")
      .order("points", { ascending: false })
      .limit(limit)

    if (error || !data) {
      console.error("[v0] Failed to fetch leaderboard:", error)
      return []
    }

    return data.map((row) => ({
      walletAddress: row.wallet_address,
      points: Number(row.points),
      totalVolume: Number(row.total_volume),
    }))
  } catch (error) {
    console.error("[v0] Error fetching leaderboard:", error)
    return []
  }
}
