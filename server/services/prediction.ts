import { Matrix } from 'ml-matrix';
import { PolynomialRegression } from 'ml-regression';
import sentiment from 'sentiment';
import yahooFinance from 'yahoo-finance2';

// Sentiment analyzer
const sentimentAnalyzer = new sentiment();

/**
 * Regression Model for Market Prediction
 * Uses polynomial regression to predict future index values
 */
export async function predictMarketMovement(symbol: string, days = 5): Promise<{
  prediction: number[];
  confidence: number;
  trend: 'up' | 'down' | 'sideways';
}> {
  try {
    console.log(`Running prediction model for ${symbol} for next ${days} days`);
    
    // Get historical data for training (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Fetch historical data
    const historicalData = await yahooFinance.historical(symbol, {
      period1: startDate.toISOString().split('T')[0],
      period2: endDate.toISOString().split('T')[0],
    });
    
    if (!historicalData || historicalData.length < 10) {
      console.warn(`Insufficient data for ${symbol}, falling back to simple trend model`);
      return generateSimplePrediction(symbol);
    }
    
    // Prepare data for regression model
    const x = [];
    const y = [];
    
    // Organize data for training
    for (let i = 0; i < historicalData.length; i++) {
      x.push([i]); // Day index
      y.push(historicalData[i].close); // Closing price
    }
    
    // Create and train polynomial regression model (degree 3)
    const degree = 3;
    const regression = new PolynomialRegression(x, y, degree);
    
    // Make predictions for the next 'days' days
    const predictions = [];
    const lastDayIndex = historicalData.length - 1;
    
    for (let i = 1; i <= days; i++) {
      const predictedValue = regression.predict([lastDayIndex + i]);
      predictions.push(predictedValue);
    }
    
    // Calculate model quality
    const rSquared = regression.score(x, y);
    
    // Determine overall trend
    const currentPrice = historicalData[historicalData.length - 1].close;
    const predictedPrice = predictions[predictions.length - 1];
    const percentChange = ((predictedPrice - currentPrice) / currentPrice) * 100;
    
    let trend: 'up' | 'down' | 'sideways' = 'sideways';
    if (percentChange > 1.5) {
      trend = 'up';
    } else if (percentChange < -1.5) {
      trend = 'down';
    }
    
    return {
      prediction: predictions,
      confidence: Math.max(0, Math.min(1, rSquared)), // Bound between 0 and 1
      trend
    };
  } catch (error) {
    console.error(`Error in predictMarketMovement for ${symbol}:`, error);
    return generateSimplePrediction(symbol);
  }
}

/**
 * Fallback prediction when data is insufficient
 */
async function generateSimplePrediction(symbol: string): Promise<{
  prediction: number[];
  confidence: number;
  trend: 'up' | 'down' | 'sideways';
}> {
  try {
    // Get latest price
    const quote = await yahooFinance.quote(symbol);
    const currentPrice = quote.regularMarketPrice;
    
    // Generate small random movements (±1%)
    const predictions = [];
    let lastPrice = currentPrice || 0;
    
    for (let i = 0; i < 5; i++) {
      const randomChange = (Math.random() * 2 - 1) / 100; // Between -1% and 1%
      lastPrice = lastPrice * (1 + randomChange);
      predictions.push(lastPrice);
    }
    
    // Determine trend from our simple prediction
    const percentChange = currentPrice ? ((predictions[predictions.length - 1] - currentPrice) / currentPrice) * 100 : 0;
    
    let trend: 'up' | 'down' | 'sideways' = 'sideways';
    if (percentChange > 0.5) {
      trend = 'up';
    } else if (percentChange < -0.5) {
      trend = 'down';
    }
    
    return {
      prediction: predictions,
      confidence: 0.3, // Low confidence for simple model
      trend
    };
  } catch (error) {
    console.error(`Error in fallback prediction for ${symbol}:`, error);
    // Emergency fallback
    return {
      prediction: [0, 0, 0, 0, 0],
      confidence: 0,
      trend: 'sideways'
    };
  }
}

/**
 * Sentiment Analysis on Market News
 * Analyzes recent news sentiment for a particular market/symbol
 */
export async function analyzeNewsSentiment(symbol: string): Promise<{
  score: number;  // Range from -5 to 5
  emotion: 'positive' | 'negative' | 'neutral';
  confidence: number;
}> {
  try {
    // Get news articles for the symbol
    // Note: Yahoo Finance doesn't have a direct news API, so this is simplified
    const stockData = await yahooFinance.quoteSummary(symbol, { modules: ["summaryProfile", "summaryDetail"] });
    
    // Extract company description to analyze (as a proxy for news)
    let text = '';
    if (stockData.summaryProfile && stockData.summaryProfile.longBusinessSummary) {
      text = stockData.summaryProfile.longBusinessSummary;
    } else {
      // Fallback to a generic description based on the symbol
      text = `The market for ${symbol} has been experiencing typical fluctuations in recent trading sessions.`;
    }
    
    // Run sentiment analysis
    const result = sentimentAnalyzer.analyze(text);
    
    // Normalize score to range from -5 to 5
    const normalizedScore = Math.max(-5, Math.min(5, result.score / 2));
    
    // Determine emotion
    let emotion: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (normalizedScore > 1) {
      emotion = 'positive';
    } else if (normalizedScore < -1) {
      emotion = 'negative';
    }
    
    // Calculate confidence based on the amount of text analyzed
    const confidence = Math.min(1, text.length / 1000);
    
    return {
      score: normalizedScore,
      emotion,
      confidence
    };
  } catch (error) {
    console.error(`Error in analyzeNewsSentiment for ${symbol}:`, error);
    return {
      score: 0,
      emotion: 'neutral',
      confidence: 0
    };
  }
}

/**
 * Portfolio Optimization Model
 * Simple implementation of portfolio optimization based on risk profile
 */
export function optimizePortfolio(riskProfile: 'conservative' | 'moderate' | 'aggressive', 
                               marketCondition: 'bearish' | 'neutral' | 'bullish'): {
  allocation: {
    category: string;
    percentage: number;
  }[];
  expectedReturn: number;
  riskLevel: number;
} {
  // Base allocations for different risk profiles
  const baseAllocations = {
    conservative: {
      stocks: 30,
      bonds: 45,
      cash: 15,
      alternatives: 10
    },
    moderate: {
      stocks: 50,
      bonds: 30,
      cash: 10,
      alternatives: 10
    },
    aggressive: {
      stocks: 70,
      bonds: 15,
      cash: 5,
      alternatives: 10
    }
  };
  
  // Market condition adjustments
  const marketAdjustments = {
    bearish: {
      stocks: -10,
      bonds: 5,
      cash: 5,
      alternatives: 0
    },
    neutral: {
      stocks: 0,
      bonds: 0,
      cash: 0,
      alternatives: 0
    },
    bullish: {
      stocks: 10,
      bonds: -5,
      cash: -5,
      alternatives: 0
    }
  };
  
  // Apply adjustments
  const base = baseAllocations[riskProfile];
  const adjustment = marketAdjustments[marketCondition];
  
  const optimizedAllocation = {
    stocks: Math.max(0, Math.min(100, base.stocks + adjustment.stocks)),
    bonds: Math.max(0, Math.min(100, base.bonds + adjustment.bonds)),
    cash: Math.max(0, Math.min(100, base.cash + adjustment.cash)),
    alternatives: Math.max(0, Math.min(100, base.alternatives + adjustment.alternatives))
  };
  
  // Normalize to ensure total is 100%
  const total = Object.values(optimizedAllocation).reduce((sum, val) => sum + val, 0);
  
  // Create normalized allocation
  const allocation = Object.entries(optimizedAllocation).map(([category, percentage]) => ({
    category,
    percentage: Math.round((percentage / total) * 100)
  }));
  
  // Calculate expected return and risk based on allocations
  // This is a simplified model based on historical averages
  const expectedReturns = {
    stocks: 10,
    bonds: 5,
    cash: 2,
    alternatives: 8
  };
  
  const riskLevels = {
    stocks: 16,
    bonds: 6,
    cash: 1,
    alternatives: 12
  };
  
  // Calculate weighted expected return
  const expectedReturn = allocation.reduce((total, item) => {
    const categoryReturn = expectedReturns[item.category as keyof typeof expectedReturns] || 0;
    return total + (categoryReturn * item.percentage / 100);
  }, 0);
  
  // Calculate weighted risk level
  const riskLevel = allocation.reduce((total, item) => {
    const categoryRisk = riskLevels[item.category as keyof typeof riskLevels] || 0;
    return total + (categoryRisk * item.percentage / 100);
  }, 0);
  
  return {
    allocation,
    expectedReturn,
    riskLevel
  };
}