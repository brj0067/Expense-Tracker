import { Link, useLocation } from "wouter";
import { HomeIcon, Wallet, ReceiptIcon, Settings } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: HomeIcon, label: "Home" },
    { path: "/budgets", icon: Wallet, label: "Budgets" },
    { path: "/expenses", icon: ReceiptIcon, label: "Expenses" },
    { path: "/settings", icon: Settings, label: "More" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-neutral-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link
              key={path}
              href={path}
              className={`flex flex-col items-center p-3 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-neutral-500 hover:text-primary"
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
