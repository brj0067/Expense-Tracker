import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import TopAppBar from "@/components/top-app-bar";

export default function Pricing() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUpgrade = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        toast({ title: "Error", description: "Billing not available", variant: "destructive" });
        return;
      }

      const { sessionId, publishableKey } = await res.json();
      
      if (!publishableKey) {
        toast({ title: "Error", description: "Stripe not configured", variant: "destructive" });
        return;
      }

      const stripe = (window as any).Stripe;
      if (!stripe) {
        toast({ title: "Error", description: "Stripe library not loaded", variant: "destructive" });
        return;
      }

      await stripe(publishableKey).redirectToCheckout({ sessionId });
    } catch (error) {
      toast({ title: "Error", description: "Failed to start checkout", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <TopAppBar />
      
      <main className="p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-pricing">Pricing</h1>
          <p className="text-neutral-600">Choose the plan that works for you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card data-testid="card-free-plan">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For casual users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-4xl font-bold">$0</p>
                <p className="text-neutral-600 text-sm">Forever free</p>
              </div>

              <ul className="space-y-3">
                {["Track allergies", "Basic expense tracking", "View dashboard", "Limited account management"].map((feature) => (
                  <li key={feature} className="flex items-center gap-2" data-testid={`feature-free-${feature.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Check className="h-5 w-5 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {user?.plan === "free" ? (
                <Badge variant="secondary" className="w-full justify-center py-2" data-testid="badge-current-plan">
                  Current Plan
                </Badge>
              ) : (
                <Button variant="outline" className="w-full" data-testid="button-free-downgrade">
                  Downgrade
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-primary" data-testid="card-pro-plan">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>For power users</CardDescription>
                </div>
                <Badge className="bg-primary" data-testid="badge-popular">Popular</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-4xl font-bold">$9.99</p>
                <p className="text-neutral-600 text-sm">Per month</p>
              </div>

              <ul className="space-y-3">
                {[
                  "Everything in Free",
                  "Advanced analytics",
                  "Export reports",
                  "Unlimited accounts",
                  "Investment tracking",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2" data-testid={`feature-pro-${feature.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Check className="h-5 w-5 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {user?.plan === "pro" ? (
                <Button variant="secondary" className="w-full" data-testid="button-manage-subscription">
                  Manage Subscription
                </Button>
              ) : (
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleUpgrade} data-testid="button-upgrade">
                  Upgrade to Pro
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
