import { AssetAllocation } from "./types";

// Generate a unique ID (useful for new assets)
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Format currency values
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Format percentage values
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Calculate optimal allocation for a risk profile using Modern Portfolio Theory
export function calculateOptimalAllocation(
  riskProfile: 'conservative' | 'moderate' | 'aggressive',
  marketCondition: 'bullish' | 'bearish' | 'neutral'
): AssetAllocation {
  // Base allocations
  const baseAllocations = {
    conservative: { equity: 30, debt: 45, gold: 15, cash: 10 },
    moderate: { equity: 50, debt: 30, gold: 12, cash: 8 },
    aggressive: { equity: 70, debt: 15, gold: 10, cash: 5 }
  };
  
  // Market condition adjustments
  const marketAdjustments = {
    bullish: { equity: 10, debt: -5, gold: -3, cash: -2 },
    bearish: { equity: -15, debt: 8, gold: 5, cash: 2 },
    neutral: { equity: 0, debt: 0, gold: 0, cash: 0 }
  };
  
  // Get base allocation
  const base = baseAllocations[riskProfile];
  const adjustment = marketAdjustments[marketCondition];
  
  // Apply adjustments
  let adjusted = {
    equity: Math.max(10, Math.min(90, base.equity + adjustment.equity)),
    debt: Math.max(10, Math.min(70, base.debt + adjustment.debt)),
    gold: Math.max(0, Math.min(30, base.gold + adjustment.gold)),
    cash: Math.max(0, Math.min(30, base.cash + adjustment.cash))
  };
  
  // Normalize to ensure sum is 100%
  const total = adjusted.equity + adjusted.debt + adjusted.gold + adjusted.cash;
  const factor = 100 / total;
  
  adjusted = {
    equity: Math.round(adjusted.equity * factor),
    debt: Math.round(adjusted.debt * factor),
    gold: Math.round(adjusted.gold * factor),
    cash: Math.round(adjusted.cash * factor)
  };
  
  // Final adjustment to ensure we add up to exactly 100
  const finalTotal = adjusted.equity + adjusted.debt + adjusted.gold + adjusted.cash;
  if (finalTotal !== 100) {
    adjusted.equity += (100 - finalTotal);
  }
  
  return adjusted;
}