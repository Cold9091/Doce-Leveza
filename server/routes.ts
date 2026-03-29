import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { getIronSession } from "iron-session";
import { sessionOptions } from "./session.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import multer from "multer";
import { uploadImageToCloudinary, uploadRawToCloudinary } from "./cloudinary.js";
import {
  leadSchema,
  signupSchema,
  loginSchema,
  adminLoginSchema,
  insertPathologySchema,
  insertVideoSchema,
  insertEbookSchema,
  insertConsultationSchema,
  insertSubscriptionSchema,
  systemSettingsSchema
} from "../shared/schema.js";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });



export async function registerRoutes(app: Express): Promise<Server> {
  // Configuração de Segurança com Helmet
  app.use(helmet({
    contentSecurityPolicy: false, // Desativado para facilitar o desenvolvimento inicial com Vite, mas protege contra XSS e outros
  }));

  // Rate Limiting global (prevenir DoS)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 500, // Aumentado de 100 para 500 para evitar bloqueios legítimos no dashboard
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: "Muitas requisições. Tente novamente mais tarde." }
  });
  app.use("/api/", limiter);

  // Rate Limiting específico para Login (prevenir Força Bruta)
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    limit: 50, // Aumentado de 10 para 50 tentativas por hora
    message: { error: "Muitas tentativas de login. Tente novamente em 1 hora." }
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/admin/login", authLimiter);

  // Configuração de sessão segura
  // Configuração de sessão segura (Iron Session)
  app.use(async (req, res, next) => {
    const session = await getIronSession(req, res, sessionOptions);
    // @ts-ignore - Augment request with session
    req.session = session;
    next();
  });

  // Middlewares de Proteção
  const requireUser = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, error: "Acesso negado. Por favor, faça login." });
    }
    next();
  };

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.adminId) {
      console.warn(`Tentativa de acesso não autorizado à rota administrativa: ${req.path} de ${req.ip}`);
      return res.status(401).json({ success: false, error: "Acesso negado. Apenas administradores." });
    }
    next();
  };

  // Rotas de Auth - Sessão
  app.get("/api/auth/me", async (req, res) => {
    // Check for admin session first if path is sensitive, or just return admin if session exists
    if (req.session.adminId) {
      const admin = await storage.getAdminById(req.session.adminId);
      if (admin) {
        const { password, ...adminWithoutPassword } = admin;
        return res.json({ ...adminWithoutPassword, role: admin.role || "admin" });
      }
    }

    if (!req.session.userId) return res.status(401).json(null);
    const user = await storage.getUserById(req.session.userId);
    if (!user) return res.status(401).json(null);
    const { password, ...userWithoutPassword } = user;
    res.json({ ...userWithoutPassword, role: "user" });
  });

  app.get("/api/admin/me", async (req, res) => {
    if (!req.session.adminId) return res.status(401).json(null);
    const admin = await storage.getAdminById(req.session.adminId);
    if (!admin) return res.status(401).json(null);
    const { password, ...adminWithoutPassword } = admin;
    res.json(adminWithoutPassword);
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy();
    await req.session.save();
    res.json({ success: true });
  });

  // Change own password
  app.patch("/api/auth/password", requireUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Senha atual e nova senha são obrigatórias" });
      }

      const user = await storage.getUserById(userId);
      if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

      if (user.password !== currentPassword) {
        return res.status(401).json({ error: "Senha atual incorreta" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "A nova senha deve ter pelo menos 6 caracteres" });
      }

      await storage.updateUser(userId, { password: newPassword });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update own profile (name, address)
  app.patch("/api/auth/profile", requireUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { name, address } = req.body;

      const allowed: Record<string, string> = {};
      if (name && typeof name === "string") allowed.name = name.trim();
      if (address && typeof address === "string") allowed.address = address.trim();

      if (Object.keys(allowed).length === 0) {
        return res.status(400).json({ error: "Nenhum campo válido para atualizar" });
      }

      const updated = await storage.updateUser(userId, allowed);
      if (!updated) return res.status(404).json({ error: "Utilizador não encontrado" });

      const { password, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin - Settings management
  app.get("/api/admin/settings", requireAdmin, async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Notifications
  app.get("/api/notifications/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

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

      console.log(`✅ User ${user.id} created`);

      // Notify admins of new registration
      storage.createAdminNotification({
        title: "Novo utilizador registado",
        message: `${user.name} (${user.phone}) criou uma conta.`,
        type: "info",
        relatedId: user.id,
      }).catch(() => {});

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
        console.error("Signup error:", error);
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
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ success: false, error: "Credenciais incompletas" });
      }

      let user;
      // Verificar se é email ou telefone
      if (identifier.includes("@")) {
        // Tentar encontrar admin pelo email primeiro
        const admin = await storage.getAdminByEmail(identifier);
        if (admin && admin.password === password) {
          req.session.adminId = admin.id;
          // Garantir que a sessão de usuário comum não interfira
          req.session.userId = undefined;
          await req.session.save();

          const { password: _, ...adminWithoutPassword } = admin;
          return res.json({ success: true, data: { ...adminWithoutPassword, role: admin.role || "admin" } });
        }

        // Se não for admin, talvez seja um lead/usuário? 
        // No esquema atual apenas AdminUser tem email.
        return res.status(401).json({
          success: false,
          error: "Credenciais inválidas",
        });
      } else {
        // Tratar como telefone
        user = await storage.getUserByPhone(identifier);
      }

      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          error: "Telefone ou senha incorretos",
        });
      }

      // Iniciar sessão
      req.session.userId = user.id;
      await req.session.save();

      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;

      // Adicionar role de usuário padrão para o frontend
      res.json({ success: true, data: { ...userWithoutPassword, role: "user" } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno no servidor",
      });
    }
  });

  // Pathologies routes - PUBLIC (list only, no auth needed)
  // Access control happens at subscription/content level, not at program listing
  app.get("/api/pathologies", async (req, res) => {
    try {
      const pathologies = await storage.getPathologies();
      console.log(`GET /api/pathologies -> returned ${pathologies.length} items`);
      res.json(pathologies);
    } catch (error) {
      console.error("/api/pathologies error", error);
      res.status(500).json({ error: "Internal server error", details: String(error) });
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
  app.get("/api/ebooks", async (req, res) => {
    try {
      const pathologyId = req.query.pathologyId ? parseInt(req.query.pathologyId as string) : undefined;
      let ebooks;
      if (pathologyId) {
        ebooks = await storage.getEbooksByPathology(pathologyId);
      } else {
        ebooks = await storage.getEbooks();
      }
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
  app.get("/api/subscriptions/user/:userId", requireUser, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const subscription = await storage.getSubscriptionByUser(userId);
      res.json(subscription || null);
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

      // Iniciar sessão admin
      req.session.adminId = admin.id;
      await req.session.save();

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
  app.get("/api/admin/statistics", requireAdmin, async (_req, res) => {
  try {
    const stats = await storage.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error("Statistics error:", error); // já deve existir
    res.status(500).json({ error: String(error) }); // temporário para ver o erro
  }
});

  // Admin - Users management
  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getUsers();
      const usersWithoutPassword = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
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

  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
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

  // Admin - Upload cover image to Cloudinary
  app.post("/api/admin/upload/image", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum ficheiro enviado" });
      }
      const folder = (req.body.folder as string) || "doce-leveza";
      const publicId = req.body.publicId as string | undefined;
      const url = await uploadImageToCloudinary(req.file.buffer, folder, publicId);
      res.json({ url });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ error: "Falha ao fazer upload da imagem" });
    }
  });

  app.post("/api/admin/upload/pdf", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum ficheiro enviado" });
      }
      const allowed = ["application/pdf"];
      if (!allowed.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Apenas ficheiros PDF são permitidos" });
      }
      const folder = (req.body.folder as string) || "doce-leveza/ebooks";
      const publicId = req.body.publicId as string | undefined;
      const url = await uploadRawToCloudinary(req.file.buffer, folder, publicId);
      res.json({ url });
    } catch (error) {
      console.error("Cloudinary PDF upload error:", error);
      res.status(500).json({ error: "Falha ao fazer upload do PDF" });
    }
  });

  // Admin - Pathologies management
  app.post("/api/admin/pathologies", requireAdmin, async (req, res) => {
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

  app.put("/api/admin/pathologies/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/admin/pathologies/:id", requireAdmin, async (req, res) => {
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
  app.post("/api/admin/videos", requireAdmin, async (req, res) => {
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

  app.put("/api/admin/videos/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertVideoSchema.parse(req.body);
      const video = await storage.updateVideo(parseInt(req.params.id), validatedData);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.patch("/api/admin/videos/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertVideoSchema.parse(req.body);
      const video = await storage.updateVideo(parseInt(req.params.id), validatedData);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.delete("/api/admin/videos/:id", requireAdmin, async (req, res) => {
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
  app.post("/api/admin/ebooks", requireAdmin, async (req, res) => {
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

  app.put("/api/admin/ebooks/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/admin/ebooks/:id", requireAdmin, async (req, res) => {
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
  app.get("/api/admin/consultations", requireAdmin, async (_req, res) => {
    try {
      const consultations = await storage.getConsultations();
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/consultations", requireAdmin, async (req, res) => {
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

  app.put("/api/admin/consultations/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/admin/consultations/:id", requireAdmin, async (req, res) => {
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
  app.get("/api/admin/subscriptions", requireAdmin, async (_req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/subscriptions", requireAdmin, async (req, res) => {
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

  app.put("/api/admin/subscriptions/:id", requireAdmin, async (req, res) => {
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

  app.patch("/api/admin/subscriptions/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateSubscription(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/subscriptions/:id", requireAdmin, async (req, res) => {
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

  // Admin Notifications
  app.get("/api/admin/notifications", requireAdmin, async (_req, res) => {
    const notifications = await storage.getAdminNotifications();
    res.json(notifications);
  });

  app.patch("/api/admin/notifications/:id/read", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.markAdminNotificationRead(id);
    if (!success) return res.status(404).send("Notification not found");
    res.sendStatus(204);
  });

  app.post("/api/admin/user-access", requireAdmin, async (req, res) => {
    try {
      const access = await storage.createUserAccess(req.body);
      res.json(access);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/user-access/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateUserAccess(id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });


  // Admin - Leads management
  app.delete("/api/admin/leads/:id", async (req, res) => {
    try {
      const success = await storage.deleteLead(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/users/:userId/access", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const access = await storage.getUserAccess(userId);
      res.json(access);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // exposed endpoint for current user to fetch own access records
  app.get("/api/user/access", requireUser, async (req, res) => {
    try {
      const userId = req.session.userId;
      const access = await storage.getUserAccess(userId);
      res.json(access);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Payment Proofs - Upload proof PDF to Cloudinary (user)
  app.post("/api/payments/upload-proof", requireUser, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum ficheiro enviado" });
      }
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Formato inválido. Use PDF, JPG ou PNG." });
      }
      const userId = req.session.userId;
      const isImage = req.file.mimetype.startsWith("image/");
      const folder = "doce-leveza/proofs";
      const publicId = `proof-${userId}-${Date.now()}`;
      let url: string;
      if (isImage) {
        url = await uploadImageToCloudinary(req.file.buffer, folder, publicId);
      } else {
        url = await uploadRawToCloudinary(req.file.buffer, folder, publicId);
      }
      res.json({ url });
    } catch (error) {
      console.error("Proof upload error:", error);
      res.status(500).json({ error: "Falha ao fazer upload do comprovativo" });
    }
  });

  // Payment Proofs - Submit payment proof record
  app.post("/api/payments/submit", requireUser, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { programId, amount, proofUrl } = req.body;

      if (!programId) {
        return res.status(400).json({ error: "ID do programa é obrigatório" });
      }
      if (amount === undefined || amount === null) {
        return res.status(400).json({ error: "Valor do pagamento é obrigatório" });
      }
      if (!proofUrl) {
        return res.status(400).json({ error: "URL do comprovativo é obrigatória" });
      }

      const paymentProof = await storage.createPaymentProof({
        userId,
        pathologyId: programId,
        amount,
        proofUrl,
        status: "pendente",
      });

      storage.createAdminNotification({
        title: "Novo comprovante de pagamento",
        message: `Utilizador #${userId} enviou comprovante para o programa #${programId} (${amount} Kz). Aguarda verificação.`,
        type: "payment",
        relatedId: paymentProof.id,
      }).catch(() => {});

      res.json(paymentProof);
    } catch (error) {
      console.error("Payment submission error:", error);
      res.status(500).json({ error: "Falha ao registar pagamento" });
    }
  });

  // Get payment proofs by user
  app.get("/api/payments/user/:userId", requireUser, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const currentUserId = req.session.userId;

      // Users can only see their own payment proofs
      if (userId !== currentUserId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const proofs = await storage.getPaymentProofsByUser(userId);
      res.json(proofs);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin - Get all payment proofs
  app.get("/api/admin/payments", requireAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const proofs = await storage.getPaymentProofs(status);
      res.json(proofs);
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin - Approve payment proof
  app.put("/api/admin/payments/:id/approve", requireAdmin, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const adminId = req.session.adminId;

      if (isNaN(paymentId)) {
        return res.status(400).json({ error: "Invalid payment ID" });
      }

      const proof = await storage.approvePaymentProof(paymentId, adminId || 1);

      if (proof) {
        const renewalDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const startDate = new Date().toISOString();

        // Create/update a user_access record for the specific program paid
        const existingAccess = await storage.getUserAccess(proof.userId);
        const accessForPathology = existingAccess.find(a => a.pathologyId === proof.pathologyId);
        if (accessForPathology) {
          await storage.updateUserAccess(accessForPathology.id, {
            status: "ativo",
            startDate,
            expiryDate: renewalDate,
          });
        } else {
          await storage.createUserAccess({
            userId: proof.userId,
            pathologyId: proof.pathologyId,
            status: "ativo",
            startDate,
            expiryDate: renewalDate,
          });
        }

        // Track subscription for admin visibility (status "por_programa" ≠ "ativa",
        // so it does NOT grant blanket access to all programs on the frontend)
        const existingSub = await storage.getSubscriptionByUser(proof.userId);
        if (existingSub) {
          await storage.updateSubscription(existingSub.id, {
            status: "por_programa",
            renewalDate,
            proofUrl: proof.proofUrl,
          });
        } else {
          await storage.createSubscription({
            userId: proof.userId,
            plan: "programa",
            status: "por_programa",
            startDate,
            renewalDate,
            paymentMethod: "transferencia-bancaria",
            proofUrl: proof.proofUrl,
          });
        }

        // Notify the user their payment was approved
        storage.createNotification({
          userId: proof.userId,
          title: "Pagamento aprovado!",
          message: "O seu comprovante foi verificado e já tens acesso ao programa. Bom estudo!",
          type: "content",
        }).catch(() => {});
      }

      res.json(proof);
    } catch (error) {
      console.error("Approve payment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin - Reject payment proof
  app.put("/api/admin/payments/:id/reject", requireAdmin, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { adminNotes } = req.body;

      if (isNaN(paymentId)) {
        return res.status(400).json({ error: "Invalid payment ID" });
      }

      const proof = await storage.rejectPaymentProof(paymentId, adminNotes || "");

      // Notify the user their payment was rejected
      if (proof) {
        storage.createNotification({
          userId: proof.userId,
          title: "Comprovante rejeitado",
          message: `O seu comprovante de pagamento foi rejeitado. ${adminNotes ? "Motivo: " + adminNotes : "Contacte o suporte para mais informações."}`,
          type: "info",
        }).catch(() => {});
      }

      res.json(proof);
    } catch (error) {
      console.error("Reject payment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin - Migrate existing "ativa" subscriptions to per-program access
  // Finds approved payment proofs, creates user_access records, updates subscription status
  app.post("/api/admin/migrate-access", requireAdmin, async (req, res) => {
    try {
      const approvedProofs = await storage.getPaymentProofs("aprovado");
      const fixed: number[] = [];

      for (const proof of approvedProofs) {
        // Ensure a user_access record exists for this pathology
        const existingAccess = await storage.getUserAccess(proof.userId);
        const accessForPathology = existingAccess.find(a => a.pathologyId === proof.pathologyId);
        const renewalDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

        if (accessForPathology) {
          if (accessForPathology.status !== "ativo") {
            await storage.updateUserAccess(accessForPathology.id, { status: "ativo", expiryDate: renewalDate });
            fixed.push(proof.userId);
          }
        } else {
          await storage.createUserAccess({
            userId: proof.userId,
            pathologyId: proof.pathologyId,
            status: "ativo",
            startDate: new Date().toISOString(),
            expiryDate: renewalDate,
          });
          fixed.push(proof.userId);
        }

        // Fix subscription status if it's "ativa" (blanket access) → should be "por_programa"
        const sub = await storage.getSubscriptionByUser(proof.userId);
        if (sub && sub.status === "ativa") {
          await storage.updateSubscription(sub.id, { status: "por_programa" });
        }
      }

      res.json({ success: true, fixedUsers: [...new Set(fixed)], totalProofs: approvedProofs.length });
    } catch (error) {
      console.error("Migrate access error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
