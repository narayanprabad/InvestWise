import { PortfolioModel, PortfolioContext, PortfolioAction, PortfolioProtocol } from "./types";
import { portfolioModelOperations } from "./model";

// Create a default context for the portfolio
export function createDefaultContext(): PortfolioContext {
  return {
    marketCondition: 'neutral',
    userAge: null,
    userGoals: null
  };
}

// Create a portfolio protocol that connects the model with actions
export function createPortfolioProtocol(
  initialModel: PortfolioModel,
  initialContext: PortfolioContext
): PortfolioProtocol {
  // Internal state
  let model = initialModel;
  let context = initialContext;
  const listeners: Array<(state: { model: PortfolioModel; context: PortfolioContext }) => void> = [];
  
  // Get current state
  const getState = () => ({
    model: { ...model },
    context: { ...context }
  });
  
  // Notify listeners of state changes
  const notifyListeners = () => {
    const state = getState();
    listeners.forEach(listener => listener(state));
  };
  
  // Handle actions
  const dispatch = (action: PortfolioAction) => {
    switch (action.type) {
      case 'OPTIMIZE_PORTFOLIO':
        model = portfolioModelOperations.optimizePortfolio(
          model,
          action.payload.marketCondition
        );
        context = {
          ...context,
          marketCondition: action.payload.marketCondition
        };
        break;
        
      case 'REBALANCE_PORTFOLIO':
        model = portfolioModelOperations.rebalancePortfolio(
          model,
          action.payload.targetAllocation
        );
        break;
        
      case 'ADD_ASSET':
        model = portfolioModelOperations.addAsset(
          model,
          action.payload.asset
        );
        break;
        
      case 'REMOVE_ASSET':
        model = portfolioModelOperations.removeAsset(
          model,
          action.payload.assetId
        );
        break;
        
      case 'UPDATE_ASSET_ALLOCATION':
        model = portfolioModelOperations.updateAssetAllocation(
          model,
          action.payload.assetId,
          action.payload.allocation
        );
        break;
        
      case 'CHANGE_RISK_PROFILE':
        model = portfolioModelOperations.changeRiskProfile(
          model,
          action.payload.riskProfile
        );
        break;
        
      default:
        console.warn('Unknown action type:', (action as any).type);
        return;
    }
    
    // Notify listeners after state changes
    notifyListeners();
  };
  
  // Subscribe to state changes
  const subscribe = (listener: (state: { model: PortfolioModel; context: PortfolioContext }) => void) => {
    listeners.push(listener);
    
    // Call listener immediately with current state
    listener(getState());
    
    // Return unsubscribe function
    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  };
  
  return {
    getState,
    dispatch,
    subscribe
  };
}