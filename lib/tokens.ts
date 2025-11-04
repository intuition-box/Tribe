import { createClient } from "@/lib/supabase/client"

export interface MemeToken {
  id: string
  name: string
  symbol: string
  image: string
  currentPrice: number
  startPrice: number
  marketCap: number
  maxSupply: number
  currentSupply: number
  holders: number
  creator: string
  intuitionLink: string
  isAlpha: boolean
  contractAddress: string
}

interface SupabaseToken {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  start_price: number
  market_cap: number
  max_supply: number
  current_supply: number
  holders: number
  creator: string
  intuition_link: string
  is_alpha: boolean
  contract_address: string
}

// Convert database format to client format
function supabaseToToken(data: SupabaseToken): MemeToken {
  return {
    id: data.id,
    name: data.name,
    symbol: data.symbol,
    image: data.image,
    currentPrice: data.current_price,
    startPrice: data.start_price,
    marketCap: data.market_cap,
    maxSupply: data.max_supply,
    currentSupply: data.current_supply,
    holders: data.holders,
    creator: data.creator,
    intuitionLink: data.intuition_link,
    isAlpha: data.is_alpha,
    contractAddress: data.contract_address,
  }
}

// Fetch all tokens from database
export async function fetchAllTokens(): Promise<MemeToken[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("meme_tokens").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching tokens:", error)
      return []
    }

    return (data || []).map(supabaseToToken)
  } catch (error) {
    console.error("[v0] Failed to fetch tokens:", error)
    return []
  }
}

// Check if intuition link already exists
export async function checkLinkExists(link: string): Promise<boolean> {
  if (!link || link.trim() === "") return false

  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("meme_tokens").select("id").eq("intuition_link", link.trim()).limit(1)

    if (error) {
      console.error("[v0] Error checking link:", error)
      return false
    }

    return (data || []).length > 0
  } catch (error) {
    console.error("[v0] Failed to check link:", error)
    return false
  }
}

// Create new token
export async function createTokenInDatabase(token: Omit<MemeToken, "id">): Promise<MemeToken | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("meme_tokens")
      .insert([
        {
          name: token.name,
          symbol: token.symbol,
          image: token.image,
          current_price: token.currentPrice,
          start_price: token.startPrice,
          market_cap: token.marketCap,
          max_supply: token.maxSupply,
          current_supply: token.currentSupply,
          holders: token.holders,
          creator: token.creator,
          intuition_link: token.intuitionLink || null,
          is_alpha: token.isAlpha,
          contract_address: token.contractAddress,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating token:", error)
      return null
    }

    return data ? supabaseToToken(data) : null
  } catch (error) {
    console.error("[v0] Failed to create token:", error)
    return null
  }
}
