import React, { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface MarketPredictionComponentProps {
  symbol: string;
  locale: string;
}

interface PredictionData {
  prediction: number[];
  confidence: number;
  trend: 'up' | 'down' | 'sideways';
}

export default function MarketPredictionComponent({ symbol, locale }: MarketPredictionComponentProps) {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
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
  
  const fetchPrediction = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/prediction/${encodeURIComponent(symbol)}`);
      if (!response.ok) {
        throw new Error(`Error fetching prediction: ${response.statusText}`);
      }
      const data = await response.json();
      setPredictionData(data);
    } catch (err) {
      console.error('Error fetching prediction data:', err);
      setError('Failed to load market prediction data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPrediction();
  }, [symbol]);
  
  const getChartData = () => {
    if (!predictionData) return [];
    
    const today = new Date();
    return predictionData.prediction.map((value, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(value * 100) / 100,
      };
    });
  };
  
  const getTrendDescription = (trend: 'up' | 'down' | 'sideways', confidence: number) => {
    const confidenceLevel = confidence > 0.7 ? 'high' : confidence > 0.4 ? 'moderate' : 'low';
    
    if (trend === 'up') {
      return `Bullish trend with ${confidenceLevel} confidence`;
    } else if (trend === 'down') {
      return `Bearish trend with ${confidenceLevel} confidence`;
    } else {
      return `Sideways market with ${confidenceLevel} confidence`;
    }
  };
  
  const getTrendColor = (trend: 'up' | 'down' | 'sideways') => {
    return trend === 'up' ? 'hsl(var(--success))' : 
           trend === 'down' ? 'hsl(var(--destructive))' : 
           'hsl(var(--muted-foreground))';
  };
  
  // If there's an error, display error message
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-destructive text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchPrediction}>
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
  
  if (!predictionData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No prediction data available</p>
      </div>
    );
  }
  
  const chartData = getChartData();
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-sm font-semibold">
            {getMarketIndexName(locale, symbol)}
          </h3>
          <p className="text-xs" style={{ color: getTrendColor(predictionData.trend) }}>
            {getTrendDescription(predictionData.trend, predictionData.confidence)}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchPrediction}
          className="h-8 text-xs"
        >
          Refresh Model
        </Button>
      </div>
      
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="5%" 
                  stopColor={getTrendColor(predictionData.trend)} 
                  stopOpacity={0.8}
                />
                <stop 
                  offset="95%" 
                  stopColor={getTrendColor(predictionData.trend)} 
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              dy={5}
            />
            <YAxis 
              orientation="right"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value.toLocaleString()}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              dx={5}
            />
            <Tooltip 
              formatter={(value: number) => [value.toLocaleString(), 'Predicted Value']}
              labelFormatter={(label) => `Forecast: ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                fontSize: 12,
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={getTrendColor(predictionData.trend)} 
              fillOpacity={0.2}
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-1">
        <p className="text-xs text-muted-foreground text-center">
          5-day prediction generated with ML regression model (confidence: {Math.round(predictionData.confidence * 100)}%)
        </p>
      </div>
    </div>
  );
}