import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import TopAppBar from "@/components/top-app-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon, AlertTriangleIcon, BanIcon, InfoIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Allergy } from "@shared/schema";

const allergyFormSchema = z.object({
  name: z.string().min(1, "Allergy name is required"),
  severity: z.enum(["mild", "moderate", "severe"]),
  riskLevel: z.enum(["low", "medium", "high"]),
});

type AllergyFormData = z.infer<typeof allergyFormSchema>;

export default function Allergies() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: allergies, isLoading } = useQuery<Allergy[]>({
    queryKey: ["/api/allergies"],
  });

  const form = useForm<AllergyFormData>({
    resolver: zodResolver(allergyFormSchema),
    defaultValues: {
      name: "",
      severity: "mild",
      riskLevel: "low",
    },
  });

  const createAllergyMutation = useMutation({
    mutationFn: async (data: AllergyFormData) => {
      const response = await apiRequest("POST", "/api/allergies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/allergies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Allergy added",
        description: "Your allergy has been successfully tracked.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add allergy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAllergyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/allergies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/allergies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Allergy removed",
        description: "The allergy has been removed from your profile.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove allergy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AllergyFormData) => {
    createAllergyMutation.mutate(data);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "severe":
        return <BanIcon className="h-4 w-4 text-red-600" />;
      case "moderate":
        return <AlertTriangleIcon className="h-4 w-4 text-orange-600" />;
      default:
        return <InfoIcon className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <TopAppBar />
        <div className="p-4 space-y-4">
          <div className="h-8 bg-neutral-100 rounded animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-20 bg-neutral-100 rounded animate-pulse"></div>
            <div className="h-20 bg-neutral-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <TopAppBar />
      
      <main className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-medium text-neutral-900 mb-2">Allergy Profile</h2>
            <p className="text-neutral-500 text-sm">Manage your allergies and sensitivities</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-accent hover:bg-accent/90">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Allergy</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergy Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Peanuts, Dairy, Gluten" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="severe">Severe</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="riskLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select risk level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low Risk</SelectItem>
                            <SelectItem value="medium">Medium Risk</SelectItem>
                            <SelectItem value="high">High Risk</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createAllergyMutation.isPending}
                    >
                      {createAllergyMutation.isPending ? "Adding..." : "Add Allergy"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {allergies && allergies.length > 0 ? (
          <div className="space-y-3">
            {allergies.map((allergy) => (
              <Card key={allergy.id} className="border-neutral-100 card-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        allergy.severity === 'severe' ? 'bg-red-100' :
                        allergy.severity === 'moderate' ? 'bg-orange-100' :
                        'bg-yellow-100'
                      }`}>
                        {getSeverityIcon(allergy.severity)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-neutral-900">{allergy.name}</p>
                        <p className={`text-xs ${
                          allergy.severity === 'severe' ? 'text-red-600' :
                          allergy.severity === 'moderate' ? 'text-orange-600' :
                          'text-yellow-600'
                        }`}>
                          {allergy.severity.charAt(0).toUpperCase() + allergy.severity.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRiskBadgeVariant(allergy.riskLevel)}>
                        {allergy.riskLevel.charAt(0).toUpperCase() + allergy.riskLevel.slice(1)} Risk
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAllergyMutation.mutate(allergy.id)}
                        disabled={deleteAllergyMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-neutral-100 card-shadow">
            <CardContent className="p-8 text-center">
              <AlertTriangleIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No allergies tracked</h3>
              <p className="text-neutral-500 text-sm mb-4">
                Start by adding your allergies to better track safe products and expenses.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Allergy
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
