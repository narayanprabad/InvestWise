import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface SentimentAnalysisComponentProps {
  symbol: string;
  locale: string;
}

interface SentimentData {
  score: number;
  emotion: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export default function SentimentAnalysisComponent({ symbol, locale }: SentimentAnalysisComponentProps) {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getMarketIndexName = (locale: string, symbol: string) => {
    const marketNames: Record<string, Record<string, string>> = {
      'IN': {
        '^NSEI': 'Nifty 50',
        '^BSESN': 'Sensex',
      },
      'US': {
        '^GSPC': 'S&P 500',
        '^DJI': 'Dow Jones',
        '^IXIC': 'NASDAQ',
      },
      'UK': {
        '^FTSE': 'FTSE 100',
      },
      'SG': {
        '^STI': 'Straits Times Index',
      }
    };
    
    return marketNames[locale]?.[symbol] || symbol;
  };
  
  const fetchSentiment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/sentiment/${encodeURIComponent(symbol)}`);
      if (!response.ok) {
        throw new Error(`Error fetching sentiment: ${response.statusText}`);
      }
      const data = await response.json();
      setSentimentData(data);
    } catch (err) {
      console.error('Error fetching sentiment data:', err);
      setError('Failed to load market sentiment data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSentiment();
  }, [symbol]);
  
  const getEmotionIcon = (emotion: 'positive' | 'negative' | 'neutral') => {
    if (emotion === 'positive') {
      return <TrendingUp className="h-10 w-10 text-green-500" />;
    } else if (emotion === 'negative') {
      return <TrendingDown className="h-10 w-10 text-red-500" />;
    } else {
      return <BarChart2 className="h-10 w-10 text-yellow-500" />;
    }
  };
  
  const getEmotionColor = (emotion: 'positive' | 'negative' | 'neutral') => {
    if (emotion === 'positive') {
      return 'text-green-500';
    } else if (emotion === 'negative') {
      return 'text-red-500';
    } else {
      return 'text-yellow-500';
    }
  };
  
  const getScoreDescription = (score: number) => {
    if (score > 3) {
      return "Strongly Bullish";
    } else if (score > 1) {
      return "Moderately Bullish";  
    } else if (score > -1) {
      return "Neutral";
    } else if (score > -3) {
      return "Moderately Bearish";
    } else {
      return "Strongly Bearish";
    }
  };
  
  // If there's an error, display error message
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-destructive text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchSentiment}>
          Retry
        </Button>
      </div>
    );
  }
  
  // If loading, display loading spinner
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!sentimentData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No sentiment data available</p>
      </div>
    );
  }
  
  // Map the score to a range for the progress bar (0-100)
  const normalizedScore = ((sentimentData.score + 5) / 10) * 100;
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold">
            {getMarketIndexName(locale, symbol)} News Sentiment
          </h3>
          <p className="text-xs text-muted-foreground">
            NLP Analysis on market news
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchSentiment}
          className="h-8 text-xs"
        >
          Refresh Analysis
        </Button>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 mb-6">
          {getEmotionIcon(sentimentData.emotion)}
          <h3 className={`text-lg font-bold ${getEmotionColor(sentimentData.emotion)}`}>
            {getScoreDescription(sentimentData.score)}
          </h3>
        </div>
        
        <div className="w-full space-y-5 max-w-md">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs text-red-400">Bearish</div>
              <div className="text-xs text-yellow-400">Neutral</div>
              <div className="text-xs text-green-400">Bullish</div>
            </div>
            <div className="h-2 w-full bg-muted relative rounded-full overflow-hidden">
              <div 
                className={`h-2 ${
                  sentimentData.score > 1 ? 'bg-green-400' : 
                  sentimentData.score < -1 ? 'bg-red-400' : 
                  'bg-yellow-400'
                }`}
                style={{ width: `${normalizedScore}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-xs">Sentiment Score</div>
              <div className="text-xs font-medium">{sentimentData.score.toFixed(1)} / 5.0</div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs">Analysis Confidence</div>
              <div className="text-xs font-medium">{Math.round(sentimentData.confidence * 100)}%</div>
            </div>
            
            <Progress value={sentimentData.confidence * 100} className="h-1.5" />
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-xs text-muted-foreground text-center">
          Sentiment analysis performed with NLP on recent market news and trends
        </p>
      </div>
    </div>
  );
}