import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { leadSchema, signupSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new lead (from CTA button captures)
  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = leadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.status(201).json({ success: true, data: lead });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          details: error.errors,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  });

  // Get all leads (for future admin panel)
  app.get("/api/leads", async (_req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json({ success: true, data: leads });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  // User signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(validatedData.phone);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Usuário já existe com este telefone",
        });
      }

      const user = await storage.createUser(validatedData);
      
      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ success: true, data: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          details: error.errors,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  });

  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByPhone(validatedData.phone);
      
      if (!user || user.password !== validatedData.password) {
        return res.status(401).json({
          success: false,
          error: "Telefone ou senha incorretos",
        });
      }

      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      
      res.json({ success: true, data: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          details: error.errors,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
