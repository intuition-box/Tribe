import { createBrowserClient } from "@supabase/ssr"
import { getContract } from "./web3-provider"
import { parseEther, Contract } from "ethers"

// ERC20 ABI for checking token balance
const ERC20_ABI = ["function balanceOf(address account) public view returns (uint256)"]

// Minimum token holding required to vote (100,000 tokens)
const MIN_TOKEN_HOLDING = 100000

const CREATOR_VOTING_POWER = 20

// Regular voter voting power (equal for all)
const REGULAR_VOTING_POWER = 1.0

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export interface VotingProposal {
  id: string
  title: string
  description: string
  token_address: string
  creator_address: string
  status: "active" | "closed"
  yes_votes: number
  no_votes: number
  yes_voting_power: number
  no_voting_power: number
  created_at: string
  ends_at: string | null
  tx_hash: string | null
}

export interface ProposalVote {
  id: string
  proposal_id: string
  voter_address: string
  vote: "yes" | "no"
  voting_power: number
  tx_hash: string | null
  created_at: string
}

export interface WhitelistedAddress {
  id: string
  proposal_id: string
  wallet_address: string
  created_at: string
}

export interface ProposalValidityResult {
  isValid: boolean
  reasons: string[]
  totalVoters: number
  winningPercentage: number
  isTie: boolean
}

// Create a new voting proposal (admin only)
export async function createProposal(
  title: string,
  description: string,
  tokenAddress: string,
  creatorAddress: string,
): Promise<VotingProposal | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const endsAt = new Date()
  endsAt.setTime(endsAt.getTime() + 72 * 60 * 60 * 1000) // 72 hours in milliseconds

  console.log("[v0] Creating proposal with ends_at:", endsAt.toISOString())

  const { data, error } = await supabase
    .from("voting_proposals")
    .insert({
      title,
      description,
      token_address: tokenAddress.toLowerCase(),
      creator_address: creatorAddress.toLowerCase(),
      ends_at: endsAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Failed to create proposal:", error)
    return null
  }

  console.log("[v0] Created proposal:", data)
  return data
}

// Get all proposals
export async function getAllProposals(): Promise<VotingProposal[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase.from("voting_proposals").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch proposals:", error)
    return []
  }

  return data || []
}

// Get proposal by ID
export async function getProposalById(proposalId: string): Promise<VotingProposal | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase.from("voting_proposals").select("*").eq("id", proposalId).single()

  if (error) {
    console.error("Failed to fetch proposal:", error)
    return null
  }

  return data
}

// Check if user has already voted on a proposal
export async function hasUserVoted(proposalId: string, voterAddress: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const { data } = await supabase
    .from("proposal_votes")
    .select("id")
    .eq("proposal_id", proposalId)
    .eq("voter_address", voterAddress.toLowerCase())
    .single()

  return !!data
}

// Check if user holds enough tokens to vote (100k minimum)
export async function checkTokenHolding(tokenAddress: string, userAddress: string): Promise<boolean> {
  try {
    const contract = await getContract()
    const signer = await contract.runner

    const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer)
    const balance = await tokenContract.balanceOf(userAddress)

    // Convert balance to number (assuming 18 decimals)
    const balanceInTokens = Number(balance) / 1e18

    return balanceInTokens >= MIN_TOKEN_HOLDING
  } catch (error) {
    console.error("Failed to check token holding:", error)
    return false
  }
}

// Check if user is whitelisted for a proposal (20% voting power)
export async function isWhitelisted(proposalId: string, walletAddress: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const { data } = await supabase
    .from("proposal_whitelist")
    .select("id")
    .eq("proposal_id", proposalId)
    .eq("wallet_address", walletAddress.toLowerCase())
    .single()

  return !!data
}

// Add address to whitelist (admin only)
export async function addToWhitelist(proposalId: string, walletAddress: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const { error } = await supabase.from("proposal_whitelist").insert({
    proposal_id: proposalId,
    wallet_address: walletAddress.toLowerCase(),
  })

  if (error) {
    console.error("Failed to add to whitelist:", error)
    return false
  }

  return true
}

// Remove address from whitelist (admin only)
export async function removeFromWhitelist(proposalId: string, walletAddress: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const { error } = await supabase
    .from("proposal_whitelist")
    .delete()
    .eq("proposal_id", proposalId)
    .eq("wallet_address", walletAddress.toLowerCase())

  if (error) {
    console.error("Failed to remove from whitelist:", error)
    return false
  }

  return true
}

// Get whitelist for a proposal
export async function getProposalWhitelist(proposalId: string): Promise<WhitelistedAddress[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase.from("proposal_whitelist").select("*").eq("proposal_id", proposalId)

  if (error) {
    console.error("Failed to fetch whitelist:", error)
    return []
  }

  return data || []
}

// Pay voting fee (0.025 TRUST using addComment function)
export async function payVotingFee(tokenAddress: string): Promise<string | null> {
  try {
    const contract = await getContract()

    // Use the addComment function with a vote-related message
    // The contract charges 0.025 TRUST for each comment
    const voteFee = parseEther("0.025")

    const tx = await contract.addComment(tokenAddress, "VOTE_FEE_PAYMENT", {
      value: voteFee,
    })

    const receipt = await tx.wait()
    return receipt?.transactionHash || tx.hash
  } catch (error: any) {
    console.error("Failed to pay voting fee:", error)

    if (error.message?.includes("user rejected")) {
      throw new Error("Transaction rejected by user")
    } else if (error.message?.includes("insufficient funds")) {
      throw new Error("Insufficient TRUST balance to pay voting fee")
    }

    throw error
  }
}

// Cast a vote on a proposal
export async function castVote(
  proposalId: string,
  voterAddress: string,
  vote: "yes" | "no",
  tokenAddress: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { success: false, error: "Database connection failed" }
  }

  const proposal = await getProposalById(proposalId)
  if (!proposal) {
    return { success: false, error: "Proposal not found" }
  }

  if (proposal.status === "closed") {
    return { success: false, error: "This proposal has been closed" }
  }

  if (proposal.ends_at && new Date(proposal.ends_at) < new Date()) {
    return { success: false, error: "Voting period has ended (72 hours)" }
  }

  // Check if user has already voted
  const alreadyVoted = await hasUserVoted(proposalId, voterAddress)
  if (alreadyVoted) {
    return { success: false, error: "You have already voted on this proposal" }
  }

  // Check if user holds enough tokens
  const hasEnoughTokens = await checkTokenHolding(tokenAddress, voterAddress)
  if (!hasEnoughTokens) {
    return { success: false, error: "You must hold at least 100,000 tokens to vote" }
  }

  // Pay the voting fee first
  let txHash: string | null = null
  try {
    txHash = await payVotingFee(tokenAddress)
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to pay voting fee" }
  }

  // Determine voting power (whitelisted creators get 20 votes extra)
  const whitelisted = await isWhitelisted(proposalId, voterAddress)
  const votingPower = whitelisted ? CREATOR_VOTING_POWER : REGULAR_VOTING_POWER

  // Record the vote
  const { error: voteError } = await supabase.from("proposal_votes").insert({
    proposal_id: proposalId,
    voter_address: voterAddress.toLowerCase(),
    vote,
    voting_power: votingPower,
    tx_hash: txHash,
  })

  if (voteError) {
    console.error("Failed to record vote:", voteError)
    return { success: false, error: "Failed to record vote" }
  }

  // Update proposal vote counts
  const { data: currentProposal } = await supabase
    .from("voting_proposals")
    .select("yes_votes, no_votes, yes_voting_power, no_voting_power")
    .eq("id", proposalId)
    .single()

  if (currentProposal) {
    const updates =
      vote === "yes"
        ? {
            yes_votes: (currentProposal.yes_votes || 0) + 1,
            yes_voting_power: (currentProposal.yes_voting_power || 0) + votingPower,
          }
        : {
            no_votes: (currentProposal.no_votes || 0) + 1,
            no_voting_power: (currentProposal.no_voting_power || 0) + votingPower,
          }

    await supabase.from("voting_proposals").update(updates).eq("id", proposalId)
  }

  return { success: true }
}

// Close a proposal (admin only)
export async function closeProposal(proposalId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const { error } = await supabase.from("voting_proposals").update({ status: "closed" }).eq("id", proposalId)

  if (error) {
    console.error("Failed to close proposal:", error)
    return false
  }

  return true
}

// Get votes for a proposal
export async function getProposalVotes(proposalId: string): Promise<ProposalVote[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("proposal_votes")
    .select("*")
    .eq("proposal_id", proposalId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch votes:", error)
    return []
  }

  return data || []
}

// Check proposal validity
export async function checkProposalValidity(proposal: VotingProposal): Promise<ProposalValidityResult> {
  const totalVoters = proposal.yes_votes + proposal.no_votes
  const totalVotes = totalVoters

  // Calculate percentages
  let yesPercentage = 0
  let noPercentage = 0
  if (totalVotes > 0) {
    yesPercentage = (proposal.yes_votes / totalVotes) * 100
    noPercentage = (proposal.no_votes / totalVotes) * 100
  }

  const isTie = proposal.yes_votes === proposal.no_votes && totalVotes > 0
  const winningPercentage = Math.max(yesPercentage, noPercentage)

  const reasons: string[] = []

  // Condition 1: At least 100 unique voters
  if (totalVoters < 100) {
    reasons.push(`Only ${totalVoters} voters (minimum 100 required)`)
  }

  // Condition 2: No ties
  if (isTie) {
    reasons.push("Proposal ended in a tie")
  }

  // Condition 3: Winning option must have at least 59%
  if (!isTie && winningPercentage < 59) {
    reasons.push(`Winning option only has ${winningPercentage.toFixed(1)}% (minimum 59% required)`)
  }

  const isValid = totalVoters >= 100 && !isTie && winningPercentage >= 59

  return {
    isValid,
    reasons,
    totalVoters,
    winningPercentage,
    isTie,
  }
}
