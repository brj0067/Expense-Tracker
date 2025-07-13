import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Allergies from "@/pages/allergies";
import Expenses from "@/pages/expenses";
import Roommates from "@/pages/roommates";
import NotFound from "@/pages/not-found";
import BottomNavigation from "@/components/bottom-navigation";
import FloatingActionButton from "@/components/floating-action-button";
import { useState } from "react";
import AddExpenseModal from "@/components/add-expense-modal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/allergies" component={Allergies} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/roommates" component={Roommates} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg relative">
          <Router />
          <FloatingActionButton onClick={() => setIsAddExpenseModalOpen(true)} />
          <BottomNavigation />
          <AddExpenseModal 
            isOpen={isAddExpenseModalOpen} 
            onClose={() => setIsAddExpenseModalOpen(false)}
          />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
