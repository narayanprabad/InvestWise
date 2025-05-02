import Anthropic from '@anthropic-ai/sdk';
import { 
  type User, 
  type Goal, 
  type MarketCondition, 
  type InvestmentResponse,
  responseSchema
} from "@shared/schema";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL = "claude-3-7-sonnet-20250219";

// Helper to format market condition for context
function formatMarketContext(marketCondition: MarketCondition): string {
  const conditionMap = {
    bullish: "bullish (optimistic, rising prices)",
    bearish: "bearish (pessimistic, falling prices)",
    neutral: "neutral (sideways, consolidating prices)"
  };
  
  return conditionMap[marketCondition] || "neutral";
}

// Helper to format age group for context
function formatAgeContext(age: number): string {
  if (age < 30) return "young investor (under 30)";
  if (age < 45) return "mid-career investor (30-45)";
  if (age < 60) return "pre-retirement investor (45-60)";
  return "retirement-focused investor (over 60)";
}

// Helper to format goals for context
function formatGoalsContext(goals: Goal[]): string {
  if (goals.length === 0) return "No specific investment goals provided.";
  
  return goals.map(goal => {
    return `- ${goal.type} goal: ₹${goal.targetAmount.toLocaleString()} in ${goal.timeframe} years${goal.description ? ` (${goal.description})` : ''}`;
  }).join("\n");
}

/**
 * Generates personalized investment advice using Claude AI
 */
export async function getInvestmentAdvice(
  query: string,
  user: User,
  goals: Goal[],
  marketCondition: MarketCondition
): Promise<InvestmentResponse> {
  try {
    // Determine if query is about portfolio allocation or topic information
    const isPortfolioQuery = /portfolio|allocat|asset mix|invest.+money|how.+invest|what.+invest/i.test(query);
    
    // Get current date for context
    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Build a more comprehensive prompt with real-world data context
    const systemPrompt = `You are an expert investment advisor for a financial technology company.
Your task is to provide personalized investment recommendations based on the user's query, profile, and current market conditions.
Today is ${currentDate}.

USER PROFILE:
- Name: ${user.name}
- Age: ${user.age} (${formatAgeContext(user.age)})
- Location: ${user.location.split('_')[0].toUpperCase()}
- Risk Profile: ${user.riskProfile}

INVESTMENT GOALS:
${formatGoalsContext(goals)}

MARKET CONTEXT:
- Current market condition: ${formatMarketContext(marketCondition)}
- Financial markets in the user's region (${user.location.split('_')[0].toUpperCase()}) are exhibiting ${marketCondition} characteristics
- Adjust recommendations specifically for the ${user.location.split('_')[0].toUpperCase()} financial market, mentioning specific indices or financial products relevant to this region

${isPortfolioQuery ? `
For portfolio allocation questions, provide a percentage-based asset allocation that adds up to 100% across these categories:
- Equity (stocks, equity funds)
- Debt (bonds, fixed deposits)
- Gold (gold ETFs, physical gold)
- Cash (savings, liquid funds)

IMPORTANT: Tailor this allocation to their risk profile, age, and current market conditions. 
For portfolio type responses:
1. Create a strategy that reflects current ${user.location.split('_')[0].toUpperCase()} market conditions and the user's specific needs
2. Provide 3-5 specific investment recommendations that would work in the current market conditions
3. Mention at least one specific market index or fund from the user's country by name
4. Adjust allocations based on the user's age and time horizon for their goals
` : `
For informational questions about specific investment topics, provide:
1. A clear explanation of the topic (keep it under 300 characters)
2. Exactly 3-4 key points with specific details, data, or examples
3. Include relevant information about the current market conditions in ${user.location.split('_')[0].toUpperCase()}
4. Mention specific market indices, funds, or investment vehicles available in ${user.location.split('_')[0].toUpperCase()} where relevant
`}

Respond in clear, jargon-free language that's accessible to retail investors. Use numerical data where appropriate to support your recommendations.

YOUR RESPONSE FORMAT MUST BE VALID JSON matching this schema:
For portfolio allocation: { "type": "portfolio", "portfolio": { "equity": number, "debt": number, "gold": number, "cash": number }, "strategy": string, "recommendations": string[] }
For other topics: { "type": "topic", "topic": string, "explanation": string, "keyPoints": string[] }
`;

    // Send request to Claude
    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: query
        }
      ],
    });

    // Parse and validate response 
    try {
      // Extract content from Claude's response
      const content = completion.content[0].text;
      
      // Parse JSON from the content
      let jsonResponse = JSON.parse(content);
      
      // Validate against schema to ensure it matches our expected format
      return responseSchema.parse(jsonResponse);
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      
      // Fallback to a generic error response
      return {
        type: "topic",
        topic: "error",
        explanation: "I apologize, but I encountered an issue generating personalized advice.",
        keyPoints: [
          "Please try rephrasing your question",
          "You can ask about specific investment types like stocks, mutual funds, or debt instruments",
          "For portfolio advice, ask something like 'What portfolio allocation would suit my profile?'"
        ]
      };
    }
  } catch (error) {
    console.error("Investment advice error:", error);
    
    // Return a valid error response that matches our schema
    return {
      type: "topic",
      topic: "error",
      explanation: "I apologize, but I couldn't generate personalized advice at this moment.",
      keyPoints: [
        `For your ${user.riskProfile} risk profile, try asking about specific investments`,
        `Given the ${marketCondition} market, consider asking about defensive or growth strategies`,
        `You can ask about US stocks, Indian stocks, or portfolio allocation`
      ]
    };
  }
}