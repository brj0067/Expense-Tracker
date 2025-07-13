import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAllergySchema, insertExpenseSchema, insertRoommateSchema, 
  insertBillSplitSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Default user ID for demo (in real app, this would come from authentication)
  const DEMO_USER_ID = 1;

  // Dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const allergies = await storage.getAllergiesByUserId(DEMO_USER_ID);
      const monthlyExpenses = await storage.getMonthlyExpenseTotal(DEMO_USER_ID);
      const recentActivities = await storage.getRecentActivitiesByUserId(DEMO_USER_ID, 5);
      const billSplits = await storage.getBillSplitsByUserId(DEMO_USER_ID);

      res.json({
        allergyCount: allergies.length,
        monthlyExpenses,
        recentActivities,
        activeBillSplits: billSplits.filter(split => !split.isSettled),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Allergies
  app.get("/api/allergies", async (req, res) => {
    try {
      const allergies = await storage.getAllergiesByUserId(DEMO_USER_ID);
      res.json(allergies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch allergies" });
    }
  });

  app.post("/api/allergies", async (req, res) => {
    try {
      const data = insertAllergySchema.parse({ ...req.body, userId: DEMO_USER_ID });
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
      const expenses = await storage.getExpensesByUserId(DEMO_USER_ID);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const data = insertExpenseSchema.parse({ ...req.body, userId: DEMO_USER_ID });
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
      const roommates = await storage.getRoommatesByUserId(DEMO_USER_ID);
      res.json(roommates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roommates" });
    }
  });

  app.post("/api/roommates", async (req, res) => {
    try {
      const data = insertRoommateSchema.parse({ ...req.body, userId: DEMO_USER_ID });
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
      const billSplits = await storage.getBillSplitsByUserId(DEMO_USER_ID);
      res.json(billSplits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bill splits" });
    }
  });

  app.post("/api/bill-splits", async (req, res) => {
    try {
      const data = insertBillSplitSchema.parse({ ...req.body, creatorId: DEMO_USER_ID });
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

  // Social sharing achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const allergies = await storage.getAllergiesByUserId(DEMO_USER_ID);
      const expenses = await storage.getExpensesByUserId(DEMO_USER_ID);
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
