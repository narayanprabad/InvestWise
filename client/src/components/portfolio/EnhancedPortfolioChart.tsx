import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DynamicPortfolioChart from './advanced/DynamicPortfolioChart';
import InvestmentOptionsAccordion from './InvestmentOptionsAccordion';

interface EnhancedPortfolioChartProps {
  userId: number;
  marketCondition?: 'bullish' | 'bearish' | 'neutral';
  selectedLocale?: string;
  currency?: string;
}

export default function EnhancedPortfolioChart({ 
  userId, 
  marketCondition = 'neutral',
  selectedLocale = 'IN',
  currency = 'INR'
}: EnhancedPortfolioChartProps) {
  // Using the Model-Context-Protocol architecture for investment allocation
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-sm font-medium">
          Portfolio Allocation
        </h3>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p className="text-xs">
                Intelligent portfolio allocation based on market conditions, 
                risk profile, investment goals, and time horizon using modern portfolio theory.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Mobile-first layout - stacked on small screens, side-by-side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio chart always shows on top in mobile, left in desktop */}
        <div className="flex flex-col justify-center">
          <DynamicPortfolioChart userId={userId} marketCondition={marketCondition} currency={currency} />
        </div>
        
        {/* Allocation and investment options show below in mobile, right in desktop */}
        <div className="flex flex-col space-y-4">
          {/* Visual allocation strategy with percentage bars */}
          <div className="bg-muted/30 rounded-md p-4">
            <h3 className="text-sm font-medium mb-3">Asset Allocation Strategy</h3>
            <div className="space-y-3">
              {/* Equity */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-blue-700">Equity</span>
                  <span className="text-xs font-bold">55%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: '55%' }}
                  ></div>
                </div>
              </div>
              
              {/* Debt */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-green-700">Debt</span>
                  <span className="text-xs font-bold">25%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: '25%' }}
                  ></div>
                </div>
              </div>
              
              {/* Gold */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-amber-700">Gold</span>
                  <span className="text-xs font-bold">12%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: '12%' }}
                  ></div>
                </div>
              </div>
              
              {/* Cash */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-700">Cash</span>
                  <span className="text-xs font-bold">8%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-500 rounded-full" 
                    style={{ width: '8%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Investment options accordion */}
          <div className="border border-border rounded-md overflow-hidden">
            <InvestmentOptionsAccordion locale={selectedLocale} />
          </div>
        </div>
      </div>
    </div>
  );
}