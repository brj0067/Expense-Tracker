import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import TopAppBar from "@/components/top-app-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCartIcon, FilterIcon, SearchIcon, TrashIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Expense } from "@shared/schema";

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [allergyFilter, setAllergyFilter] = useState("all");
  const { toast } = useToast();

  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Expense deleted",
        description: "The expense has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter expenses
  const filteredExpenses = expenses?.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    const matchesAllergy = allergyFilter === "all" || 
                          (allergyFilter === "safe" && expense.isAllergySafe) ||
                          (allergyFilter === "unsafe" && !expense.isAllergySafe);
    
    return matchesSearch && matchesCategory && matchesAllergy;
  }) || [];

  const categories = Array.from(new Set(expenses?.map(e => e.category) || []));
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

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
        <div className="mb-6">
          <h2 className="text-2xl font-medium text-neutral-900 mb-2">Expenses</h2>
          <p className="text-neutral-500 text-sm">Track your allergy-safe purchases</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex space-x-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={allergyFilter} onValueChange={setAllergyFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Allergy Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="safe">Allergy-Safe</SelectItem>
                <SelectItem value="unsafe">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary */}
        <Card className="border-neutral-100 card-shadow mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Total Filtered</p>
                <p className="text-2xl font-bold text-neutral-900">${totalAmount.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-500">Items</p>
                <p className="text-2xl font-bold text-neutral-900">{filteredExpenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        {filteredExpenses.length > 0 ? (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <Card key={expense.id} className="border-neutral-100 card-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <ShoppingCartIcon className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-neutral-900 text-sm">{expense.description}</p>
                        <span className="text-secondary font-medium text-sm">
                          ${expense.amount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-neutral-500 text-xs mt-1">
                        {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)} • 
                        {expense.isAllergySafe ? ' Allergy-safe products' : ' Standard products'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          {expense.isAllergySafe && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Allergy-Safe
                            </Badge>
                          )}
                          {expense.allergyTags?.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExpenseMutation.mutate(expense.id)}
                          disabled={deleteExpenseMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-expense-${expense.id}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-neutral-100 card-shadow">
            <CardContent className="p-8 text-center">
              <ShoppingCartIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No expenses found</h3>
              <p className="text-neutral-500 text-sm mb-4">
                {searchTerm || categoryFilter !== "all" || allergyFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "Start tracking your expenses to see them here."}
              </p>
              {(searchTerm || categoryFilter !== "all" || allergyFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setAllergyFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
