import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import TopAppBar from "@/components/top-app-bar";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  async function handleManageSubscription() {
    setIsLoadingPortal(true);
    try {
      const res = await fetch("/api/billing/create-portal-session", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        alert("Failed to open billing portal");
        return;
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      alert("Error opening billing portal");
    } finally {
      setIsLoadingPortal(false);
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <TopAppBar />
      
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-6" data-testid="heading-profile">Profile</h1>
        
        <div className="space-y-4">
          {/* Account Info */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="mb-4">
              <label className="text-sm text-gray-600">Email</label>
              <p className="text-lg font-medium" data-testid="text-email">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Plan</label>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium capitalize" data-testid="text-plan">{user.plan || "free"}</p>
                {user.plan === "pro" && <Badge className="bg-primary" data-testid="badge-pro">Pro</Badge>}
              </div>
            </div>
          </div>

          {/* Billing */}
          {user.plan === "free" && (
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate("/pricing")} data-testid="button-upgrade-profile">
              Upgrade to Pro
            </Button>
          )}

          {user.plan === "pro" && (
            <Button variant="outline" className="w-full" onClick={handleManageSubscription} disabled={isLoadingPortal} data-testid="button-manage-subscription-profile">
              {isLoadingPortal ? "Loading..." : "Manage Subscription"}
            </Button>
          )}

          {/* Logout */}
          <Button variant="destructive" className="w-full" onClick={handleLogout} data-testid="button-logout">
            Logout
          </Button>
        </div>
      </main>
    </div>
  );
}
