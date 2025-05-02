import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { goalSchema, type Goal, type User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency, getCurrencySymbol } from "@/lib/formatCurrency";

interface GoalManagerProps {
  userId: number;
  currency?: string;
}

// Function to generate goal-specific portfolio allocation
const getPortfolioAllocationForGoal = (goal: Goal) => {
  let equity = 50;
  let debt = 30;
  let gold = 10;
  let cash = 10;
  
  // Adjust based on timeframe - more time means more equity
  if (goal.timeframe > 15) {
    equity = 70;
    debt = 20;
    gold = 5;
    cash = 5;
  } else if (goal.timeframe < 5) {
    equity = 30;
    debt = 40;
    gold = 15;
    cash = 15;
  }
  
  // Adjust based on goal type
  if (goal.type === "education") {
    if (goal.timeframe < 3) {
      equity = 20;
      debt = 50;
      gold = 15;
      cash = 15;
    }
  } else if (goal.type === "homebuying") {
    if (goal.timeframe < 3) {
      equity = 20;
      debt = 45;
      gold = 20;
      cash = 15;
    }
  }
  
  return [
    { name: "Equity", value: equity },
    { name: "Debt", value: debt },
    { name: "Gold", value: gold },
    { name: "Cash", value: cash },
  ];
};

// Mini PieChart component for goals
function GoalPieChart({ goal }: { goal: Goal }) {
  const portfolioData = getPortfolioAllocationForGoal(goal);
  
  // Enhanced color scheme
  const COLORS = {
    equity: "hsl(210, 100%, 50%)", // blue
    debt: "hsl(150, 100%, 35%)",   // green
    gold: "hsl(45, 100%, 50%)",    // gold
    cash: "hsl(220, 15%, 60%)"     // gray
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

  return (
    <div className="h-[160px] w-full mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsChart>
          <Pie
            data={portfolioData}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={50}
            paddingAngle={5}
            dataKey="value"
            label={({ name, value }) => `${value}%`}
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
              <span className="text-xs font-medium">{value}</span>
            )}
            iconSize={8}
            layout="horizontal"
            verticalAlign="bottom"
          />
        </RechartsChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function GoalManager({ userId, currency = 'INR' }: GoalManagerProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get user data to detect currency
  const { data: userData } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });
  
  // Use user's currency if available, otherwise use the provided currency
  const userCurrency = userData?.currency || currency;
  const currencySymbol = getCurrencySymbol(userCurrency);

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: [`/api/users/${userId}/goals`],
  });

  const form = useForm<Goal>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      type: "retirement",
      targetAmount: 1000000,
      timeframe: 10,
      description: ""
    }
  });

  const addGoal = useMutation({
    mutationFn: async (goal: Goal) => {
      const response = await apiRequest("POST", `/api/users/${userId}/goals`, {
        goals: [...goals, goal]
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/goals`] });
      // Also invalidate chat history to show new recommendation
      queryClient.invalidateQueries({ queryKey: [`/api/chat/${userId}/history`] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Goal Added",
        description: "Your investment goal has been added and a new recommendation has been generated. Feel free to ask questions about the strategy in the chat!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Investment Goals</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Investment Goal</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => addGoal.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="retirement">Retirement</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="homebuying">Home Buying</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Amount ({currencySymbol})</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeframe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeframe (years)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={addGoal.isPending}>
                  {addGoal.isPending ? "Adding Goal..." : "Add Goal"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div
            key={index}
            className="bg-card p-4 rounded-lg border"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium capitalize">{goal.type}</h4>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(goal.targetAmount, userCurrency)}</p>
                <p className="text-sm text-muted-foreground">{goal.timeframe} years</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <h5 className="text-sm font-medium flex items-center">
                <PieChart className="h-4 w-4 mr-1 text-primary" />
                Suggested Allocation
              </h5>
              <GoalPieChart goal={goal} />
            </div>
          </div>
        ))}

        {goals.length === 0 && (
          <p className="text-muted-foreground text-center py-4">No goals added yet</p>
        )}
      </div>
    </div>
  );
}