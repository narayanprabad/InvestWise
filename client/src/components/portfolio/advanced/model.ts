import { generateId, calculateOptimalAllocation } from "./utils";
import { PortfolioModel, AssetAllocation, PortfolioAction } from "./types";

// Default allocations based on risk profile
const DEFAULT_ALLOCATIONS: Record<PortfolioModel['riskProfile'], AssetAllocation> = {
  conservative: { equity: 30, debt: 45, gold: 15, cash: 10 },
  moderate: { equity: 50, debt: 30, gold: 12, cash: 8 },
  aggressive: { equity: 70, debt: 15, gold: 10, cash: 5 }
};

// Create a new portfolio model
export function createPortfolioModel(
  userId: number,
  riskProfile: PortfolioModel['riskProfile'] = 'moderate',
  options?: {
    baseAllocation?: AssetAllocation;
    currentAllocation?: AssetAllocation;
    assets?: PortfolioModel['assets'];
  }
): PortfolioModel {
  const baseAllocation = options?.baseAllocation || { ...DEFAULT_ALLOCATIONS[riskProfile] };
  const currentAllocation = options?.currentAllocation || { ...baseAllocation };
  
  return {
    userId,
    riskProfile,
    baseAllocation,
    currentAllocation,
    assets: options?.assets || [
      {
        id: generateId(),
        name: 'Core Equity ETF',
        type: 'equity',
        allocation: baseAllocation.equity,
        expectedReturn: 10,
        risk: 'medium'
      },
      {
        id: generateId(),
        name: 'Fixed Income Fund',
        type: 'debt',
        allocation: baseAllocation.debt,
        expectedReturn: 5,
        risk: 'low'
      },
      {
        id: generateId(),
        name: 'Gold ETF',
        type: 'gold',
        allocation: baseAllocation.gold,
        expectedReturn: 6,
        risk: 'medium'
      },
      {
        id: generateId(),
        name: 'Money Market Fund',
        type: 'cash',
        allocation: baseAllocation.cash,
        expectedReturn: 3,
        risk: 'low'
      }
    ]
  };
}

// Portfolio model operations (pure functions)
export const portfolioModelOperations = {
  // Optimize portfolio based on market condition
  optimizePortfolio(model: PortfolioModel, marketCondition: 'bullish' | 'bearish' | 'neutral'): PortfolioModel {
    const optimizedAllocation = calculateOptimalAllocation(model.riskProfile, marketCondition);
    
    // Update base allocation
    const newBaseAllocation = { ...optimizedAllocation };
    
    // Update assets to match new allocation
    const newAssets = model.assets.map(asset => {
      if (asset.type === 'equity') {
        return { ...asset, allocation: newBaseAllocation.equity };
      } else if (asset.type === 'debt') {
        return { ...asset, allocation: newBaseAllocation.debt };
      } else if (asset.type === 'gold') {
        return { ...asset, allocation: newBaseAllocation.gold };
      } else if (asset.type === 'cash') {
        return { ...asset, allocation: newBaseAllocation.cash };
      }
      return asset;
    });
    
    return {
      ...model,
      baseAllocation: newBaseAllocation,
      currentAllocation: { ...newBaseAllocation },
      assets: newAssets
    };
  },
  
  // Rebalance portfolio to match target allocation
  rebalancePortfolio(model: PortfolioModel, targetAllocation: AssetAllocation): PortfolioModel {
    // Update current allocation
    const newCurrentAllocation = { ...targetAllocation };
    
    // Update assets to match new allocation
    const newAssets = model.assets.map(asset => {
      if (asset.type === 'equity') {
        return { ...asset, allocation: newCurrentAllocation.equity };
      } else if (asset.type === 'debt') {
        return { ...asset, allocation: newCurrentAllocation.debt };
      } else if (asset.type === 'gold') {
        return { ...asset, allocation: newCurrentAllocation.gold };
      } else if (asset.type === 'cash') {
        return { ...asset, allocation: newCurrentAllocation.cash };
      }
      return asset;
    });
    
    return {
      ...model,
      currentAllocation: newCurrentAllocation,
      assets: newAssets
    };
  },
  
  // Add a new asset to the portfolio
  addAsset(model: PortfolioModel, asset: PortfolioModel['assets'][0]): PortfolioModel {
    return {
      ...model,
      assets: [...model.assets, asset]
    };
  },
  
  // Remove an asset from the portfolio
  removeAsset(model: PortfolioModel, assetId: string): PortfolioModel {
    return {
      ...model,
      assets: model.assets.filter(asset => asset.id !== assetId)
    };
  },
  
  // Update allocation of a specific asset
  updateAssetAllocation(model: PortfolioModel, assetId: string, allocation: number): PortfolioModel {
    const newAssets = model.assets.map(asset => {
      if (asset.id === assetId) {
        return { ...asset, allocation };
      }
      return asset;
    });
    
    // Recalculate current allocation
    const newCurrentAllocation = newAssets.reduce(
      (acc, asset) => {
        if (asset.type === 'equity') {
          acc.equity = asset.allocation;
        } else if (asset.type === 'debt') {
          acc.debt = asset.allocation;
        } else if (asset.type === 'gold') {
          acc.gold = asset.allocation;
        } else if (asset.type === 'cash') {
          acc.cash = asset.allocation;
        }
        return acc;
      },
      { equity: 0, debt: 0, gold: 0, cash: 0 }
    );
    
    return {
      ...model,
      currentAllocation: newCurrentAllocation,
      assets: newAssets
    };
  },
  
  // Change risk profile
  changeRiskProfile(model: PortfolioModel, riskProfile: PortfolioModel['riskProfile']): PortfolioModel {
    const newBaseAllocation = { ...DEFAULT_ALLOCATIONS[riskProfile] };
    
    // Update assets to match new allocation
    const newAssets = model.assets.map(asset => {
      if (asset.type === 'equity') {
        return { ...asset, allocation: newBaseAllocation.equity };
      } else if (asset.type === 'debt') {
        return { ...asset, allocation: newBaseAllocation.debt };
      } else if (asset.type === 'gold') {
        return { ...asset, allocation: newBaseAllocation.gold };
      } else if (asset.type === 'cash') {
        return { ...asset, allocation: newBaseAllocation.cash };
      }
      return asset;
    });
    
    return {
      ...model,
      riskProfile,
      baseAllocation: newBaseAllocation,
      currentAllocation: { ...newBaseAllocation },
      assets: newAssets
    };
  }
};