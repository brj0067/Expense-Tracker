import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const allergies = pgTable("allergies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  severity: text("severity").notNull(), // "mild", "moderate", "severe"
  riskLevel: text("risk_level").notNull(), // "low", "medium", "high"
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  allergyTags: text("allergy_tags").array(),
  date: timestamp("date").defaultNow().notNull(),
  isAllergySafe: boolean("is_allergy_safe").default(true),
});

export const roommates = pgTable("roommates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  avatar: text("avatar"),
});

export const billSplits = pgTable("bill_splits", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull(),
  title: text("title").notNull(),
  totalAmount: real("total_amount").notNull(),
  participants: integer("participants").array().notNull(),
  splitType: text("split_type").notNull(), // "equal", "custom"
  customAmounts: real("custom_amounts").array(),
  isSettled: boolean("is_settled").default(false),
  date: timestamp("date").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "bank", "cash", "credit", "savings"
  balance: real("balance").notNull().default(0),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "expense", "allergy_alert", "bill_split"
  title: text("title").notNull(),
  description: text("description"),
  amount: real("amount"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  tags: text("tags").array(),
  date: timestamp("date").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const insertAllergySchema = createInsertSchema(allergies).pick({
  userId: true,
  name: true,
  severity: true,
  riskLevel: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  userId: true,
  amount: true,
  description: true,
  category: true,
  allergyTags: true,
  isAllergySafe: true,
});

export const insertRoommateSchema = createInsertSchema(roommates).pick({
  userId: true,
  name: true,
  email: true,
  avatar: true,
});

export const insertBillSplitSchema = createInsertSchema(billSplits).pick({
  creatorId: true,
  title: true,
  totalAmount: true,
  participants: true,
  splitType: true,
  customAmounts: true,
});

export const insertAccountSchema = createInsertSchema(accounts).pick({
  userId: true,
  name: true,
  type: true,
  balance: true,
  color: true,
  icon: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  title: true,
  description: true,
  amount: true,
  icon: true,
  color: true,
  tags: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Allergy = typeof allergies.$inferSelect;
export type InsertAllergy = z.infer<typeof insertAllergySchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Roommate = typeof roommates.$inferSelect;
export type InsertRoommate = z.infer<typeof insertRoommateSchema>;
export type BillSplit = typeof billSplits.$inferSelect;
export type InsertBillSplit = z.infer<typeof insertBillSplitSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
