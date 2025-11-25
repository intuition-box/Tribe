import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getTopTradersFromDB, getTopUsersByPoints } from "@/lib/leaderboard"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    console.log("[v0] Starting leaderboard refresh...")

    const [topTraders, mostActive] = await Promise.all([getTopTradersFromDB(25), getTopUsersByPoints(25)])

    console.log("[v0] Fetched data:", {
      tradersCount: topTraders.length,
      activeCount: mostActive.length,
    })

    const supabase = await createClient()
    if (!supabase) {
      throw new Error("Failed to create Supabase client")
    }

    // Update or insert top traders cache
    const { error: tradersError } = await supabase.from("leaderboard_cache").upsert(
      {
        cache_type: "top_traders",
        data: topTraders,
        last_updated: new Date().toISOString(),
      },
      {
        onConflict: "cache_type",
      },
    )

    if (tradersError) {
      console.error("[v0] Error caching top traders:", tradersError.message)
      throw tradersError
    }

    // Update or insert most active cache
    const { error: activeError } = await supabase.from("leaderboard_cache").upsert(
      {
        cache_type: "most_active",
        data: mostActive,
        last_updated: new Date().toISOString(),
      },
      {
        onConflict: "cache_type",
      },
    )

    if (activeError) {
      console.error("[v0] Error caching most active:", activeError.message)
      throw activeError
    }

    console.log("[v0] Leaderboard cache updated successfully")

    return NextResponse.json({
      success: true,
      message: "Leaderboard refreshed successfully",
      timestamp: new Date().toISOString(),
      data: {
        topTraders: topTraders.length,
        mostActive: mostActive.length,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error refreshing leaderboard:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to refresh leaderboard" },
      { status: 500 },
    )
  }
}

// Auto-refresh on GET (for cron jobs)
export async function GET() {
  return POST(new Request("http://localhost"))
}
