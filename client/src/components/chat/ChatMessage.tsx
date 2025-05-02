import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { TopicResponse, PortfolioResponse } from "@shared/schema";
import MarketDataInsight from "./MarketDataInsight";

// Component for topic-specific responses only
function TopicResponseView({ response }: { response: TopicResponse }) {
  return (
    <div className="space-y-3">
      <div className="prose prose-xs">
        <h4 className="text-sm font-medium capitalize">{response.topic === 'error' ? 'Help' : response.topic}</h4>
        <p className="text-xs leading-normal">{response.explanation}</p>
      </div>

      {response.keyPoints?.length > 0 && (
        <div>
          <h4 className="text-xs font-medium mb-1">{response.topic === 'error' ? 'Suggestions' : 'Key Points'}</h4>
          <ul className="list-disc list-inside text-xs space-y-1">
            {response.keyPoints.map((point, i) => (
              <li key={i} className="leading-tight">{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Component for portfolio recommendations only
function PortfolioResponseView({ response }: { response: PortfolioResponse }) {
  // Define colors for the portfolio allocation bars
  const colors = {
    equity: "bg-blue-500",
    debt: "bg-green-600",
    gold: "bg-amber-500",
    cash: "bg-slate-400"
  };

  return (
    <div className="space-y-4">
      <p className="text-xs leading-snug">{response.strategy}</p>

      <div className="bg-muted p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">Portfolio Allocation</h4>
        
        {/* Visual representation of allocation percentages */}
        <div className="mb-3 h-4 w-full flex rounded-full overflow-hidden">
          <div 
            className={`${colors.equity} transition-all duration-500`} 
            style={{ width: `${response.portfolio.equity}%` }}
            title={`Equity: ${response.portfolio.equity}%`}
          />
          <div 
            className={`${colors.debt} transition-all duration-500`} 
            style={{ width: `${response.portfolio.debt}%` }}
            title={`Debt: ${response.portfolio.debt}%`}
          />
          <div 
            className={`${colors.gold} transition-all duration-500`} 
            style={{ width: `${response.portfolio.gold}%` }}
            title={`Gold: ${response.portfolio.gold}%`}
          />
          <div 
            className={`${colors.cash} transition-all duration-500`} 
            style={{ width: `${response.portfolio.cash}%` }}
            title={`Cash: ${response.portfolio.cash}%`}
          />
        </div>
        
        {/* Percentage breakdown with labels */}
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${colors.equity}`}></span>
            <span>Equity: <strong>{response.portfolio.equity}%</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${colors.debt}`}></span>
            <span>Debt: <strong>{response.portfolio.debt}%</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${colors.gold}`}></span>
            <span>Gold: <strong>{response.portfolio.gold}%</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${colors.cash}`}></span>
            <span>Cash: <strong>{response.portfolio.cash}%</strong></span>
          </div>
        </div>
      </div>

      {response.recommendations?.length > 0 && (
        <div>
          <h4 className="text-xs font-medium mb-1">Investment Recommendations</h4>
          <ul className="list-disc list-inside text-xs space-y-1">
            {response.recommendations.map((rec, i) => (
              <li key={i} className="leading-tight">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Error message component
function ErrorMessage() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <AlertCircle className="h-4 w-4" />
      <span>I couldn't understand that. Please try asking your question differently.</span>
    </div>
  );
}

// Loading message component
function LoadingMessage() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="animate-pulse">Thinking...</div>
    </div>
  );
}

interface ChatMessageProps {
  message: string;
  response: TopicResponse | PortfolioResponse | null;
  timestamp: Date;
  isLoading?: boolean;
  marketData?: {
    condition?: 'bullish' | 'bearish' | 'neutral';
    prediction?: {
      trend: 'up' | 'down' | 'sideways';
      confidence: number;
      prediction: number[][];
    };
    sentiment?: {
      score: number;
      emotion: 'positive' | 'negative' | 'neutral';
      confidence: number;
    };
  };
}

export default function ChatMessage({
  message,
  response,
  timestamp,
  isLoading = false,
  marketData
}: ChatMessageProps) {
  // User message
  const userMessage = (
    <div className="flex items-start gap-2">
      <div className="bg-primary text-primary-foreground rounded-full p-2 text-sm">
        You
      </div>
      <Card>
        <CardContent className="p-3">
          <p>{message}</p>
          <time className="text-xs text-muted-foreground">
            {format(timestamp, "HH:mm")}
          </time>
        </CardContent>
      </Card>
    </div>
  );

  // AI response
  const aiResponse = (
    <div className="flex items-start gap-2">
      <div className="bg-secondary text-secondary-foreground rounded-full p-2 text-sm">
        AI
      </div>
      <Card className="flex-1">
        <CardContent className="p-3">
          {isLoading ? (
            <LoadingMessage />
          ) : !response || !response.type ? (
            <ErrorMessage />
          ) : (
            <>
              {response.type === "topic" ? (
                <TopicResponseView response={response} />
              ) : (
                <PortfolioResponseView response={response} />
              )}
              
              {/* Show ML market insights if available */}
              {marketData && (marketData.prediction || marketData.sentiment) && (
                <MarketDataInsight marketData={marketData} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4 mb-6">
      {userMessage}
      {aiResponse}
    </div>
  );
}