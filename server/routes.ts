import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGroupSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all groups
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  // Create a new group
  app.post("/api/groups", async (req, res) => {
    try {
      const validatedData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(validatedData);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid group data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create group" });
      }
    }
  });

  // Update a group
  app.patch("/api/groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      if (updates.status === "in-progress" && !updates.startTime) {
        updates.startTime = new Date();
      }
      
      if (updates.status === "completed" && !updates.endTime) {
        updates.endTime = new Date();
      }
      
      const group = await storage.updateGroup(id, updates);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to update group" });
    }
  });

  // Delete a group
  app.delete("/api/groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGroup(id);
      if (!deleted) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete group" });
    }
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update setting
  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const setting = await storage.setSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Get queue statistics
  app.get("/api/queue/stats", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      const totalVisitors = groups.reduce((sum, group) => sum + group.size, 0);
      const groupsInQueue = groups.filter(g => g.status === "waiting").length;
      const completedToday = groups.filter(g => g.status === "completed").length;
      
      res.json({
        totalVisitors,
        groupsInQueue,
        completedToday,
        totalGroups: groups.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch queue statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
