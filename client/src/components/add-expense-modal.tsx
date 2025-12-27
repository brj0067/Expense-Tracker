import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Allergy } from "@shared/schema";

const expenseFormSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  isAllergySafe: z.boolean(),
  allergyTags: z.array(z.string()),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  "groceries",
  "restaurants", 
  "healthcare",
  "household",
  "other"
];

export default function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: allergies } = useQuery<Allergy[]>({
    queryKey: ["/api/allergies"],
  });

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: 0,
      description: "",
      category: "",
      isAllergySafe: true,
      allergyTags: [],
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const response = await apiRequest("POST", "/api/expenses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      onClose();
      form.reset();
      setSelectedTags([]);
      toast({
        title: "Expense added",
        description: "Your expense has been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    createExpenseMutation.mutate({
      ...data,
      allergyTags: selectedTags,
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const commonTags = [
    "Gluten-free",
    "Dairy-free", 
    "Nut-free",
    "Egg-free",
    "Soy-free",
    "Vegan",
    "Organic"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      data-testid="input-amount"
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
                    <Input placeholder="What did you buy?" {...field} data-testid="input-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
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
              name="isAllergySafe"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Allergy-Safe Product</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="text-sm font-medium">Allergy Tags</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTag(tag)}
                    className="text-xs"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createExpenseMutation.isPending}
                data-testid="button-add-expense"
              >
                {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
