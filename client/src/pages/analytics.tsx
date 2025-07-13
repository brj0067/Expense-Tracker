import { useQuery } from "@tanstack/react-query";
import TopAppBar from "@/components/top-app-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, AlertTriangleIcon, DollarSignIcon, CalendarIcon } from "lucide-react";
import type { Expense, Allergy } from "@shared/schema";

export default function Analytics() {
  const { data: expenses, isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: allergies, isLoading: allergiesLoading } = useQuery<Allergy[]>({
    queryKey: ["/api/allergies"],
  });

  const isLoading = expensesLoading || allergiesLoading;

  // Calculate analytics
  const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const allergySafeExpenses = expenses?.filter(e => e.isAllergySafe) || [];
  const allergySafePercentage = expenses?.length ? (allergySafeExpenses.length / expenses.length) * 100 : 0;
  
  const categoryBreakdown = expenses?.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>) || {};

  const severityBreakdown = allergies?.reduce((acc, allergy) => {
    acc[allergy.severity] = (acc[allergy.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <TopAppBar />
        <div className="p-4 space-y-4">
          <div className="h-8 bg-neutral-100 rounded animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-neutral-100 rounded animate-pulse"></div>
            <div className="h-32 bg-neutral-100 rounded animate-pulse"></div>
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
          <h2 className="text-2xl font-medium text-neutral-900 mb-2">Analytics</h2>
          <p className="text-neutral-500 text-sm">Insights into your allergy management and spending</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-neutral-100 card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSignIcon className="h-5 w-5 text-secondary" />
                <TrendingUpIcon className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                ${totalExpenses.toFixed(2)}
              </div>
              <div className="text-xs text-neutral-500">Total Expenses</div>
            </CardContent>
          </Card>

          <Card className="border-neutral-100 card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangleIcon className="h-5 w-5 text-green-500" />
                <span className="text-green-500 text-xs font-medium">SAFE</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {allergySafePercentage.toFixed(0)}%
              </div>
              <div className="text-xs text-neutral-500">Allergy-Safe Purchases</div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Categories */}
        <Card className="border-neutral-100 card-shadow mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Expense Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(categoryBreakdown).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(amount / totalExpenses) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Allergy Severity Breakdown */}
        <Card className="border-neutral-100 card-shadow mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Allergy Severity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(severityBreakdown).map(([severity, count]) => (
              <div key={severity} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    severity === 'severe' ? 'bg-red-500' :
                    severity === 'moderate' ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">{severity}</span>
                </div>
                <Badge variant={
                  severity === 'severe' ? 'destructive' :
                  severity === 'moderate' ? 'default' :
                  'secondary'
                }>
                  {count} allergen{count !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Trends */}
        <Card className="border-neutral-100 card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Safe Shopping Days</span>
              </div>
              <span className="text-green-600 font-bold">
                {allergySafeExpenses.length} / {expenses?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangleIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Allergens Avoided</span>
              </div>
              <span className="text-blue-600 font-bold">
                {allergies?.length || 0} types tracked
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
