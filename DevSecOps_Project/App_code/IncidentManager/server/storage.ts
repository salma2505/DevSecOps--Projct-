import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, or } from 'drizzle-orm';
import pg from 'pg';
const { Pool } = pg;
import { incidents, teams, users, type User, type Team, type Incident, type InsertUser, type InsertTeam, type InsertIncident } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import dotenv from "dotenv";
dotenv.config();

const MemoryStore = createMemoryStore(session);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const db = drizzle(pool);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Team operations
  createTeam(team: InsertTeam): Promise<Team>;
  getTeam(id: number): Promise<Team | undefined>;
  getAllTeams(): Promise<Team[]>;

  // Incident operations
  createIncident(incident: InsertIncident): Promise<Incident>;
  getIncident(id: number): Promise<Incident | undefined>;
  getIncidentByIncidentId(incidentId: string): Promise<Incident | undefined>;
  updateIncident(id: number, incident: Partial<Incident>): Promise<Incident | undefined>;
  deleteIncident(id: number): Promise<boolean>;
  getAllIncidents(): Promise<Incident[]>;
  getIncidentsByUserId(userId: number): Promise<Incident[]>;

  // Incident statistics
  getIncidentsByStatus(): Promise<Record<string, number>>;
  getIncidentsByPriority(): Promise<Record<string, number>>;
  getIncidentsByCategory(): Promise<Record<string, number>>;
  getIncidentTrends(): Promise<any[]>;
  getResolutionTimeByPriority(): Promise<Record<string, number>>;

  // Session store for auth
  sessionStore: any; // Use 'any' to fix TypeScript error
}

export class PostgresStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const result = await db.insert(teams).values(team).returning();
    return result[0];
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const result = await db.select().from(teams).where(eq(teams.id, id));
    return result[0];
  }

  async getAllTeams(): Promise<Team[]> {
    return db.select().from(teams);
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const result = await db.insert(incidents).values({
      ...incident,
      incidentId: `INC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    const result = await db.select().from(incidents).where(eq(incidents.id, id));
    return result[0];
  }

  async getIncidentByIncidentId(incidentId: string): Promise<Incident | undefined> {
    const result = await db.select().from(incidents).where(eq(incidents.incidentId, incidentId));
    return result[0];
  }

  async updateIncident(id: number, incidentData: Partial<Incident>): Promise<Incident | undefined> {
    const result = await db.update(incidents)
      .set({ ...incidentData, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return result[0];
  }

  async deleteIncident(id: number): Promise<boolean> {
    const result = await db.delete(incidents).where(eq(incidents.id, id));
    return true;
  }

  async getAllIncidents(): Promise<Incident[]> {
    return db.select().from(incidents);
  }

  async getIncidentsByUserId(userId: number): Promise<Incident[]> {
    return db.select()
      .from(incidents)
      .where(
        or(
          eq(incidents.createdBy, userId),
          eq(incidents.assignedTo, userId)
        )
      );
  }

  async getIncidentsByStatus(): Promise<Record<string, number>> {
    const results = await db.select().from(incidents);
    const counts: Record<string, number> = { open: 0, "in-progress": 0, resolved: 0, closed: 0 };
    results.forEach(incident => counts[incident.status]++);
    return counts;
  }

  async getIncidentsByPriority(): Promise<Record<string, number>> {
    const results = await db.select().from(incidents);
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    results.forEach(incident => counts[incident.priority]++);
    return counts;
  }

  async getIncidentsByCategory(): Promise<Record<string, number>> {
    const results = await db.select().from(incidents);
    const counts: Record<string, number> = { 
      system: 0, network: 0, security: 0, application: 0, database: 0, other: 0 
    };
    results.forEach(incident => counts[incident.category]++);
    return counts;
  }

  async getIncidentTrends(): Promise<any[]> {
    return db.select().from(incidents)
      .orderBy(incidents.createdAt)
      .limit(30);
  }

  async getResolutionTimeByPriority(): Promise<Record<string, number>> {
    const results = await db.select().from(incidents).where(eq(incidents.status, 'resolved'));
    const times: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };

    results.forEach(incident => {
      if (incident.resolvedAt) {
        const hours = (incident.resolvedAt.getTime() - incident.createdAt.getTime()) / (1000 * 60 * 60);
        times[incident.priority] += hours;
        counts[incident.priority]++;
      }
    });

    Object.keys(times).forEach(priority => {
      times[priority] = counts[priority] ? times[priority] / counts[priority] : 0;
    });

    return times;
  }
}

export const storage = new PostgresStorage();