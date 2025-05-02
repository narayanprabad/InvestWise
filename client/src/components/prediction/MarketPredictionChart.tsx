import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface MarketPredictionChartProps {
  symbol: string;
  locale: string;
}

interface PredictionData {
  prediction: number[];
  confidence: number;
  trend: 'up' | 'down' | 'sideways';
}

export default function MarketPredictionChart({ symbol, locale }: MarketPredictionChartProps) {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchPrediction() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/prediction/${symbol}?locale=${locale}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch prediction data');
        }
        
        const data = await response.json();
        setPredictionData(data);
      } catch (err) {
        console.error('Error fetching prediction:', err);
        setError('Unable to load prediction data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPrediction();
  }, [symbol, locale]);
  
  // Convert prediction data into chart format
  const chartData = React.useMemo(() => {
    if (!predictionData) return [];
    
    const today = new Date();
    
    return predictionData.prediction.map((value, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() + index);
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: value
      };
    });
  }, [predictionData]);
  
  return (
    <Card>
      <CardHeader className="bg-muted/50 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          5-Day Market Prediction
        </CardTitle>
        <CardDescription>
          AI-powered forecast based on polynomial regression model
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 h-[250px]">
        {isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
              <div className="mt-2 text-sm text-muted-foreground">Training ML model...</div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              {error}
            </div>
          </div>
        )}
        
        {!isLoading && !error && predictionData && (
          <div className="h-full">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-sm font-medium">AI Confidence: </span>
                <span className={`text-sm ${
                  predictionData.confidence > 0.7 ? 'text-green-600' : 
                  predictionData.confidence > 0.4 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(predictionData.confidence * 100)}%
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Predicted Trend: </span>
                <span className={`text-sm ${
                  predictionData.trend === 'up' ? 'text-green-600' : 
                  predictionData.trend === 'down' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {predictionData.trend.charAt(0).toUpperCase() + predictionData.trend.slice(1)}
                </span>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height="85%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 1%', 'dataMax + 1%']}
                />
                <Tooltip formatter={(value) => [Number(value).toFixed(2), 'Predicted Value']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={predictionData.trend === 'up' ? '#22c55e' : 
                          predictionData.trend === 'down' ? '#ef4444' : '#f59e0b'}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}