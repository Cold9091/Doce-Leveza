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

  // Pathologies routes
  app.get("/api/pathologies", async (_req, res) => {
    try {
      const pathologies = await storage.getPathologies();
      res.json(pathologies);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/pathologies/:slug", async (req, res) => {
    try {
      const pathology = await storage.getPathologyBySlug(req.params.slug);
      if (!pathology) {
        return res.status(404).json({ error: "Pathology not found" });
      }
      res.json(pathology);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Videos routes
  app.get("/api/videos", async (_req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideoById(parseInt(req.params.id));
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Ebooks routes
  app.get("/api/ebooks", async (_req, res) => {
    try {
      const ebooks = await storage.getEbooks();
      res.json(ebooks);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/ebooks/:id", async (req, res) => {
    try {
      const ebook = await storage.getEbookById(parseInt(req.params.id));
      if (!ebook) {
        return res.status(404).json({ error: "Ebook not found" });
      }
      res.json(ebook);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Consultations routes
  app.get("/api/consultations/user/:userId", async (req, res) => {
    try {
      const consultations = await storage.getConsultationsByUser(parseInt(req.params.userId));
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Subscriptions routes
  app.get("/api/subscriptions/user/:userId", async (req, res) => {
    try {
      const subscription = await storage.getSubscriptionByUser(parseInt(req.params.userId));
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
