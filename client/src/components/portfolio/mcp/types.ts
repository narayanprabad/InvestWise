// MCP Types for Portfolio Management

// Asset allocation percentages
export interface AssetAllocation {
  equity: number;
  debt: number; 
  gold: number;
  cash: number;
}

// Portfolio model state
export interface PortfolioModel {
  userId: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  baseAllocation: AssetAllocation;
  currentAllocation: AssetAllocation;
  assets: Array<{
    id: string;
    name: string;
    type: 'equity' | 'debt' | 'gold' | 'cash';
    allocation: number;
    expectedReturn: number;
    risk: 'low' | 'medium' | 'high';
  }>;
}

// Portfolio context
export interface PortfolioContext {
  marketCondition: 'bullish' | 'bearish' | 'neutral';
  userAge: number | null;
  userGoals: Array<{
    type: string;
    timeframe: number;
  }> | null;
}

// Portfolio actions
export type PortfolioAction = 
  | { type: 'OPTIMIZE_PORTFOLIO'; payload: { marketCondition: 'bullish' | 'bearish' | 'neutral' } }
  | { type: 'REBALANCE_PORTFOLIO'; payload: { targetAllocation: AssetAllocation } }
  | { type: 'ADD_ASSET'; payload: { asset: PortfolioModel['assets'][0] } }
  | { type: 'REMOVE_ASSET'; payload: { assetId: string } }
  | { type: 'UPDATE_ASSET_ALLOCATION'; payload: { assetId: string; allocation: number } }
  | { type: 'CHANGE_RISK_PROFILE'; payload: { riskProfile: PortfolioModel['riskProfile'] } };

// Protocol type
export interface PortfolioProtocol {
  getState: () => { model: PortfolioModel; context: PortfolioContext };
  dispatch: (action: PortfolioAction) => void;
  subscribe: (listener: (state: { model: PortfolioModel; context: PortfolioContext }) => void) => () => void;
}