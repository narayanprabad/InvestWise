import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { getInvestmentAdvice } from "./services/openai";
import { getMarketCondition } from "./services/market";
import { insertUserSchema, insertChatSchema } from "@shared/schema";
import { predictMarketMovement, analyzeNewsSentiment, optimizePortfolio } from "./services/prediction";

// Helper function to create demo profiles if they don't exist
async function ensureDemoProfiles() {
  try {
    // Check if profiles already exist
    const usersCount = Object.keys(await storage.getAllUsers()).length;
    
    if (usersCount < 4) {
      console.log('Creating demo profiles...');
      
      // Indian profile (conservative)
      const indianUser = await storage.getUser(1);
      if (!indianUser) {
        await storage.createUser({
          name: "Narayanan Ramachandran",
          age: 35,
          location: "Mumbai, India",
          riskProfile: "conservative",
          locale: "IN",
          currency: "INR",
          goals: [{
            type: "retirement",
            targetAmount: 10000000,
            timeframe: 25,
            description: "Retirement funds"
          }]
        });
      }
      
      // US profile (moderate)
      const usUser = await storage.getUser(2);
      if (!usUser) {
        await storage.createUser({
          name: "Sarah Johnson",
          age: 42,
          location: "New York, USA",
          riskProfile: "moderate",
          locale: "US",
          currency: "USD",
          goals: [{
            type: "education",
            targetAmount: 150000,
            timeframe: 12,
            description: "College fund for kids"
          }]
        });
      }
      
      // UK profile (aggressive)
      const ukUser = await storage.getUser(3);
      if (!ukUser) {
        await storage.createUser({
          name: "James Williams",
          age: 28,
          location: "London, UK",
          riskProfile: "aggressive",
          locale: "UK",
          currency: "GBP",
          goals: [{
            type: "homebuying",
            targetAmount: 350000,
            timeframe: 5,
            description: "Down payment for a house"
          }]
        });
      }
      
      // Singapore profile (moderate)
      const sgUser = await storage.getUser(4);
      if (!sgUser) {
        await storage.createUser({
          name: "Mei Lin Tan",
          age: 31,
          location: "Singapore",
          riskProfile: "moderate",
          locale: "SG",
          currency: "SGD",
          goals: [{
            type: "other",
            targetAmount: 100000,
            timeframe: 10,
            description: "Starting a business"
          }]
        });
      }
      
      console.log('Demo profiles created successfully');
    }
  } catch (error) {
    console.error('Error creating demo profiles:', error);
  }
}

export async function registerRoutes(app: Express) {
  // Create demo profiles
  await ensureDemoProfiles();
  const httpServer = createServer(app);

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);

      // Generate initial recommendation
      const marketData = await getMarketCondition(user.location.split('_').pop()?.toUpperCase());
      const initialQuery = "What's the best investment strategy for my profile?";

      const recommendation = await getInvestmentAdvice(
        initialQuery,
        user,
        [], // Initial empty goals
        marketData.condition
      );

      // Save the initial chat
      await storage.addChatMessage({
        userId: user.id,
        message: initialQuery,
        response: JSON.stringify(recommendation)
      });

      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  });

  app.post("/api/users/:id/goals", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      await storage.setUserGoals(userId, req.body.goals);

      // Generate new recommendation based on updated goals
      const marketData = await getMarketCondition(
        user.location.split('_').pop()?.toUpperCase()
      );

      const latestGoal = req.body.goals[req.body.goals.length - 1];
      const query = `What's the best investment strategy for my ${latestGoal.type} goal of ₹${latestGoal.targetAmount} in ${latestGoal.timeframe} years?`;

      const recommendation = await getInvestmentAdvice(
        query,
        user,
        req.body.goals,
        marketData.condition
      );

      // Save the new chat message
      await storage.addChatMessage({
        userId,
        message: query,
        response: JSON.stringify(recommendation)
      });

      res.json({ success: true, recommendation });
    } catch (error) {
      console.error("Error setting goals:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/users/:id/goals", async (req, res) => {
    const goals = await storage.getUserGoals(parseInt(req.params.id));
    res.json(goals);
  });

  app.get("/api/market/condition", async (req, res) => {
    let locale = 'IN'; // Default to India

    // Check if locale is directly provided as a query parameter
    if (req.query.locale) {
      const requestedLocale = (req.query.locale as string).toUpperCase();
      if (['IN', 'US', 'UK', 'SG'].includes(requestedLocale)) {
        locale = requestedLocale;
      }
    } 
    // Otherwise if location is provided, extract country code from it
    else if (req.query.location) {
      const location = req.query.location as string;
      const countryCode = location.split('_').pop()?.toUpperCase();
      if (countryCode && ['IN', 'US', 'UK', 'SG'].includes(countryCode)) {
        locale = countryCode;
      }
    }

    console.log(`Fetching market data for locale: ${locale}`);
    const marketData = await getMarketCondition(locale);
    res.json(marketData);
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const chatData = insertChatSchema.parse(req.body);
      const user = await storage.getUser(chatData.userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Use the locale from the request if available, otherwise use user's location
      const locale = req.body.locale || user.location.split('_').pop()?.toUpperCase();
      console.log(`Using locale for chat: ${locale}`);
      
      const goals = await storage.getUserGoals(chatData.userId);
      
      // Get real-time market data and ML-based predictions
      const marketData = await getMarketCondition(locale);
      
      // Get market-specific data based on user query
      let marketSymbol = '';
      
      // Determine relevant market symbol based on locale
      if (locale === 'IN') marketSymbol = '^NSEI';
      else if (locale === 'US') marketSymbol = '^GSPC';
      else if (locale === 'UK') marketSymbol = '^FTSE';
      else marketSymbol = '^NSEI'; // Default to NIFTY
      
      // For specific market queries, get additional ML predictions to inform AI response
      let marketPrediction = null;
      let sentimentAnalysis = null;
      
      const isMarketQuery = /market|stock|index|investment|fund|sensex|nifty|ftse|s&p|dow|nasdaq/i.test(chatData.message);
      
      if (isMarketQuery) {
        try {
          console.log(`Getting ML predictions for ${marketSymbol} to enhance AI response`);
          // Get both ML predictions to inform AI response
          marketPrediction = await predictMarketMovement(marketSymbol, 5);
          sentimentAnalysis = await analyzeNewsSentiment(marketSymbol);
          
          console.log(`ML-enhanced market data: 
            - Trend: ${marketPrediction.trend} 
            - Sentiment: ${sentimentAnalysis.emotion} (${sentimentAnalysis.score})
          `);
        } catch (predictionError) {
          console.error("Error getting ML predictions:", predictionError);
          // Continue without ML predictions if they fail
        }
      }
      
      // Enrich the query with ML prediction data if available
      let enhancedMessage = chatData.message;
      if (marketPrediction && sentimentAnalysis) {
        // Add ML prediction information to the message for the AI, but behind the scenes
        enhancedMessage = `${chatData.message}\n\n[NOTE: Market prediction data shows a ${marketPrediction.trend} trend with ${sentimentAnalysis.emotion} sentiment. This is for your information only, don't explicitly mention "ML predictions" in your response.]`;
      }
      
      // Get AI-powered investment advice with enhanced context
      const recommendation = await getInvestmentAdvice(
        enhancedMessage,
        user,
        goals,
        marketData.condition
      );

      // Store the original user message in the database, not the enhanced one
      chatData.response = JSON.stringify(recommendation);
      const chat = await storage.addChatMessage(chatData);

      // Return the response with additional market data for the frontend
      res.json({
        chat,
        recommendation,
        marketData: {
          condition: marketData.condition,
          indicators: marketData.indicators,
          prediction: marketPrediction,
          sentiment: sentimentAnalysis
        }
      });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/chat/:userId/history", async (req, res) => {
    const history = await storage.getChatHistory(parseInt(req.params.userId));
    res.json(history);
  });
  
  // ML prediction API endpoints
  app.get("/api/prediction/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      console.log(`ML prediction requested for symbol: ${symbol}`);
      
      // Get market prediction
      const prediction = await predictMarketMovement(symbol);
      res.json(prediction);
    } catch (error) {
      console.error("Error in prediction API:", error);
      res.status(500).json({ error: "Failed to generate market prediction" });
    }
  });
  
  app.get("/api/sentiment/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      console.log(`Sentiment analysis requested for symbol: ${symbol}`);
      
      // Get sentiment analysis
      const sentiment = await analyzeNewsSentiment(symbol);
      res.json(sentiment);
    } catch (error) {
      console.error("Error in sentiment API:", error);
      res.status(500).json({ error: "Failed to analyze market sentiment" });
    }
  });
  
  app.post("/api/portfolio/optimize", async (req, res) => {
    try {
      const { riskProfile, marketCondition } = req.body;
      
      if (!riskProfile || !marketCondition) {
        return res.status(400).json({ error: "Risk profile and market condition are required" });
      }
      
      // Check if risk profile is valid
      if (!["conservative", "moderate", "aggressive"].includes(riskProfile)) {
        return res.status(400).json({ error: "Invalid risk profile" });
      }
      
      // Check if market condition is valid
      if (!["bearish", "neutral", "bullish"].includes(marketCondition)) {
        return res.status(400).json({ error: "Invalid market condition" });
      }
      
      console.log(`Portfolio optimization requested: ${riskProfile} profile in ${marketCondition} market`);
      
      // Get optimized portfolio
      const optimizedPortfolio = optimizePortfolio(
        riskProfile as 'conservative' | 'moderate' | 'aggressive', 
        marketCondition as 'bearish' | 'neutral' | 'bullish'
      );
      
      res.json(optimizedPortfolio);
    } catch (error) {
      console.error("Error in portfolio optimization API:", error);
      res.status(500).json({ error: "Failed to optimize portfolio" });
    }
  });

  return httpServer;
}