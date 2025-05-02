import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { Chat, Goal, User } from "@shared/schema";

// Import MCP types and utilities
import { 
  PortfolioModel, 
  PortfolioContext, 
  PortfolioAction 
} from './types';
import { 
  createPortfolioModel, 
  portfolioModelOperations 
} from './model';
import { 
  createPortfolioProtocol, 
  createDefaultContext,
  PortfolioProtocol 
} from './protocol';

// Enhanced PortfolioChart with MCP support
export interface PortfolioChartMCPProps {
  userId: number;
  marketCondition?: 'bullish' | 'bearish' | 'neutral';
  onPortfolioChange?: (portfolio: any) => void;
}

export default function PortfolioChartMCP({ 
  userId, 
  marketCondition = 'neutral',
  onPortfolioChange 
}: PortfolioChartMCPProps) {
  // Keep track of the protocol instance
  const [protocol, setProtocol] = useState<PortfolioProtocol | null>(null);
  
  // Chart data derived from portfolio model
  const [portfolioData, setPortfolioData] = useState<Array<{ name: string; value: number }>>([]);
  
  // Use the existing data fetching logic
  const { data: chatHistory = [] } = useQuery<Chat[]>({
    queryKey: [`/api/chat/${userId}/history`],
  });
  
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: [`/api/users/${userId}/goals`],
  });
  
  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });
  
  // Initialize the MCP protocol
  useEffect(() => {
    if (!user) return;
    
    // Get the latest recommendation with portfolio data
    const latestChat = chatHistory[chatHistory.length - 1];
    let initialAllocation;
    
    try {
      if (latestChat?.response) {
        const recommendation = JSON.parse(latestChat.response);
        // Only create portfolio data if we have a valid portfolio structure
        if (recommendation?.type === 'portfolio' && recommendation?.portfolio) {
          initialAllocation = {
            equity: recommendation.portfolio.equity,
            debt: recommendation.portfolio.debt,
            gold: recommendation.portfolio.gold,
            cash: recommendation.portfolio.cash
          };
        }
      }
    } catch (error) {
      console.error("Error parsing portfolio data:", error);
    }
    
    // Create initial model
    const initialModel = createPortfolioModel(
      userId,
      user.riskProfile || 'moderate',
      initialAllocation ? { currentAllocation: initialAllocation, baseAllocation: initialAllocation } : undefined
    );
    
    // Create initial context
    const initialContext = createDefaultContext();
    
    // Create protocol
    const portfolioProtocol = createPortfolioProtocol(initialModel, initialContext);
    
    // Set protocol
    setProtocol(portfolioProtocol);
    
    // Subscribe to state changes
    const unsubscribe = portfolioProtocol.subscribe(({ model }) => {
      // Update chart data when model changes
      const newPortfolioData = [
        { name: "Equity", value: model.baseAllocation.equity },
        { name: "Debt", value: model.baseAllocation.debt },
        { name: "Gold", value: model.baseAllocation.gold },
        { name: "Cash", value: model.baseAllocation.cash },
      ].filter(item => item.value > 0); // Only include non-zero allocations
      
      setPortfolioData(newPortfolioData);
      
      // Notify parent if needed
      if (onPortfolioChange) {
        onPortfolioChange(model.baseAllocation);
      }
    });
    
    // Clean up subscription
    return () => {
      unsubscribe();
    };
  }, [userId, user, chatHistory, onPortfolioChange]);
  
  // Respond to market condition changes
  useEffect(() => {
    if (protocol && marketCondition) {
      // Optimize portfolio based on market condition
      protocol.dispatch({
        type: 'OPTIMIZE_PORTFOLIO',
        payload: { marketCondition }
      });
    }
  }, [protocol, marketCondition]);
  
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

  // Return early if no valid portfolio data
  if (!portfolioData || portfolioData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground text-center">
          Loading portfolio recommendation...
        </p>
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