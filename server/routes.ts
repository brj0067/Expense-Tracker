import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { requireAuth } from "./auth-middleware";
import { 
  insertAllergySchema, insertExpenseSchema, insertRoommateSchema, 
  insertBillSplitSchema, insertAccountSchema, insertUserSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ email, password: hashedPassword });
      (req.session as any).userId = user.id;
      res.json({ id: user.id, email: user.email });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = insertUserSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      (req.session as any).userId = user.id;
      res.json({ id: user.id, email: user.email });
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req.session as any).userId!);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ id: user.id, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Helper to get user ID from session, fallback to demo for backwards compatibility
  const getUserId = (req: Request): number => (req.session as any).userId || 1;

  // Default user ID for demo (in real app, this would come from authentication)
  const DEMO_USER_ID = 1;

  // Dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const userId = getUserId(req);
      const allergies = await storage.getAllergiesByUserId(userId);
      const monthlyExpenses = await storage.getMonthlyExpenseTotal(userId);
      const recentActivities = await storage.getRecentActivitiesByUserId(userId, 5);
      const billSplits = await storage.getBillSplitsByUserId(userId);
      const accounts = await storage.getAccountsByUserId(userId);
      const totalBalance = await storage.getTotalBalance(userId);

      res.json({
        allergyCount: allergies.length,
        monthlyExpenses,
        recentActivities,
        activeBillSplits: billSplits.filter(split => !split.isSettled),
        accounts,
        totalBalance,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Allergies
  app.get("/api/allergies", async (req, res) => {
    try {
      const userId = getUserId(req);
      const allergies = await storage.getAllergiesByUserId(userId);
      res.json(allergies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch allergies" });
    }
  });

  app.post("/api/allergies", async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertAllergySchema.parse({ ...req.body, userId });
      const allergy = await storage.createAllergy(data);
      res.json(allergy);
    } catch (error) {
      res.status(400).json({ message: "Invalid allergy data" });
    }
  });

  app.put("/api/allergies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const allergy = await storage.updateAllergy(id, req.body);
      if (!allergy) {
        return res.status(404).json({ message: "Allergy not found" });
      }
      res.json(allergy);
    } catch (error) {
      res.status(400).json({ message: "Failed to update allergy" });
    }
  });

  app.delete("/api/allergies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAllergy(id);
      if (!deleted) {
        return res.status(404).json({ message: "Allergy not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete allergy" });
    }
  });

  // Expenses
  app.get("/api/expenses", async (req, res) => {
    try {
      const userId = getUserId(req);
      const expenses = await storage.getExpensesByUserId(userId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertExpenseSchema.parse({ ...req.body, userId });
      const expense = await storage.createExpense(data);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense data" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.updateExpense(id, req.body);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete expense" });
    }
  });

  // Roommates
  app.get("/api/roommates", async (req, res) => {
    try {
      const userId = getUserId(req);
      const roommates = await storage.getRoommatesByUserId(userId);
      res.json(roommates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roommates" });
    }
  });

  app.post("/api/roommates", async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertRoommateSchema.parse({ ...req.body, userId });
      const roommate = await storage.createRoommate(data);
      res.json(roommate);
    } catch (error) {
      res.status(400).json({ message: "Invalid roommate data" });
    }
  });

  app.put("/api/roommates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const roommate = await storage.updateRoommate(id, req.body);
      if (!roommate) {
        return res.status(404).json({ message: "Roommate not found" });
      }
      res.json(roommate);
    } catch (error) {
      res.status(400).json({ message: "Failed to update roommate" });
    }
  });

  app.delete("/api/roommates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRoommate(id);
      if (!deleted) {
        return res.status(404).json({ message: "Roommate not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete roommate" });
    }
  });

  // Bill Splits
  app.get("/api/bill-splits", async (req, res) => {
    try {
      const userId = getUserId(req);
      const billSplits = await storage.getBillSplitsByUserId(userId);
      res.json(billSplits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bill splits" });
    }
  });

  app.post("/api/bill-splits", async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertBillSplitSchema.parse({ ...req.body, creatorId: userId });
      const billSplit = await storage.createBillSplit(data);
      res.json(billSplit);
    } catch (error) {
      res.status(400).json({ message: "Invalid bill split data" });
    }
  });

  app.put("/api/bill-splits/:id/settle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const settled = await storage.settleBillSplit(id);
      if (!settled) {
        return res.status(404).json({ message: "Bill split not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to settle bill split" });
    }
  });

  // Accounts
  app.get("/api/accounts", async (req, res) => {
    try {
      const userId = getUserId(req);
      const accounts = await storage.getAccountsByUserId(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertAccountSchema.parse({ ...req.body, userId });
      const account = await storage.createAccount(data);
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: "Invalid account data" });
    }
  });

  app.put("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.updateAccount(id, req.body);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: "Failed to update account" });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAccount(id);
      if (!deleted) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete account" });
    }
  });

  // Social sharing achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const userId = getUserId(req);
      const allergies = await storage.getAllergiesByUserId(userId);
      const expenses = await storage.getExpensesByUserId(userId);
      const allergySafeExpenses = expenses.filter(e => e.isAllergySafe);
      
      res.json({
        allergensAvoided: allergies.length * 2, // Mock calculation
        safePurchases: allergySafeExpenses.length,
        monthsSafe: 3, // Mock data
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
