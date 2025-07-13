import { 
  users, allergies, expenses, roommates, billSplits, activities,
  type User, type InsertUser, type Allergy, type InsertAllergy,
  type Expense, type InsertExpense, type Roommate, type InsertRoommate,
  type BillSplit, type InsertBillSplit, type Activity, type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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

  // Activities
  getRecentActivitiesByUserId(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private allergies: Map<number, Allergy>;
  private expenses: Map<number, Expense>;
  private roommates: Map<number, Roommate>;
  private billSplits: Map<number, BillSplit>;
  private activities: Map<number, Activity>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.allergies = new Map();
    this.expenses = new Map();
    this.roommates = new Map();
    this.billSplits = new Map();
    this.activities = new Map();
    this.currentId = 1;

    // Initialize with demo user and data
    this.initializeData();
  }

  private initializeData() {
    const demoUser: User = {
      id: 1,
      username: "demo",
      password: "demo",
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

    this.currentId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    const roommate: Roommate = { ...insertRoommate, id };
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
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
