import { type User, type Goal, type MarketCondition, type InvestmentResponse, responseSchema } from "@shared/schema";
import { getInvestmentAdvice as getAnthropicAdvice } from "./anthropic";
import { getInvestmentAdvice as getGeminiAdvice } from "./gemini";

/**
 * Intelligent AI advisor that uses Gemini as primary source with fallback options
 * No more hard-coded responses - all recommendations are generated in real-time
 */
export async function getInvestmentAdvice(
  query: string,
  user: User,
  goals: Goal[],
  marketCondition: MarketCondition
): Promise<InvestmentResponse> {
  try {
    // First try using Gemini (primary due to Anthropic credit issue)
    try {
      const geminiResponse = await getGeminiAdvice(query, user, goals, marketCondition);
      console.log("Successfully generated advice using Gemini");
      return geminiResponse;
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      
      // If Gemini fails, try using Anthropic (secondary)
      try {
        const claudeResponse = await getAnthropicAdvice(query, user, goals, marketCondition);
        console.log("Successfully generated advice using Claude (fallback)");
        return claudeResponse;
      } catch (claudeError) {
        console.error("Claude API error:", claudeError);
        throw new Error("Both AI services failed");
      }
    }
  } catch (error) {
    console.error("Investment advice error:", error);

    // Final fallback - generate a basic error response
    // This ensures the app keeps working even if both AI services fail
    return {
      type: "topic",
      topic: "error",
      explanation: "I apologize, but our AI services are currently experiencing high demand. Please try again in a moment.",
      keyPoints: [
        `For your ${user.riskProfile} risk profile, try asking about specific investments`,
        `Given the ${marketCondition} market, consider asking about defensive or growth strategies`,
        `You can ask about US stocks, Indian stocks, or portfolio allocation`
      ]
    };
  }
}