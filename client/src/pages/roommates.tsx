import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import TopAppBar from "@/components/top-app-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon, UsersIcon, UserIcon, CalculatorIcon, CheckIcon } from "lucide-react";
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
      participants: [],
      splitType: "equal",
    },
  });

  const createRoommateMutation = useMutation({
    mutationFn: async (data: RoommateFormData) => {
      const avatar = data.name.charAt(0).toUpperCase();
      const response = await apiRequest("POST", "/api/roommates", { ...data, avatar });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roommates"] });
      setIsRoommateDialogOpen(false);
      roommateForm.reset();
      toast({
        title: "Roommate added",
        description: "Your roommate has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add roommate. Please try again.",
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
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsBillSplitDialogOpen(false);
      billSplitForm.reset();
      toast({
        title: "Bill split created",
        description: "The bill has been split successfully.",
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

  const settleBillMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/bill-splits/${id}/settle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bill-splits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Bill settled",
        description: "The bill has been marked as settled.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to settle bill. Please try again.",
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
      <div className="min-h-screen pb-20">
        <TopAppBar />
        <div className="p-4 space-y-4">
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
    <div className="min-h-screen pb-20">
      <TopAppBar />
      
      <main className="p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-medium text-neutral-900 mb-2">Roommates</h2>
          <p className="text-neutral-500 text-sm">Manage roommates and split bills</p>
        </div>

        {/* Roommates Section */}
        <Card className="border-neutral-100 card-shadow mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Your Roommates</CardTitle>
              <Dialog open={isRoommateDialogOpen} onOpenChange={setIsRoommateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-10 h-10 rounded-full p-0">
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Roommate</DialogTitle>
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
                              <Input placeholder="Roommate's name" {...field} />
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
                              <Input placeholder="roommate@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex space-x-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setIsRoommateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={createRoommateMutation.isPending}
                        >
                          {createRoommateMutation.isPending ? "Adding..." : "Add Roommate"}
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
                      <span className="text-white font-medium">{roommate.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-neutral-900">{roommate.name}</p>
                      {roommate.email && (
                        <p className="text-xs text-neutral-500">{roommate.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-500 text-sm">No roommates added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bill Splits Section */}
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
                    <DialogTitle>Create Bill Split</DialogTitle>
                  </DialogHeader>
                  <Form {...billSplitForm}>
                    <form onSubmit={billSplitForm.handleSubmit(onSubmitBillSplit)} className="space-y-4">
                      <FormField
                        control={billSplitForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bill Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Dinner, Groceries, Utilities" {...field} />
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
                      <FormField
                        control={billSplitForm.control}
                        name="participants"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Participants</FormLabel>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value.includes(1)}
                                  onChange={(e) => {
                                    const participants = e.target.checked 
                                      ? [...field.value, 1]
                                      : field.value.filter(id => id !== 1);
                                    field.onChange(participants);
                                  }}
                                />
                                <span className="text-sm">You</span>
                              </div>
                              {roommates?.map((roommate) => (
                                <div key={roommate.id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={field.value.includes(roommate.id)}
                                    onChange={(e) => {
                                      const participants = e.target.checked 
                                        ? [...field.value, roommate.id]
                                        : field.value.filter(id => id !== roommate.id);
                                      field.onChange(participants);
                                    }}
                                  />
                                  <span className="text-sm">{roommate.name}</span>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex space-x-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setIsBillSplitDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={createBillSplitMutation.isPending}
                        >
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
                {billSplits.map((split) => {
                  const userShare = split.totalAmount / split.participants.length;
                  return (
                    <div key={split.id} className="p-3 border border-neutral-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{split.title}</p>
                        <span className="text-primary font-medium text-sm">
                          ${split.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex -space-x-2">
                          {split.participants.slice(0, 3).map((participantId, index) => (
                            <div 
                              key={participantId} 
                              className="w-6 h-6 bg-primary rounded-full border-2 border-white flex items-center justify-center"
                            >
                              <span className="text-white text-xs font-medium">
                                {participantId === 1 ? 'Y' : roommates?.find(r => r.id === participantId)?.avatar || 'U'}
                              </span>
                            </div>
                          ))}
                        </div>
                        <span className="text-neutral-500 text-xs">
                          {split.participants.length} people
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        {split.isSettled ? (
                          <span className="text-green-600 text-xs font-medium flex items-center">
                            <CheckIcon className="h-3 w-3 mr-1" />
                            Settled
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => settleBillMutation.mutate(split.id)}
                            disabled={settleBillMutation.isPending}
                          >
                            Settle
                          </Button>
                        )}
                        <span className="text-neutral-500 text-xs">
                          Your share: ${userShare.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalculatorIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-500 text-sm">
                  {!roommates || roommates.length === 0 
                    ? "Add roommates first to start splitting bills"
                    : "No bill splits created yet"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
