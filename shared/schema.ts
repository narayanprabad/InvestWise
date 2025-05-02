import { z } from "zod";

// Base schema for investment responses
const baseResponseSchema = z.object({
  type: z.enum(['topic', 'portfolio']),
}).strict();

// Schema for topic-specific responses ONLY
export const topicResponseSchema = baseResponseSchema.extend({
  type: z.literal('topic'),
  topic: z.string(),
  explanation: z.string().min(1),
  keyPoints: z.array(z.string().min(1)).min(1).max(10) // Limit number of points for readability
}).strict();

// Schema for portfolio recommendations ONLY
export const portfolioResponseSchema = baseResponseSchema.extend({
  type: z.literal('portfolio'),
  portfolio: z.object({
    equity: z.number().min(0).max(100),
    debt: z.number().min(0).max(100),
    gold: z.number().min(0).max(100),
    cash: z.number().min(0).max(100)
  }).strict(),
  strategy: z.string().min(1),
  recommendations: z.array(z.string().min(1)).min(1).max(5)
}).strict();

// Ensure responses are strictly separated
export const responseSchema = z.discriminatedUnion('type', [
  topicResponseSchema,
  portfolioResponseSchema
]);

export const goalSchema = z.object({
  type: z.enum(['retirement', 'education', 'homebuying', 'other']),
  targetAmount: z.number().min(1, "Target amount must be positive"),
  timeframe: z.number().min(1, "Timeframe must be at least 1 year"),
  description: z.string().min(1, "Description is required")
});

// User schema
export const insertUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(0, "Age must be positive"),
  location: z.string().min(1, "Location is required"),
  riskProfile: z.enum(['conservative', 'moderate', 'aggressive']),
  locale: z.enum(['IN', 'US', 'UK', 'SG']).default('IN'),
  currency: z.enum(['INR', 'USD', 'GBP', 'SGD']).default('INR'),
  goals: z.array(goalSchema).default([])
});

// Chat schema
export const insertChatSchema = z.object({
  userId: z.number(),
  message: z.string().min(1),
  response: z.string()
});

// Export types
export type TopicResponse = z.infer<typeof topicResponseSchema>;
export type PortfolioResponse = z.infer<typeof portfolioResponseSchema>;
export type InvestmentResponse = z.infer<typeof responseSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = InsertUser & {
  id: number;
  createdAt: Date;
};
export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = InsertChat & {
  id: number;
  createdAt: Date;
};

export const marketCondition = z.enum(['bearish', 'neutral', 'bullish']);
export type MarketCondition = z.infer<typeof marketCondition>;

export interface MarketIndices {
  name: string;
  value: number;
  change: number;
}

export interface MarketData {
  condition: MarketCondition;
  locale: string;
  indicators: {
    volatilityIndex: number;
    mainIndex: number;
    trend: 'up' | 'down' | 'sideways';
  };
  localIndices: MarketIndices[];
}

export interface ChatResponse {
  chat: Chat;
  response: InvestmentResponse;
}

export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';