// Bonding curve calculation constants
export const BONDING_CURVE_CONFIG = {
  INITIAL_PRICE: 0.0001533,
  MAX_SUPPLY: 1000000000,
  BONDING_CURVE_PERCENT: 0.7, // 70% of max supply
}

export function calculateBondingCurvePrice(currentSupply: number): number {
  const { INITIAL_PRICE, MAX_SUPPLY, BONDING_CURVE_PERCENT } = BONDING_CURVE_CONFIG

  // Ensure currentSupply doesn't exceed bonding curve limit
  const effectiveSupply = Math.min(currentSupply, MAX_SUPPLY * BONDING_CURVE_PERCENT)

  // basePrice = INITIAL_PRICE
  const basePrice = INITIAL_PRICE

  // priceIncrease = (currentSupply * basePrice) / MAX_SUPPLY
  const priceIncrease = (effectiveSupply * basePrice) / MAX_SUPPLY

  // currentPrice = basePrice + priceIncrease
  const currentPrice = basePrice + priceIncrease

  return currentPrice
}

export function calculateBondingCurveProgress(currentSupply: number): number {
  const { MAX_SUPPLY, BONDING_CURVE_PERCENT } = BONDING_CURVE_CONFIG
  const bondingCurveLimit = MAX_SUPPLY * BONDING_CURVE_PERCENT

  // Return percentage of bonding curve filled (0-100)
  return Math.min((currentSupply / bondingCurveLimit) * 100, 100)
}
