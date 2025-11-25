"use client"

/**
 * Check if a wallet address is authorized as an admin
 */
export function isAdmin(address: string | undefined): boolean {
  if (!address) return false

  // Get admin addresses from environment variable
  // Format: comma-separated list of addresses
  const adminAddresses =
    process.env.NEXT_PUBLIC_ADMIN_ADDRESSES?.split(",").map((addr) => addr.trim().toLowerCase()) || []

  // Check if the connected address is in the admin list
  return adminAddresses.includes(address.toLowerCase())
}

/**
 * Get list of admin addresses (for debugging)
 */
export function getAdminAddresses(): string[] {
  return process.env.NEXT_PUBLIC_ADMIN_ADDRESSES?.split(",").map((addr) => addr.trim()) || []
}
