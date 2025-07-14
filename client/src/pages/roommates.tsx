import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import TopAppBar from "@/components/top-app-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  PlusIcon, UsersIcon, UserIcon, CalculatorIcon, CheckIcon, CrownIcon, 
  ShareIcon, FileTextIcon, TrendingUpIcon, TwitterIcon, SettingsIcon, 
  InfoIcon, HelpCircleIcon, GroupIcon, ReceiptIcon, BarChart3Icon,
  ExternalLinkIcon, MessageCircleIcon, PhoneIcon, MailIcon
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Roommate, BillSplit } from "@shared/schema";

const roommateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

const billSplitFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  totalAmount: z.number().min(0.01, "Amount must be greater than 0"),
  participants: z.array(z.number()).min(2, "At least 2 participants required"),
  splitType: z.enum(["equal", "custom"]),
});

type RoommateFormData = z.infer<typeof roommateFormSchema>;
type BillSplitFormData = z.infer<typeof billSplitFormSchema>;

export default function Roommates() {
  const [isRoommateDialogOpen, setIsRoommateDialogOpen] = useState(false);
  const [isBillSplitDialogOpen, setIsBillSplitDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: roommates, isLoading: roommatesLoading } = useQuery<Roommate[]>({
    queryKey: ["/api/roommates"],
  });

  const { data: billSplits, isLoading: billSplitsLoading } = useQuery<BillSplit[]>({
    queryKey: ["/api/bill-splits"],
  });

  const roommateForm = useForm<RoommateFormData>({
    resolver: zodResolver(roommateFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const billSplitForm = useForm<BillSplitFormData>({
    resolver: zodResolver(billSplitFormSchema),
    defaultValues: {
      title: "",
      totalAmount: 0,
      participants: [1], // Include user by default
      splitType: "equal",
    },
  });

  const createRoommateMutation = useMutation({
    mutationFn: async (data: RoommateFormData) => {
      const response = await apiRequest("POST", "/api/roommates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roommates"] });
      setIsRoommateDialogOpen(false);
      roommateForm.reset();
      toast({
        title: "Success",
        description: "Group member added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add group member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createBillSplitMutation = useMutation({
    mutationFn: async (data: BillSplitFormData) => {
      const response = await apiRequest("POST", "/api/bill-splits", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bill-splits"] });
      setIsBillSplitDialogOpen(false);
      billSplitForm.reset({ title: "", totalAmount: 0, participants: [1], splitType: "equal" });
      toast({
        title: "Success",
        description: "Bill split created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create bill split. Please try again.",
        variant: "destructive",
      });
    },
  });

  const settleBillSplitMutation = useMutation({
    mutationFn: async (billSplitId: number) => {
      const response = await apiRequest("PUT", `/api/bill-splits/${billSplitId}/settle`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bill-splits"] });
      toast({
        title: "Success",
        description: "Bill split settled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to settle bill split. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitRoommate = (data: RoommateFormData) => {
    createRoommateMutation.mutate(data);
  };

  const onSubmitBillSplit = (data: BillSplitFormData) => {
    createBillSplitMutation.mutate(data);
  };

  const isLoading = roommatesLoading || billSplitsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <TopAppBar />
        <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-4">
          <div className="h-8 bg-neutral-100 rounded animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-32 bg-neutral-100 rounded animate-pulse"></div>
            <div className="h-20 bg-neutral-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopAppBar />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h2 className="text-2xl font-medium text-neutral-900 mb-2">More</h2>
          <p className="text-neutral-500 text-sm">Manage your wallet, upgrade, and explore features</p>
        </div>

        <Tabs defaultValue="sharing" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="sharing" className="text-xs">
              <GroupIcon className="h-4 w-4 mr-1" />
              Share
            </TabsTrigger>
            <TabsTrigger value="investments" className="text-xs">
              <TrendingUpIcon className="h-4 w-4 mr-1" />
              Invest
            </TabsTrigger>
            <TabsTrigger value="records" className="text-xs">
              <ReceiptIcon className="h-4 w-4 mr-1" />
              Records
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <SettingsIcon className="h-4 w-4 mr-1" />
              More
            </TabsTrigger>
          </TabsList>

          {/* Group Sharing Tab */}
          <TabsContent value="sharing" className="space-y-4">
            <Card className="border-neutral-100 card-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Group Sharing</CardTitle>
                  <Dialog open={isRoommateDialogOpen} onOpenChange={setIsRoommateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="w-10 h-10 rounded-full p-0">
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Group Member</DialogTitle>
                        <DialogDescription>
                          Add a new member to your sharing group for bill splitting and expense tracking.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...roommateForm}>
                        <form onSubmit={roommateForm.handleSubmit(onSubmitRoommate)} className="space-y-4">
                          <FormField
                            control={roommateForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Member's name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={roommateForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="member@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex space-x-3 pt-4">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsRoommateDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={createRoommateMutation.isPending}>
                              {createRoommateMutation.isPending ? "Adding..." : "Add Member"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {roommates && roommates.length > 0 ? (
                  <div className="space-y-3">
                    {roommates.map((roommate) => (
                      <div key={roommate.id} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">{roommate.avatar || roommate.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{roommate.name}</p>
                          {roommate.email && <p className="text-sm text-neutral-500">{roommate.email}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GroupIcon className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 text-sm">No group members yet. Add your first member to start sharing expenses.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bill Splits */}
            <Card className="border-neutral-100 card-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Split Bills</CardTitle>
                  <Dialog open={isBillSplitDialogOpen} onOpenChange={setIsBillSplitDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={!roommates || roommates.length === 0} className="w-10 h-10 rounded-full p-0">
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Split New Bill</DialogTitle>
                        <DialogDescription>
                          Create a new bill split among your group members. Perfect for shared expenses like groceries, utilities, or dining out.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...billSplitForm}>
                        <form onSubmit={billSplitForm.handleSubmit(onSubmitBillSplit)} className="space-y-4">
                          <FormField
                            control={billSplitForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bill Description</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Grocery shopping, Dinner at restaurant" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={billSplitForm.control}
                            name="totalAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Amount</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="0.00" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex space-x-3 pt-4">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsBillSplitDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={createBillSplitMutation.isPending}>
                              {createBillSplitMutation.isPending ? "Creating..." : "Create Split"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {billSplits && billSplits.length > 0 ? (
                  <div className="space-y-3">
                    {billSplits.map((split) => (
                      <div key={split.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{split.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-neutral-500">${split.totalAmount.toFixed(2)}</span>
                            <span className="text-xs text-neutral-400">•</span>
                            <span className="text-sm text-neutral-500">{split.participants.length} people</span>
                          </div>
                        </div>
                        <Badge variant={split.isSettled ? "default" : "secondary"}>
                          {split.isSettled ? "Settled" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalculatorIcon className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 text-sm">No bill splits yet. Create your first split to share expenses with your group.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-4">
            <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0 card-shadow">
              <CardContent className="p-6">
                <div className="text-center">
                  <TrendingUpIcon className="h-12 w-12 mx-auto mb-4 text-white/80" />
                  <h3 className="text-xl font-bold mb-2">Start Investing</h3>
                  <p className="text-white/80 mb-4 text-sm">
                    Build wealth with smart investments. Perfect for students, professionals, and experienced traders.
                  </p>
                  <Button variant="secondary" className="w-full">
                    Explore Investment Options
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="border-neutral-100 card-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Stocks</p>
                  <p className="text-xs text-neutral-500">Trade shares</p>
                </CardContent>
              </Card>
              <Card className="border-neutral-100 card-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUpIcon className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <p className="text-sm font-medium">Crypto</p>
                  <p className="text-xs text-neutral-500">Digital assets</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-4">
            <Card className="border-neutral-100 card-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileTextIcon className="h-5 w-5 mr-2" />
                  Transaction Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <ReceiptIcon className="h-4 w-4 mr-2" />
                    View All Transactions
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    Export Records
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3Icon className="h-4 w-4 mr-2" />
                    Monthly Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings & More Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* Upgrade Section */}
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <CrownIcon className="h-5 w-5 mr-2" />
                      <span className="font-bold">Upgrade to Pro</span>
                    </div>
                    <p className="text-white/80 text-sm">Unlock premium features</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings Options */}
            <Card className="border-neutral-100 card-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    <SettingsIcon className="h-4 w-4 mr-3" />
                    Settings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <InfoIcon className="h-4 w-4 mr-3" />
                    About Wallet
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <HelpCircleIcon className="h-4 w-4 mr-3" />
                    Help & Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Follow Us */}
            <Card className="border-neutral-100 card-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <TwitterIcon className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircleIcon className="h-4 w-4 mr-2" />
                    Discord
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Help */}
            <Card className="border-neutral-100 card-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    <MailIcon className="h-4 w-4 mr-3" />
                    Contact Support
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <PhoneIcon className="h-4 w-4 mr-3" />
                    Call Us
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <ExternalLinkIcon className="h-4 w-4 mr-3" />
                    Privacy Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}