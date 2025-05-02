import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertUserSchema } from "@shared/schema";

// Major cities with states/regions
const CITIES = [
  { value: "mumbai_mh", label: "Mumbai, Maharashtra", country: "IN" },
  { value: "delhi_dl", label: "Delhi, NCR", country: "IN" },
  { value: "bangalore_ka", label: "Bangalore, Karnataka", country: "IN" },
  { value: "chennai_tn", label: "Chennai, Tamil Nadu", country: "IN" },
  { value: "kolkata_wb", label: "Kolkata, West Bengal", country: "IN" },
  { value: "hyderabad_ts", label: "Hyderabad, Telangana", country: "IN" },
  { value: "newyork_ny", label: "New York, NY", country: "US" },
  { value: "sanfrancisco_ca", label: "San Francisco, CA", country: "US" },
  { value: "london_uk", label: "London, UK", country: "UK" },
  { value: "singapore_sg", label: "Singapore", country: "SG" }
];

interface RiskAssessmentProps {
  onSubmit: (data: z.infer<typeof insertUserSchema>) => void;
  isLoading?: boolean;
}

export default function RiskAssessment({ onSubmit, isLoading }: RiskAssessmentProps) {
  const form = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      age: 30,
      location: "",
      riskProfile: "moderate",
      goals: []
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="riskProfile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Risk Profile</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your risk tolerance" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Profile..." : "Create Profile"}
        </Button>
      </form>
    </Form>
  );
}