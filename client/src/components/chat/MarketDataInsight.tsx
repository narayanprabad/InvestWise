import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, TrendingUpIcon, BarChart2Icon, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MarketDataInsightProps {
  marketData: {
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

export default function MarketDataInsight({ marketData }: MarketDataInsightProps) {
  if (!marketData || (!marketData.prediction && !marketData.sentiment)) {
    return null;
  }

  // Determine trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowRightIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Determine sentiment color
  const getSentimentColor = (emotion: string) => {
    switch (emotion) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  // Format confidence as percentage
  const formatConfidence = (confidence: number) => {
    if (isNaN(confidence)) return "N/A";
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div className="mt-2 mb-2">
      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
        <Activity className="h-3 w-3" />
        <span>Market insights powered by ML</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {marketData.prediction && (
          <Card className="bg-muted/40">
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <TrendingUpIcon className="h-3 w-3" />
                  <span className="text-xs font-medium">Price Trend</span>
                </div>
                <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 flex items-center">
                  {getTrendIcon(marketData.prediction.trend)}
                  <span className="ml-1 capitalize">{marketData.prediction.trend}</span>
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Confidence: {formatConfidence(marketData.prediction.confidence)}
              </div>
            </CardContent>
          </Card>
        )}

        {marketData.sentiment && (
          <Card className="bg-muted/40">
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <BarChart2Icon className="h-3 w-3" />
                  <span className="text-xs font-medium">Market Sentiment</span>
                </div>
                <Badge variant="outline" className={`text-[10px] h-4 px-1 py-0 flex items-center ${getSentimentColor(marketData.sentiment.emotion)}`}>
                  <span className="capitalize">{marketData.sentiment.emotion}</span>
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Score: {marketData.sentiment.score.toFixed(2)} | 
                Confidence: {formatConfidence(marketData.sentiment.confidence)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}