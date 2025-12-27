import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import TopAppBar from "@/components/top-app-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TriangleAlert, DollarSignIcon, ShoppingCartIcon, UsersIcon, ShareIcon, PlusIcon, CreditCard, Wallet, PiggyBank, Building2, TrendingUpIcon } from "lucide-react";
import { generateSocialPost } from "@/lib/social-sharing";
import { useToast } from "@/hooks/use-toast";
import AddAccountModal from "@/components/add-account-modal";
import type { Account } from "@shared/schema";

interface DashboardData {
  allergyCount: number;
  monthlyExpenses: number;
  recentActivities: Array<{
    id: number;
    type: string;
    title: string;
    description: string;
    amount?: number;
    icon: string;
    color: string;
    tags?: string[];
    date: string;
  }>;
  activeBillSplits: Array<{
    id: number;
    title: string;
    totalAmount: number;
    participants: number[];
    isSettled: boolean;
    date: string;
  }>;
  accounts: Account[];
  totalBalance: number;
}

export default function Dashboard() {
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const { data: achievements } = useQuery<{
    allergensAvoided: number;
    safePurchases: number;
    monthsSafe: number;
  }>({
    queryKey: ["/api/achievements"],
  });

  const handleShare = (platform: string) => {
    if (!achievements) return;
    
    const post = generateSocialPost(achievements);
    
    // In a real app, this would open the social platform's sharing interface
    navigator.clipboard.writeText(post);
    toast({
      title: "Share text copied!",
      description: "Paste it on your favorite social platform.",
    });
  };

  const getAccountIcon = (iconName: string) => {
    switch (iconName) {
      case "CreditCard":
        return CreditCard;
      case "Wallet":
        return Wallet;
      case "PiggyBank":
        return PiggyBank;
      case "Building2":
        return Building2;
      default:
        return CreditCard;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <TopAppBar />
        <div className="p-4">
          <div className="space-y-4">
            <div className="h-8 bg-neutral-100 rounded animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-neutral-100 rounded animate-pulse"></div>
              <div className="h-24 bg-neutral-100 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <TopAppBar />
      
      <main className="pb-4">
        {/* Dashboard Overview */}
        <section className="p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-medium text-neutral-900 mb-2">Dashboard</h2>
            <p className="text-neutral-500 text-sm">Track your budgets and spending</p>
          </div>

          {/* Balance Overview */}
          <Card className="bg-gradient-to-r from-primary to-secondary text-white border-0 card-shadow mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/80 text-sm">Total Balance</p>
                  <p className="text-3xl font-bold">
                    ${dashboardData?.totalBalance?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUpIcon className="h-5 w-5 text-white/80" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="bg-white/20 text-white hover:bg-white/30"
                    onClick={() => setIsAddAccountModalOpen(true)}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Grid */}
          {dashboardData?.accounts && dashboardData.accounts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Your Accounts</h3>
              <div className="grid grid-cols-2 gap-3">
                {dashboardData.accounts.map((account) => {
                  const IconComponent = getAccountIcon(account.icon);
                  return (
                    <Card key={account.id} className="border-neutral-100 card-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            account.color === 'primary' ? 'bg-primary/10' :
                            account.color === 'secondary' ? 'bg-secondary/10' :
                            account.color === 'accent' ? 'bg-accent/10' :
                            'bg-red-100'
                          }`}>
                            <IconComponent className={`h-4 w-4 ${
                              account.color === 'primary' ? 'text-primary' :
                              account.color === 'secondary' ? 'text-secondary' :
                              account.color === 'accent' ? 'text-accent' :
                              'text-red-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs text-neutral-900 truncate">{account.name}</p>
                            <p className="text-xs text-neutral-500 capitalize">{account.type}</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-neutral-900">
                          ${account.balance.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-accent/10 border-accent/20 card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TriangleAlert className="h-5 w-5 text-accent" />
                  <span className="text-accent font-medium text-sm">BUDGET ALERTS</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900">
                  {dashboardData?.allergyCount || 0}
                </div>
                <div className="text-xs text-neutral-500">Budgets exceeded</div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/10 border-secondary/20 card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSignIcon className="h-5 w-5 text-secondary" />
                  <span className="text-secondary font-medium text-sm">EXPENSES</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900">
                  ${dashboardData?.monthlyExpenses?.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-neutral-500">This month</div>
              </CardContent>
            </Card>
          </div>

        </section>

        {/* Recent Activity */}
        <section className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-primary">View All</Button>
          </div>

          <div className="space-y-3">
            {dashboardData?.recentActivities?.map((activity) => (
              <Card key={activity.id} className="border-neutral-100 card-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.color === 'secondary' ? 'bg-secondary/10' :
                      activity.color === 'accent' ? 'bg-accent/10' :
                      'bg-primary/10'
                    }`}>
                      {activity.type === 'expense' && <ShoppingCartIcon className={`h-5 w-5 ${
                        activity.color === 'secondary' ? 'text-secondary' :
                        activity.color === 'accent' ? 'text-accent' :
                        'text-primary'
                      }`} />}
                      {activity.type === 'allergy_alert' && <TriangleAlert className="h-5 w-5 text-accent" />}
                      {activity.type === 'bill_split' && <UsersIcon className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-neutral-900 text-sm">{activity.title}</p>
                        {activity.amount && (
                          <span className={`font-medium text-sm ${
                            activity.color === 'secondary' ? 'text-secondary' :
                            activity.color === 'accent' ? 'text-accent' :
                            'text-primary'
                          }`}>
                            ${activity.amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-500 text-xs mt-1">{activity.description}</p>
                      {activity.tags && activity.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          {activity.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Social Sharing Section */}
        {achievements && (
          <section className="px-4 pb-8">
            <Card className="bg-gradient-to-r from-primary to-secondary text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Share Your Savings</h3>
                  <ShareIcon className="h-5 w-5" />
                </div>
                <p className="text-white/80 text-sm mb-4">
                  You've stayed within budget for {achievements.safePurchases} categories this month!
                </p>
                <div className="flex space-x-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="bg-white/20 text-white hover:bg-white/30"
                    onClick={() => handleShare('twitter')}
                  >
                    Tweet
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="bg-white/20 text-white hover:bg-white/30"
                    onClick={() => handleShare('instagram')}
                  >
                    Story
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="bg-white/20 text-white hover:bg-white/30"
                    onClick={() => handleShare('facebook')}
                  >
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
      
      <AddAccountModal 
        isOpen={isAddAccountModalOpen} 
        onClose={() => setIsAddAccountModalOpen(false)}
      />
    </div>
  );
}
