import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

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

  return (
    <div className="min-h-screen max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6" data-testid="heading-profile">Profile</h1>
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="mb-4">
          <label className="text-sm text-gray-600">Email</label>
          <p className="text-lg font-medium" data-testid="text-email">{user.email}</p>
        </div>
      </div>
      <Button variant="destructive" className="w-full mt-6" onClick={handleLogout} data-testid="button-logout">
        Logout
      </Button>
    </div>
  );
}
