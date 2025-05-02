import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RiskAssessment from "@/components/profile/RiskAssessment";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertUser } from "@shared/schema";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createProfile = useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await apiRequest("POST", "/api/users", {
        ...data,
        goals: [] // Initialize with empty goals
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your investment profile has been created successfully."
      });
      setLocation("/");
    },
    onError: (error) => {
      console.error("Profile creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Investment Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskAssessment
            onSubmit={(data) => createProfile.mutate(data)}
            isLoading={createProfile.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}