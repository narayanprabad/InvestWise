import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { Chat, Goal, User } from "@shared/schema";

// MCP (Model-Context-Protocol) Architecture Components:
// Model: Asset allocation algorithms and portfolio optimization
import { AssetAllocation } from './types';
import { calculateOptimalAllocation } from './utils';
// Context: Currency and locale-specific formatting
import { formatCurrency } from '@/lib/formatCurrency';

interface DynamicPortfolioChartProps {
  userId: number;
  marketCondition?: 'bullish' | 'bearish' | 'neutral';
  currency?: string;
}

export default function DynamicPortfolioChart({ 
  userId, 
  marketCondition = 'neutral',
  currency = 'INR'
}: DynamicPortfolioChartProps) {
  // Fetch user data
  const { data: userData } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  // Fetch user's goals
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: [`/api/users/${userId}/goals`],
  });
  
  // Fetch chat history to check for previous recommendations
  const { data: chatHistory = [] } = useQuery<Chat[]>({
    queryKey: [`/api/chat/${userId}/history`],
  });

  // Portfolio allocation state
  const [portfolioData, setPortfolioData] = useState<any[]>([]);

  useEffect(() => {
    // Protocol implementation: Communication between model and view components
    // This function orchestrates data flow from user context to visualization
    if (userData) {
      // Determine risk profile from user context
      const riskProfile = userData.riskProfile || 'moderate';
      
      // Model: Apply optimization algorithm based on risk profile and market conditions
      const allocation = calculateOptimalAllocation(riskProfile, marketCondition);
      
      // Transform model output into visualization-ready format
      const chartData = [
        { name: "Equity", value: allocation.equity },
        { name: "Debt", value: allocation.debt },
        { name: "Gold", value: allocation.gold },
        { name: "Cash", value: allocation.cash },
      ].filter(item => item.value > 0);
      
      setPortfolioData(chartData);
    }
  }, [userData, marketCondition]);

  // Enhanced color scheme with investment-specific colors
  const COLORS = {
    equity: "hsl(210, 100%, 50%)", // Vibrant blue for equity
    debt: "hsl(150, 100%, 35%)",   // Rich green for debt
    gold: "hsl(45, 100%, 50%)",    // Bright gold for gold
    cash: "hsl(220, 15%, 60%)"     // Neutral gray for cash
  };

  const getColor = (index: number) => {
    switch(index) {
      case 0: return COLORS.equity;
      case 1: return COLORS.debt;
      case 2: return COLORS.gold;
      case 3: return COLORS.cash;
      default: return COLORS.equity;
    }
  };

  // Return early if no valid portfolio data and no goals
  if (portfolioData.length === 0 && !userData) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground text-center">
          Loading portfolio recommendation...
        </p>
      </div>
    );
  }

  // Safety check to avoid render issues if we don't have data
  if (portfolioData.length === 0) {
    // Create default allocation based on market condition
    const defaultEquity = marketCondition === 'bullish' ? 70 : marketCondition === 'bearish' ? 40 : 55;
    const defaultDebt = marketCondition === 'bullish' ? 20 : marketCondition === 'bearish' ? 35 : 25;
    const defaultGold = marketCondition === 'bullish' ? 5 : marketCondition === 'bearish' ? 15 : 12;
    const defaultCash = marketCondition === 'bullish' ? 5 : marketCondition === 'bearish' ? 10 : 8;
    
    const defaultData = [
      { name: "Equity", value: defaultEquity },
      { name: "Debt", value: defaultDebt },
      { name: "Gold", value: defaultGold },
      { name: "Cash", value: defaultCash },
    ];
    
    return (
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={defaultData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
            >
              {defaultData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(index)}
                  className="stroke-background hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}%`, 'Allocation']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem'
              }}
            />
            <Legend 
              formatter={(value) => (
                <span className="text-sm font-medium">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={portfolioData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
          >
            {portfolioData.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getColor(index)}
                className="stroke-background hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}%`, 'Allocation']}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
          />
          <Legend 
            formatter={(value) => (
              <span className="text-sm font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}