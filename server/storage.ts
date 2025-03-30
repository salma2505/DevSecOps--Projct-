import { incidents, type Incident, type InsertIncident, teams, type Team, type InsertTeam, users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private teams: Map<number, Team>;
  private incidents: Map<number, Incident>;
  private currentUserId: number;
  private currentTeamId: number;
  private currentIncidentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.teams = new Map();
    this.incidents = new Map();
    this.currentUserId = 1;
    this.currentTeamId = 1;
    this.currentIncidentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });

    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      role: "admin"
    });

    // Create default manager user
    this.createUser({
      username: "manager",
      password: "manager123",
      role: "manager"
    });

    // Create default regular user
    this.createUser({
      username: "user",
      password: "user123",
      role: "user"
    });

    // Create default teams
    this.createTeam({ name: "Database Team" });
    this.createTeam({ name: "Frontend Team" });
    this.createTeam({ name: "Backend Team" });
    this.createTeam({ name: "Security Team" });
    this.createTeam({ name: "DevOps Team" });
    this.createTeam({ name: "Cloud Ops Team" });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Team operations
  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.currentTeamId++;
    const team: Team = { ...insertTeam, id };
    this.teams.set(id, team);
    return team;
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getAllTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  // Incident operations
  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const id = this.currentIncidentId++;
    const incidentId = `INC-${String(id).padStart(4, '0')}`;
    const incident: Incident = { 
      ...insertIncident, 
      id, 
      incidentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null
    };
    this.incidents.set(id, incident);
    return incident;
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }

  async getIncidentByIncidentId(incidentId: string): Promise<Incident | undefined> {
    return Array.from(this.incidents.values()).find(
      (incident) => incident.incidentId === incidentId
    );
  }

  async updateIncident(id: number, incidentData: Partial<Incident>): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;

    // Update the resolved time if status changes to 'resolved'
    if (incidentData.status === 'resolved' && incident.status !== 'resolved') {
      incidentData.resolvedAt = new Date();
    }

    const updatedIncident = { 
      ...incident, 
      ...incidentData, 
      updatedAt: new Date() 
    };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  async deleteIncident(id: number): Promise<boolean> {
    return this.incidents.delete(id);
  }

  async getAllIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values());
  }

  async getIncidentsByUserId(userId: number): Promise<Incident[]> {
    return Array.from(this.incidents.values()).filter(
      (incident) => incident.createdBy === userId || incident.assignedTo === userId
    );
  }

  // Incident statistics
  async getIncidentsByStatus(): Promise<Record<string, number>> {
    const incidents = Array.from(this.incidents.values());
    const result: Record<string, number> = { 
      open: 0, 
      "in-progress": 0,
      resolved: 0,
      closed: 0
    };
    
    incidents.forEach(incident => {
      if (result[incident.status] !== undefined) {
        result[incident.status]++;
      }
    });
    
    return result;
  }

  async getIncidentsByPriority(): Promise<Record<string, number>> {
    const incidents = Array.from(this.incidents.values());
    const result: Record<string, number> = { 
      critical: 0, 
      high: 0, 
      medium: 0, 
      low: 0 
    };
    
    incidents.forEach(incident => {
      if (result[incident.priority] !== undefined) {
        result[incident.priority]++;
      }
    });
    
    return result;
  }

  async getIncidentsByCategory(): Promise<Record<string, number>> {
    const incidents = Array.from(this.incidents.values());
    const result: Record<string, number> = { 
      system: 0, 
      network: 0, 
      security: 0, 
      application: 0,
      database: 0,
      other: 0
    };
    
    incidents.forEach(incident => {
      if (result[incident.category] !== undefined) {
        result[incident.category]++;
      }
    });
    
    return result;
  }

  async getIncidentTrends(): Promise<any[]> {
    // For a real implementation, this would generate trend data
    // For the MVP with in-memory storage, we'll return some sample data
    // In a production environment, this would query creation dates and statuses over time
    return [
      { date: '1 Aug', created: 5, resolved: 3 },
      { date: '5 Aug', created: 8, resolved: 5 },
      { date: '10 Aug', created: 12, resolved: 9 },
      { date: '15 Aug', created: 7, resolved: 6 },
      { date: '20 Aug', created: 10, resolved: 8 },
      { date: '25 Aug', created: 9, resolved: 7 },
      { date: '30 Aug', created: 15, resolved: 10 },
      { date: '5 Sep', created: 11, resolved: 9 },
      { date: '10 Sep', created: 8, resolved: 6 },
      { date: '15 Sep', created: 13, resolved: 9 },
      { date: '20 Sep', created: 9, resolved: 8 }
    ];
  }

  async getResolutionTimeByPriority(): Promise<Record<string, number>> {
    // For the MVP, we're returning sample data
    // In a production environment with persistent data, we would calculate this from actual timestamp data
    return {
      critical: 4,
      high: 12,
      medium: 24,
      low: 48
    };
  }
}

export const storage = new MemStorage();
