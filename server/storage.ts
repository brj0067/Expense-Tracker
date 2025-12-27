import { 
  users, allergies, expenses, roommates, billSplits, activities, accounts, budgets,
  type User, type InsertUser, type Allergy, type InsertAllergy,
  type Expense, type InsertExpense, type Roommate, type InsertRoommate,
  type BillSplit, type InsertBillSplit, type Activity, type InsertActivity,
  type Account, type InsertAccount, type Budget, type InsertBudget
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBilling(id: number, billing: { plan?: string; stripeCustomerId?: string; subscriptionStatus?: string }): Promise<User | undefined>;

  // Allergies
  getAllergiesByUserId(userId: number): Promise<Allergy[]>;
  createAllergy(allergy: InsertAllergy): Promise<Allergy>;
  updateAllergy(id: number, allergy: Partial<Allergy>): Promise<Allergy | undefined>;
  deleteAllergy(id: number): Promise<boolean>;

  // Expenses
  getExpensesByUserId(userId: number): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<Expense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  getMonthlyExpenseTotal(userId: number): Promise<number>;

  // Roommates
  getRoommatesByUserId(userId: number): Promise<Roommate[]>;
  createRoommate(roommate: InsertRoommate): Promise<Roommate>;
  updateRoommate(id: number, roommate: Partial<Roommate>): Promise<Roommate | undefined>;
  deleteRoommate(id: number): Promise<boolean>;

  // Bill Splits
  getBillSplitsByUserId(userId: number): Promise<BillSplit[]>;
  createBillSplit(billSplit: InsertBillSplit): Promise<BillSplit>;
  updateBillSplit(id: number, billSplit: Partial<BillSplit>): Promise<BillSplit | undefined>;
  settleBillSplit(id: number): Promise<boolean>;

  // Accounts
  getAccountsByUserId(userId: number): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<Account>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;
  getTotalBalance(userId: number): Promise<number>;

  // Activities
  getRecentActivitiesByUserId(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Budgets
  getBudgetsByUserId(userId: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<Budget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private allergies: Map<number, Allergy>;
  private expenses: Map<number, Expense>;
  private roommates: Map<number, Roommate>;
  private billSplits: Map<number, BillSplit>;
  private activities: Map<number, Activity>;
  private accounts: Map<number, Account>;
  private budgets: Map<number, Budget>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.allergies = new Map();
    this.expenses = new Map();
    this.roommates = new Map();
    this.billSplits = new Map();
    this.activities = new Map();
    this.accounts = new Map();
    this.budgets = new Map();
    this.currentId = 1;

    // Initialize with demo user and data
    this.initializeData();
  }

  private initializeData() {
    const demoUser: User = {
      id: 1,
      email: "demo@example.com",
      password: "$2a$10$6TwFe.Lh6aYTVPfLgpVz7u5xL7W2xL6ZvL.zL7xL6ZvL.zL7xL6Zv", // hashed password
      plan: "free",
      stripeCustomerId: null,
      subscriptionStatus: null,
    };
    this.users.set(1, demoUser);

    // Demo allergies
    const demoAllergies: Allergy[] = [
      { id: 1, userId: 1, name: "Peanuts", severity: "severe", riskLevel: "high" },
      { id: 2, userId: 1, name: "Dairy", severity: "moderate", riskLevel: "medium" },
      { id: 3, userId: 1, name: "Gluten", severity: "mild", riskLevel: "low" },
    ];
    demoAllergies.forEach(allergy => this.allergies.set(allergy.id, allergy));

    // Demo roommates
    const demoRoommates: Roommate[] = [
      { id: 1, userId: 1, name: "Sarah", email: "sarah@example.com", avatar: "S" },
      { id: 2, userId: 1, name: "Mike", email: "mike@example.com", avatar: "M" },
    ];
    demoRoommates.forEach(roommate => this.roommates.set(roommate.id, roommate));

    // Demo accounts
    const demoAccounts: Account[] = [
      { id: 3, userId: 1, name: "Main Checking", type: "bank", balance: 2450.75, color: "primary", icon: "CreditCard" },
      { id: 4, userId: 1, name: "Cash Wallet", type: "cash", balance: 127.50, color: "secondary", icon: "Wallet" },
      { id: 5, userId: 1, name: "Savings", type: "savings", balance: 8900.00, color: "accent", icon: "PiggyBank" },
    ];
    demoAccounts.forEach(account => this.accounts.set(account.id, account));

    // Demo budgets
    const demoBudgets: Budget[] = [
      { id: 1, userId: 1, category: "groceries", limit: 300, date: new Date() },
      { id: 2, userId: 1, category: "restaurants", limit: 150, date: new Date() },
      { id: 3, userId: 1, category: "healthcare", limit: 200, date: new Date() },
    ];
    demoBudgets.forEach(budget => this.budgets.set(budget.id, budget));

    this.currentId = 6;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, plan: "free", stripeCustomerId: null, subscriptionStatus: null };
    this.users.set(id, user);
    return user;
  }

  async updateUserBilling(id: number, billing: { plan?: string; stripeCustomerId?: string; subscriptionStatus?: string }): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...billing };
    this.users.set(id, updated);
    return updated;
  }

  async getAllergiesByUserId(userId: number): Promise<Allergy[]> {
    return Array.from(this.allergies.values()).filter(allergy => allergy.userId === userId);
  }

  async createAllergy(insertAllergy: InsertAllergy): Promise<Allergy> {
    const id = this.currentId++;
    const allergy: Allergy = { ...insertAllergy, id };
    this.allergies.set(id, allergy);
    return allergy;
  }

  async updateAllergy(id: number, allergy: Partial<Allergy>): Promise<Allergy | undefined> {
    const existing = this.allergies.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...allergy };
    this.allergies.set(id, updated);
    return updated;
  }

  async deleteAllergy(id: number): Promise<boolean> {
    return this.allergies.delete(id);
  }

  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentId++;
    const expense: Expense = { 
      ...insertExpense, 
      id,
      date: new Date(),
      allergyTags: insertExpense.allergyTags || null,
      isAllergySafe: insertExpense.isAllergySafe ?? true,
    };
    this.expenses.set(id, expense);

    // Create activity for expense
    await this.createActivity({
      userId: insertExpense.userId,
      type: "expense",
      title: insertExpense.description,
      description: `${insertExpense.category} • ${insertExpense.isAllergySafe ? 'Allergy-safe products' : 'Standard products'}`,
      amount: insertExpense.amount,
      icon: "fas fa-shopping-cart",
      color: "secondary",
      tags: insertExpense.allergyTags || [],
    });

    return expense;
  }

  async updateExpense(id: number, expense: Partial<Expense>): Promise<Expense | undefined> {
    const existing = this.expenses.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...expense };
    this.expenses.set(id, updated);
    return updated;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async getMonthlyExpenseTotal(userId: number): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return Array.from(this.expenses.values())
      .filter(expense => 
        expense.userId === userId && 
        new Date(expense.date) >= startOfMonth
      )
      .reduce((total, expense) => total + expense.amount, 0);
  }

  async getRoommatesByUserId(userId: number): Promise<Roommate[]> {
    return Array.from(this.roommates.values()).filter(roommate => roommate.userId === userId);
  }

  async createRoommate(insertRoommate: InsertRoommate): Promise<Roommate> {
    const id = this.currentId++;
    const roommate: Roommate = { 
      ...insertRoommate, 
      id,
      email: insertRoommate.email || null,
      avatar: insertRoommate.avatar || null,
    };
    this.roommates.set(id, roommate);
    return roommate;
  }

  async updateRoommate(id: number, roommate: Partial<Roommate>): Promise<Roommate | undefined> {
    const existing = this.roommates.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...roommate };
    this.roommates.set(id, updated);
    return updated;
  }

  async deleteRoommate(id: number): Promise<boolean> {
    return this.roommates.delete(id);
  }

  async getBillSplitsByUserId(userId: number): Promise<BillSplit[]> {
    return Array.from(this.billSplits.values())
      .filter(split => 
        split.creatorId === userId || 
        split.participants.includes(userId)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createBillSplit(insertBillSplit: InsertBillSplit): Promise<BillSplit> {
    const id = this.currentId++;
    const billSplit: BillSplit = { 
      ...insertBillSplit, 
      id,
      date: new Date(),
      isSettled: false,
      customAmounts: insertBillSplit.customAmounts || null,
    };
    this.billSplits.set(id, billSplit);

    // Create activity for bill split
    const participantCount = insertBillSplit.participants.length;
    const userShare = insertBillSplit.splitType === "equal" 
      ? insertBillSplit.totalAmount / participantCount
      : insertBillSplit.customAmounts?.[0] || 0;

    await this.createActivity({
      userId: insertBillSplit.creatorId,
      type: "bill_split",
      title: "Bill Split",
      description: `${insertBillSplit.title} • Your share`,
      amount: userShare,
      icon: "fas fa-users",
      color: "primary",
      tags: [`${participantCount} people`],
    });

    return billSplit;
  }

  async updateBillSplit(id: number, billSplit: Partial<BillSplit>): Promise<BillSplit | undefined> {
    const existing = this.billSplits.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...billSplit };
    this.billSplits.set(id, updated);
    return updated;
  }

  async settleBillSplit(id: number): Promise<boolean> {
    const billSplit = this.billSplits.get(id);
    if (!billSplit) return false;
    billSplit.isSettled = true;
    return true;
  }

  async getRecentActivitiesByUserId(userId: number, limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentId++;
    const activity: Activity = { 
      ...insertActivity, 
      id,
      date: new Date(),
      description: insertActivity.description || null,
      amount: insertActivity.amount || null,
      tags: insertActivity.tags || null,
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getAccountsByUserId(userId: number): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(account => account.userId === userId);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentId++;
    const account: Account = { 
      ...insertAccount, 
      id,
      balance: insertAccount.balance ?? 0,
    };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: number, account: Partial<Account>): Promise<Account | undefined> {
    const existing = this.accounts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...account };
    this.accounts.set(id, updated);
    return updated;
  }

  async deleteAccount(id: number): Promise<boolean> {
    return this.accounts.delete(id);
  }

  async getTotalBalance(userId: number): Promise<number> {
    return Array.from(this.accounts.values())
      .filter(account => account.userId === userId)
      .reduce((total, account) => total + account.balance, 0);
  }

  async getBudgetsByUserId(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(budget => budget.userId === userId);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.currentId++;
    const budget: Budget = { 
      ...insertBudget, 
      id,
      date: new Date(),
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: number, budget: Partial<Budget>): Promise<Budget | undefined> {
    const existing = this.budgets.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...budget };
    this.budgets.set(id, updated);
    return updated;
  }

  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }
}

export const storage = new MemStorage();
