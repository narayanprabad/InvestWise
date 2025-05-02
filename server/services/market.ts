import yf from "yahoo-finance2";
import type { MarketCondition, MarketData, MarketIndices } from "@shared/schema";
import { predictMarketMovement, analyzeNewsSentiment, optimizePortfolio } from './prediction';

// Market symbols by locale
const MARKET_SYMBOLS = {
  'US': {
    volatilityIndex: '^VIX',
    mainIndex: '^GSPC', // S&P 500
    additionalIndices: [
      { symbol: '^IXIC', name: 'NASDAQ' },
      { symbol: '^DJI', name: 'Dow Jones' },
      { symbol: '^RUT', name: 'Russell 2000' }
    ]
  },
  'IN': {
    volatilityIndex: '^INDIAVIX',
    mainIndex: '^NSEI', // NIFTY 50
    additionalIndices: [
      { symbol: '^BSESN', name: 'Sensex' },
      { symbol: '^NSEBANK', name: 'Bank Nifty' },
      { symbol: '^CNXIT', name: 'Nifty IT' }
    ]
  },
  'UK': {
    volatilityIndex: '^FTSE', // Using FTSE 100 as a proxy
    mainIndex: '^FTSE', // FTSE 100
    additionalIndices: [
      { symbol: '^FTMC', name: 'FTSE 250' },
      { symbol: '^FTLC', name: 'FTSE 100' }
    ]
  },
  'SG': {
    volatilityIndex: '^STI', // Using STI as a proxy
    mainIndex: '^STI', // Straits Times Index
    additionalIndices: [
      { symbol: '^STI', name: 'Straits Times Index' }
    ]
  }
};

// Default market data for when API calls fail
const DEFAULT_MARKET_DATA = {
  'US': {
    volatilityIndex: 20,
    mainIndex: 4000,
    additionalIndices: [
      { name: 'NASDAQ', value: 12000, change: -0.5 },
      { name: 'Dow Jones', value: 33000, change: -0.3 }
    ]
  },
  'IN': {
    volatilityIndex: 16,
    mainIndex: 21500,
    additionalIndices: [
      { name: 'Sensex', value: 72000, change: -0.4 },
      { name: 'Bank Nifty', value: 44000, change: -0.6 }
    ]
  }
};

// Determine market condition based on volatility index, recent market movement, and AI predictions
async function determineMarketCondition(vixValue: number, mainIndexChange: number, mainIndexSymbol: string): Promise<MarketCondition> {
  try {
    console.log(`Running AI models for market condition determination on ${mainIndexSymbol}`);
    
    // Get ML prediction for the next 5 days
    const marketPrediction = await predictMarketMovement(mainIndexSymbol, 5);
    
    // Analyze sentiment from market data
    const sentimentAnalysis = await analyzeNewsSentiment(mainIndexSymbol);
    
    console.log(`AI Market Prediction Results: 
      Trend: ${marketPrediction.trend}
      Confidence: ${marketPrediction.confidence}
      5-Day Prediction: ${marketPrediction.prediction.join(', ')}
    `);
    
    console.log(`AI Sentiment Analysis Results:
      Score: ${sentimentAnalysis.score}
      Emotion: ${sentimentAnalysis.emotion}
      Confidence: ${sentimentAnalysis.confidence}
    `);
    
    // Integrated approach using ML prediction, sentiment, and technical indicators
    
    // 1. Use VIX as a measure of fear/volatility
    let vixSignal: 'bearish' | 'neutral' | 'bullish' = 'neutral';
    if (vixValue > 25) {
      vixSignal = 'bearish';
    } else if (vixValue < 15) {
      vixSignal = 'bullish';
    }
    
    // 2. Use ML prediction for trend
    let predictionSignal: 'bearish' | 'neutral' | 'bullish' = 'neutral';
    if (marketPrediction.trend === 'up' && marketPrediction.confidence > 0.4) {
      predictionSignal = 'bullish';
    } else if (marketPrediction.trend === 'down' && marketPrediction.confidence > 0.4) {
      predictionSignal = 'bearish';
    }
    
    // 3. Use sentiment analysis
    let sentimentSignal: 'bearish' | 'neutral' | 'bullish' = 'neutral';
    if (sentimentAnalysis.score > 1.5 && sentimentAnalysis.confidence > 0.4) {
      sentimentSignal = 'bullish';
    } else if (sentimentAnalysis.score < -1.5 && sentimentAnalysis.confidence > 0.4) {
      sentimentSignal = 'bearish';
    }
    
    // 4. Use current market performance
    let currentSignal: 'bearish' | 'neutral' | 'bullish' = 'neutral';
    if (mainIndexChange > 1) {
      currentSignal = 'bullish';
    } else if (mainIndexChange < -1) {
      currentSignal = 'bearish';
    }
    
    // Count signals with weighting
    const signals = [
      { type: 'vix', value: vixSignal, weight: 1.0 },
      { type: 'prediction', value: predictionSignal, weight: 1.5 },
      { type: 'sentiment', value: sentimentSignal, weight: 1.0 },
      { type: 'current', value: currentSignal, weight: 1.2 }
    ];
    
    // Calculate weighted scores
    let bearishScore = 0;
    let bullishScore = 0;
    let neutralScore = 0;
    
    signals.forEach(signal => {
      if (signal.value === 'bearish') bearishScore += signal.weight;
      else if (signal.value === 'bullish') bullishScore += signal.weight;
      else neutralScore += signal.weight;
    });
    
    console.log(`AI Market Condition Scores:
      Bearish: ${bearishScore}
      Bullish: ${bullishScore}
      Neutral: ${neutralScore}
    `);
    
    // Determine final condition based on weighted scores
    if (bearishScore > bullishScore && bearishScore > neutralScore) {
      return 'bearish';
    } else if (bullishScore > bearishScore && bullishScore > neutralScore) {
      return 'bullish';
    } else {
      return 'neutral';
    }
  } catch (error) {
    console.error("Error in AI market condition determination:", error);
    
    // Fallback to simpler model if AI prediction fails
    if (vixValue > 25) {
      if (mainIndexChange < -0.5) {
        return 'bearish';
      }
      return 'neutral';
    } else if (vixValue < 15) {
      if (mainIndexChange > 0.5) {
        return 'bullish';
      }
      return 'neutral';
    }
    
    if (mainIndexChange > 1) {
      return 'bullish';
    } else if (mainIndexChange < -1) {
      return 'bearish';
    }
    
    return 'neutral';
  }
}

// Determine market trend based on AI predictions and recent performance
async function determineMarketTrend(change: number, symbol: string): Promise<'up' | 'down' | 'sideways'> {
  try {
    console.log(`Running AI trend prediction model for ${symbol}`);
    
    // Use AI prediction model for trend
    const prediction = await predictMarketMovement(symbol, 5);
    
    console.log(`AI Trend Prediction: ${prediction.trend} (confidence: ${prediction.confidence})`);
    
    // If prediction is confident, use it
    if (prediction.confidence > 0.5) {
      return prediction.trend;
    }
    
    // Fallback to simple calculation
    if (change > 0.5) {
      return 'up';
    } else if (change < -0.5) {
      return 'down';
    }
    return 'sideways';
  } catch (error) {
    console.error("Error in AI trend determination:", error);
    
    // Fallback to simple model
    if (change > 0.5) {
      return 'up';
    } else if (change < -0.5) {
      return 'down';
    }
    return 'sideways';
  }
}

export async function getMarketCondition(locale = 'IN'): Promise<MarketData> {
  try {
    // Normalize locale to uppercase and ensure it's supported
    locale = locale.toUpperCase();
    if (!MARKET_SYMBOLS[locale]) {
      locale = 'IN'; // Default to India if not supported
    }

    const symbols = MARKET_SYMBOLS[locale];
    const localIndices: MarketIndices[] = [];
    
    // Get volatility index
    const vixResult = await yf.quote(symbols.volatilityIndex);
    const vixValue = vixResult.regularMarketPrice || 0;
    
    // Get main index
    const mainIndexResult = await yf.quote(symbols.mainIndex);
    const mainIndexValue = mainIndexResult.regularMarketPrice || 0;
    const mainIndexChange = mainIndexResult.regularMarketChangePercent || 0;
    
    // Get additional indices
    for (const index of symbols.additionalIndices) {
      try {
        const result = await yf.quote(index.symbol);
        if (result.regularMarketPrice) {
          localIndices.push({
            name: index.name,
            value: result.regularMarketPrice,
            change: result.regularMarketChangePercent || 0
          });
        }
      } catch (error) {
        console.error(`Error fetching ${index.name}:`, error);
      }
    }

    // Determine market condition using AI models
    console.log(`Using AI models for ${locale} market analysis`);
    const marketCondition = await determineMarketCondition(vixValue, mainIndexChange, symbols.mainIndex);
    const marketTrend = await determineMarketTrend(mainIndexChange, symbols.mainIndex);

    return {
      condition: marketCondition,
      locale,
      indicators: {
        volatilityIndex: vixValue,
        mainIndex: mainIndexValue,
        trend: marketTrend
      },
      localIndices
    };
  } catch (error) {
    console.error('Error in getMarketCondition:', error);
    // Fallback to default data
    const defaultData = locale === 'US' ? DEFAULT_MARKET_DATA.US : DEFAULT_MARKET_DATA.IN;
    
    return {
      condition: 'neutral',
      locale,
      indicators: {
        volatilityIndex: defaultData.volatilityIndex,
        mainIndex: defaultData.mainIndex,
        trend: 'sideways'
      },
      localIndices: defaultData.additionalIndices
    };
  }
}