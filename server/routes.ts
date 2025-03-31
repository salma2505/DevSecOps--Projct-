import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertIncidentSchema, insertTeamSchema, statusOptions, priorityOptions, categoryOptions } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // setup authentication routes
  setupAuth(app);

  // Middleware to check authentication for all /api routes except auth routes
  app.use('/api', (req, res, next) => {
    // Allow auth-related endpoints
    if (req.path === '/login' || req.path === '/register' || req.path === '/logout' || req.path === '/user') {
      return next();
    }
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    next();
  });
  
  // Authentication middleware for specific routes
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: "Not authenticated" });
  };

  // Middleware to check admin role
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: "Access denied: Admin role required" });
  };

  // Middleware to check manager or admin role
  const isManagerOrAdmin = (req: Request, res: Response, next: Function) => {
    if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
      return next();
    }
    return res.status(403).json({ message: "Access denied: Manager or Admin role required" });
  };

  // GET teams endpoint
  app.get('/api/teams', async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Error fetching teams" });
    }
  });

  // POST team endpoint (admin only)
  app.post('/api/teams', isAdmin, async (req, res) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating team" });
    }
  });

  // GET users (admin only)
  app.get('/api/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // GET incidents endpoint
  app.get('/api/incidents', async (req, res) => {
    try {
      // Get filter parameters
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const category = req.query.category as string;
      const search = req.query.search as string;

      let incidents = await storage.getAllIncidents();

      // Apply filters
      if (status && statusOptions.includes(status as any)) {
        incidents = incidents.filter(inc => inc.status === status);
      }
      
      if (priority && priorityOptions.includes(priority as any)) {
        incidents = incidents.filter(inc => inc.priority === priority);
      }
      
      if (category && categoryOptions.includes(category as any)) {
        incidents = incidents.filter(inc => inc.category === category);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        incidents = incidents.filter(inc => 
          inc.title.toLowerCase().includes(searchLower) || 
          inc.description?.toLowerCase().includes(searchLower) ||
          inc.incidentId.toLowerCase().includes(searchLower)
        );
      }

      // Sort by created date desc
      incidents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json(incidents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching incidents" });
    }
  });

  // GET single incident
  app.get('/api/incidents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid incident ID" });
      }

      const incident = await storage.getIncident(id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      res.json(incident);
    } catch (error) {
      res.status(500).json({ message: "Error fetching incident" });
    }
  });

  // POST incident endpoint
  app.post('/api/incidents', requireAuth, async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const incident = await storage.createIncident(validatedData);
      res.status(201).json(incident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid incident data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating incident" });
    }
  });

  // PUT incident endpoint
  app.put('/api/incidents/:id', isManagerOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid incident ID" });
      }

      const incident = await storage.getIncident(id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      const updatedIncident = await storage.updateIncident(id, req.body);
      res.json(updatedIncident);
    } catch (error) {
      res.status(500).json({ message: "Error updating incident" });
    }
  });

  // DELETE incident endpoint (admin only)
  app.delete('/api/incidents/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid incident ID" });
      }

      const success = await storage.deleteIncident(id);
      if (!success) {
        return res.status(404).json({ message: "Incident not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting incident" });
    }
  });

  // GET dashboard stats
  app.get('/api/stats/dashboard', async (req, res) => {
    try {
      const incidents = await storage.getAllIncidents();
      const statusCounts = await storage.getIncidentsByStatus();
      const priorityCounts = await storage.getIncidentsByPriority();
      const trends = await storage.getIncidentTrends();

      res.json({
        totalIncidents: incidents.length,
        openIncidents: statusCounts['open'],
        criticalIncidents: priorityCounts['critical'],
        resolvedThisWeek: 18, // For MVP, using a fixed number
        statusDistribution: statusCounts,
        trends: trends
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  // GET analytics data
  app.get('/api/stats/analytics', async (req, res) => {
    try {
      const priorityCounts = await storage.getIncidentsByPriority();
      const categoryCounts = await storage.getIncidentsByCategory();
      const resolutionTime = await storage.getResolutionTimeByPriority();
      
      res.json({
        byPriority: priorityCounts,
        byCategory: categoryCounts,
        resolutionTime: resolutionTime
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching analytics data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
