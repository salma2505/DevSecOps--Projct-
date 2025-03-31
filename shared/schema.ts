import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // user, manager, admin
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Team schema
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

// Incident schema
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  incidentId: text("incident_id").notNull().unique(), // #INC-XXXX
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("low"), // low, medium, high, critical
  category: text("category").notNull().default("other"), // system, network, security, application, database, other
  status: text("status").notNull().default("open"), // open, in-progress, resolved, closed
  assignedTo: integer("assigned_to"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  dueDate: timestamp("due_date"),
  resolvedAt: timestamp("resolved_at"),
});

// Create base schema without special date handling fields
const baseInsertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  incidentId: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

// Extend the schema with custom date handling
export const insertIncidentSchema = baseInsertIncidentSchema.extend({
  // Allow ISO strings for dates and convert them to Date objects
  dueDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
});

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

// Fixed priority options
export const priorityOptions = ["critical", "high", "medium", "low"] as const;
export const priorityLabels: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

// Fixed status options
export const statusOptions = ["open", "in-progress", "resolved", "closed"] as const;
export const statusLabels: Record<string, string> = {
  open: "Open",
  "in-progress": "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

// Fixed category options
export const categoryOptions = ["system", "network", "security", "application", "database", "other"] as const;
export const categoryLabels: Record<string, string> = {
  system: "System",
  network: "Network",
  security: "Security",
  application: "Application",
  database: "Database",
  other: "Other",
};
