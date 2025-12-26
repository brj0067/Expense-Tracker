import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Allergies from "@/pages/allergies";
import Expenses from "@/pages/expenses";
import Roommates from "@/pages/roommates";
import Profile from "@/pages/profile";
import Pricing from "@/pages/pricing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import NotFound from "@/pages/not-found";
import BottomNavigation from "@/components/bottom-navigation";
import FloatingActionButton from "@/components/floating-action-button";
import { useState } from "react";
import AddExpenseModal from "@/components/add-expense-modal";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="*" component={Login} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/allergies" component={Allergies} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/roommates" component={Roommates} />
      <Route path="/profile" component={Profile} />
      <Route path="/pricing" component={Pricing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  if (!user) {
    return <Router />;
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-lg relative">
      <Router />
      <FloatingActionButton onClick={() => setIsAddExpenseModalOpen(true)} />
      <BottomNavigation />
      <AddExpenseModal 
        isOpen={isAddExpenseModalOpen} 
        onClose={() => setIsAddExpenseModalOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
