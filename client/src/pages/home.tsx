import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; 
import { useToast } from "../hooks/use-toast";
import ChatInterface from "@/components/chat/ChatInterface";
import EnhancedPortfolioChart from "@/components/portfolio/EnhancedPortfolioChart";
import type { MarketData, MarketCondition, User } from "@shared/schema";
import GoalManager from "@/components/goals/GoalManager";
import MarketPredictionComponent from "@/components/prediction/MarketPredictionComponent";
import SentimentAnalysisComponent from "@/components/prediction/SentimentAnalysisComponent";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowRight, 
  TrendingUp, 
  LogOut, 
  Users, 
  BarChart3, 
  PiggyBank,
  Repeat,
  UserCog,
  RefreshCcw
} from "lucide-react";

export default function Home() {
  const [userId, setUserId] = useState<number | null>(1); // Start with user 1
  const [selectedLocale, setSelectedLocale] = useState<string>("IN");
  const { toast } = useToast();
  
  // Fetch user data
  const { data: userData } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId
  });

  // Fetch market data for selected locale
  const { data: marketData, refetch: refetchMarketData } = useQuery<MarketData>({
    queryKey: ["/api/market/condition", selectedLocale],
    queryFn: async () => {
      const response = await fetch(`/api/market/condition?locale=${selectedLocale}`);
      if (!response.ok) {
        throw new Error("Failed to fetch market data");
      }
      return response.json();
    },
    refetchInterval: 300000 // 5 minutes
  });
  
  // Available locales
  const locales = [
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
    { code: "UK", name: "United Kingdom" },
    { code: "SG", name: "Singapore" }
  ];
  
  // Profile types
  const profileTypes = [
    { id: 1, name: "Conservative Investor", icon: <PiggyBank className="h-4 w-4" /> },
    { id: 2, name: "Moderate Investor", icon: <BarChart3 className="h-4 w-4" /> },
    { id: 3, name: "Aggressive Investor", icon: <TrendingUp className="h-4 w-4" /> },
    { id: 4, name: "Retirement Planner", icon: <Repeat className="h-4 w-4" /> }
  ];
  
  // Handle profile reset
  const handleResetProfile = () => {
    setUserId(null);
    toast({
      title: "Profile Reset",
      description: "Your investment profile has been reset.",
    });
  };
  
  // Handle profile switch
  const selectProfile = (id: number) => {
    setUserId(id);
    toast({
      title: "Profile Changed",
      description: `Switched to ${profileTypes.find(p => p.id === id)?.name || `profile #${id}`}`,
    });
  };
  
  // Handle locale change with automatic profile switching
  const changeLocale = (locale: string) => {
    setSelectedLocale(locale);
    
    // Auto-switch to a profile matching this locale
    let profileId = 1; // Default to Indian profile
    
    if (locale === 'US') profileId = 2;
    else if (locale === 'UK') profileId = 3;
    else if (locale === 'SG') profileId = 4;
    
    // Set the user ID to match the locale
    setUserId(profileId);
    
    // Refresh market data
    refetchMarketData();
    
    toast({
      title: "Market Location Changed",
      description: `Switched to ${locales.find(l => l.code === locale)?.name} market data and matching profile.`,
    });
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-4">
              Investment Advisor AI
            </h1>
            <p className="text-muted-foreground mb-6">
              Get personalized investment advice based on your profile and market conditions
            </p>
            <Link href="/profile">
              <Button className="w-full">
                Create New Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-sm mb-3">Select a demo profile:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {profileTypes.map(profile => (
                  <Button 
                    key={profile.id}
                    variant="outline" 
                    size="sm"
                    onClick={() => selectProfile(profile.id)}
                    className="flex items-center"
                  >
                    <span className="mr-2">{profile.icon}</span>
                    {profile.name}
                  </Button>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t flex flex-col items-center">
                <p className="text-xs text-muted-foreground mb-2">Want to test with different markets?</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {locales.map(locale => (
                    <Button 
                      key={locale.code}
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedLocale(locale.code);
                        selectProfile(1);
                      }}
                      className="text-xs px-2"
                    >
                      {locale.name} Market
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Investment Advisor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time personalized advice powered by AI
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Profile Options Dropdown */}
          <div className="dropdown-wrapper relative group">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                {userData?.name?.charAt(0) || <Users size={14} />}
              </div>
              <span>{userData?.name || "Profile Options"}</span>
            </Button>
            <div className="absolute right-0 mt-2 w-52 rounded-md shadow-lg bg-background border border-border hidden group-hover:block z-10">
              <div className="py-1 text-sm">
                <Link href="/profile">
                  <button className="block w-full text-left px-4 py-2 hover:bg-muted">
                    <UserCog className="inline mr-2 h-4 w-4" /> Edit Profile
                  </button>
                </Link>
                {profileTypes.map(profile => (
                  <button 
                    key={profile.id}
                    className="block w-full text-left px-4 py-2 hover:bg-muted"
                    onClick={() => selectProfile(profile.id)}
                  >
                    <span className="inline-block mr-2">{profile.icon}</span> {profile.name}
                  </button>
                ))}
                <Separator className="my-1" />
                <button 
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-muted"
                  onClick={handleResetProfile}
                >
                  <LogOut className="inline mr-2 h-4 w-4" /> Reset Profile
                </button>
              </div>
            </div>
          </div>
          
          {/* Market Region Selector */}
          <div className="dropdown-wrapper relative group">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>{locales.find(l => l.code === selectedLocale)?.name || "Select Region"}</span>
            </Button>
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border hidden group-hover:block z-10">
              <div className="py-1 text-sm">
                {locales.map(locale => (
                  <button 
                    key={locale.code}
                    className={`block w-full text-left px-4 py-2 hover:bg-muted ${
                      selectedLocale === locale.code ? 'bg-muted/70 font-medium' : ''
                    }`}
                    onClick={() => changeLocale(locale.code)}
                  >
                    {locale.name} Markets
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              refetchMarketData();
              toast({
                title: "Data Refreshed",
                description: "Market data and AI recommendations updated."
              });
            }}
          >
            <RefreshCcw size={16} className="mr-2" />
            Refresh Data
          </Button>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Portfolio Allocation
              </CardTitle>
              <CardDescription>
                Intelligent asset allocation based on your risk profile and market conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="min-h-[300px] lg:min-h-[400px]">
                <EnhancedPortfolioChart 
                  userId={userId} 
                  marketCondition={marketData?.condition || 'neutral'} 
                  selectedLocale={selectedLocale}
                  currency={userData?.currency}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Market Conditions
                </CardTitle>
                <CardDescription>
                  Real-time market data for {marketData?.locale || 'global'} markets
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {marketData && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Market Mood:</span>
                      <span className={`text-sm px-2 py-0.5 rounded-full ${
                        marketData.condition === 'bullish' 
                          ? 'bg-green-100 text-green-800' 
                          : marketData.condition === 'bearish'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {marketData.condition.charAt(0).toUpperCase() + marketData.condition.slice(1)}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {marketData.locale === 'IN' ? 'India VIX' : 'VIX'}:
                        </span>
                        <span className="text-sm font-medium">{marketData.indicators.volatilityIndex.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {marketData.locale === 'IN' ? 'NIFTY 50' : 'S&P 500'}:
                        </span>
                        <span className="text-sm font-medium">{marketData.indicators.mainIndex.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Trend:</span>
                        <span className={`text-sm ${
                          marketData.indicators.trend === 'up' 
                            ? 'text-green-600' 
                            : marketData.indicators.trend === 'down'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}>
                          {marketData.indicators.trend.charAt(0).toUpperCase() + marketData.indicators.trend.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {marketData.localIndices.map((index, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{index.name}:</span>
                        <span className={`text-sm ${index.change > 0 ? 'text-green-600' : index.change < 0 ? 'text-red-600' : ''}`}>
                          {index.value.toFixed(2)} ({index.change > 0 ? '+' : ''}{index.change.toFixed(2)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  Financial Goals
                </CardTitle>
                <CardDescription>
                  Track and manage your investment goals
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <GoalManager 
                  userId={userId} 
                  currency={userData?.currency} 
                />
              </CardContent>
            </Card>
          </div>
          
          {/* AI Market Prediction Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  AI Market Prediction
                </CardTitle>
                <CardDescription>
                  ML-powered 5-day forecast using polynomial regression
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[250px]">
                  {marketData ? (
                    <MarketPredictionComponent 
                      symbol={marketData.locale === 'IN' ? '^NSEI' : 
                              marketData.locale === 'US' ? '^GSPC' :
                              marketData.locale === 'UK' ? '^FTSE' : '^STI'} 
                      locale={marketData.locale}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-pulse text-center">
                        <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
                        <div className="mt-2 text-sm text-muted-foreground">Loading market prediction model...</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                  Sentiment Analysis
                </CardTitle>
                <CardDescription>
                  Natural language processing on market news
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[250px]">
                  {marketData ? (
                    <SentimentAnalysisComponent 
                      symbol={marketData.locale === 'IN' ? '^NSEI' : 
                              marketData.locale === 'US' ? '^GSPC' :
                              marketData.locale === 'UK' ? '^FTSE' : '^STI'} 
                      locale={marketData.locale}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-pulse text-center">
                        <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
                        <div className="mt-2 text-sm text-muted-foreground">Analyzing market sentiment...</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>

        <div className="space-y-6">
          <Card className="h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
            <CardHeader className="bg-muted/50 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                Investment Assistant
              </CardTitle>
              <CardDescription>
                Ask questions and get real-time investment advice
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-0 h-[calc(100vh-12rem)]">
              <div className="h-full overflow-hidden flex flex-col">
                <ChatInterface 
                  userId={userId}
                  selectedLocale={selectedLocale}
                  marketCondition={marketData?.condition}
                  userData={userData}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}