import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  leadSchema, 
  signupSchema, 
  loginSchema,
  adminLoginSchema,
  insertPathologySchema,
  insertVideoSchema,
  insertEbookSchema,
  insertConsultationSchema,
  insertSubscriptionSchema
} from "@shared/schema";
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

  app.post("/api/videos/:id/view", async (req, res) => {
    try {
      const video = await storage.getVideoById(parseInt(req.params.id));
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      const updatedVideo = await storage.updateVideo(video.id, {
        viewCount: (video.viewCount || 0) + 1
      });
      res.json(updatedVideo);
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

  app.post("/api/consultations", async (req, res) => {
    try {
      const validatedData = insertConsultationSchema.parse(req.body);
      const consultation = await storage.createConsultation(validatedData);
      res.status(201).json(consultation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
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

  // ============================================
  // ADMIN ROUTES
  // ============================================

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const validatedData = adminLoginSchema.parse(req.body);
      const admin = await storage.getAdminByEmail(validatedData.email);
      
      if (!admin || admin.password !== validatedData.password) {
        return res.status(401).json({
          success: false,
          error: "Email ou senha incorretos",
        });
      }

      const { password, ...adminWithoutPassword } = admin;
      res.json({ success: true, data: adminWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          details: error.errors,
        });
      } else {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  });

  // Admin statistics
  app.get("/api/admin/statistics", async (_req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin - Users management
  app.get("/api/admin/users", async (_req, res) => {
    try {
      const users = await storage.getUsers();
      const usersWithoutPassword = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/users/:id", async (req, res) => {
    try {
      const user = await storage.getUserById(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const success = await storage.deleteUser(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin - Pathologies management
  app.post("/api/admin/pathologies", async (req, res) => {
    try {
      const validatedData = insertPathologySchema.parse(req.body);
      const pathology = await storage.createPathology(validatedData);
      res.status(201).json(pathology);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/admin/pathologies/:id", async (req, res) => {
    try {
      const pathology = await storage.updatePathology(parseInt(req.params.id), req.body);
      if (!pathology) {
        return res.status(404).json({ error: "Pathology not found" });
      }
      res.json(pathology);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/pathologies/:id", async (req, res) => {
    try {
      const success = await storage.deletePathology(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Pathology not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin - Videos management
  app.post("/api/admin/videos", async (req, res) => {
    try {
      const validatedData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(validatedData);
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/admin/videos/:id", async (req, res) => {
    try {
      const video = await storage.updateVideo(parseInt(req.params.id), req.body);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/videos/:id", async (req, res) => {
    try {
      const success = await storage.deleteVideo(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin - Ebooks management
  app.post("/api/admin/ebooks", async (req, res) => {
    try {
      const validatedData = insertEbookSchema.parse(req.body);
      const ebook = await storage.createEbook(validatedData);
      res.status(201).json(ebook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/admin/ebooks/:id", async (req, res) => {
    try {
      const ebook = await storage.updateEbook(parseInt(req.params.id), req.body);
      if (!ebook) {
        return res.status(404).json({ error: "Ebook not found" });
      }
      res.json(ebook);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/ebooks/:id", async (req, res) => {
    try {
      const success = await storage.deleteEbook(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Ebook not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin - Consultations management
  app.get("/api/admin/consultations", async (_req, res) => {
    try {
      const consultations = await storage.getConsultations();
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/consultations", async (req, res) => {
    try {
      const validatedData = insertConsultationSchema.parse(req.body);
      const consultation = await storage.createConsultation(validatedData);
      res.status(201).json(consultation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/admin/consultations/:id", async (req, res) => {
    try {
      const consultation = await storage.updateConsultation(parseInt(req.params.id), req.body);
      if (!consultation) {
        return res.status(404).json({ error: "Consultation not found" });
      }
      res.json(consultation);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/consultations/:id", async (req, res) => {
    try {
      const success = await storage.deleteConsultation(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Consultation not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin - Subscriptions management
  app.get("/api/admin/subscriptions", async (_req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/subscriptions", async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/admin/subscriptions/:id", async (req, res) => {
    try {
      const subscription = await storage.updateSubscription(parseInt(req.params.id), req.body);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/subscriptions/:id", async (req, res) => {
    try {
      const success = await storage.deleteSubscription(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin - Leads management
  app.delete("/api/admin/leads/:id", async (req, res) => {
    try {
      const success = await storage.deleteLead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
