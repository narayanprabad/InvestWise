import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { Chat, Goal } from "@shared/schema";

interface PortfolioChartProps {
  userId: number;
}

export default function PortfolioChart({ userId }: PortfolioChartProps) {
  const { data: chatHistory = [] } = useQuery<Chat[]>({
    queryKey: [`/api/chat/${userId}/history`],
  });
  
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: [`/api/users/${userId}/goals`],
  });

  // Get the latest recommendation with portfolio data
  const latestChat = chatHistory[chatHistory.length - 1];
  let portfolioData;

  try {
    if (latestChat?.response) {
      const recommendation = JSON.parse(latestChat.response);
      // Only create portfolio data if we have a valid portfolio structure
      if (recommendation?.type === 'portfolio' && recommendation?.portfolio) {
        portfolioData = [
          { name: "Equity", value: recommendation.portfolio.equity },
          { name: "Debt", value: recommendation.portfolio.debt },
          { name: "Gold", value: recommendation.portfolio.gold },
          { name: "Cash", value: recommendation.portfolio.cash },
        ].filter(item => item.value > 0); // Only include non-zero allocations
      } else if (goals.length > 0 && !portfolioData) {
        // Create a default recommendation based on goals if no portfolio recommendation exists
        // This ensures we show a portfolio allocation as soon as goals are added
        
        // For simplicity, create a balanced portfolio based on the most recent goal's timeframe
        const latestGoal = goals[goals.length - 1];
        
        let equity = 50;
        let debt = 30;
        let gold = 10;
        let cash = 10;
        
        // Adjust based on timeframe - more time means more equity
        if (latestGoal.timeframe > 15) {
          equity = 70;
          debt = 20;
          gold = 5;
          cash = 5;
        } else if (latestGoal.timeframe < 5) {
          equity = 30;
          debt = 40;
          gold = 15;
          cash = 15;
        }
        
        portfolioData = [
          { name: "Equity", value: equity },
          { name: "Debt", value: debt },
          { name: "Gold", value: gold },
          { name: "Cash", value: cash },
        ];
      }
    } else if (goals.length > 0 && !portfolioData) {
      // If we have goals but no chat with a recommendation yet, create a default allocation
      const latestGoal = goals[goals.length - 1];
      
      let equity = 50;
      let debt = 30;
      let gold = 10;
      let cash = 10;
      
      // Adjust based on timeframe - more time means more equity
      if (latestGoal.timeframe > 15) {
        equity = 70;
        debt = 20;
        gold = 5;
        cash = 5;
      } else if (latestGoal.timeframe < 5) {
        equity = 30;
        debt = 40;
        gold = 15;
        cash = 15;
      }
      
      portfolioData = [
        { name: "Equity", value: equity },
        { name: "Debt", value: debt },
        { name: "Gold", value: gold },
        { name: "Cash", value: cash },
      ];
    }
  } catch (error) {
    console.error("Error parsing portfolio data:", error);
  }

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
  if ((!portfolioData || portfolioData.length === 0) && goals.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground text-center">
          No portfolio recommendation yet. Add investment goals to get started.
        </p>
      </div>
    );
  }

  // Safety check to avoid render issues if we don't have data somehow
  if (!portfolioData || portfolioData.length === 0) {
    portfolioData = [
      { name: "Equity", value: 60 },
      { name: "Debt", value: 30 },
      { name: "Gold", value: 5 },
      { name: "Cash", value: 5 },
    ];
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