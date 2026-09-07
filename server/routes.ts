import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { getIronSession } from "iron-session";
import { sessionOptions } from "./session.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import multer from "multer";
import bcrypt from "bcryptjs";
import { uploadImageToCloudinary, uploadRawToCloudinary } from "./cloudinary.js";
import {
  leadSchema,
  signupSchema,
  loginSchema,
  adminLoginSchema,
  insertPathologySchema,
  insertPlanSchema,
  insertVideoSchema,
  insertEbookSchema,
  insertConsultationSchema,
  insertSubscriptionSchema,
  insertUserAccessSchema,
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
  app.use("/api/auth/forgot-password", authLimiter);

  // Configuração de sessão segura
  // Configuração de sessão segura (Iron Session)
  app.use(async (req, res, next) => {
    const session = await getIronSession(req, res, sessionOptions);
    // @ts-ignore - Augment request with session
    req.session = session;
    next();
  });

  // Dashboard responses are user-specific and change after admin actions.
  // Prevent browser/CDN caches from serving outdated API data.
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
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

  const canAccessProgram = async (userId: number, pathologyId: number): Promise<boolean> => {
    const subscription = await storage.getSubscriptionByUser(userId);
    const subscriptionIsCurrent = !!subscription && new Date(subscription.renewalDate) > new Date();
    if (subscriptionIsCurrent && subscription.status === "ativa") return true;

    const accesses = await storage.getUserAccess(userId);
    return accesses.some((access) =>
      access.pathologyId === pathologyId &&
      access.status === "ativo" &&
      new Date(access.expiryDate) > new Date()
    );
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

      const currentMatch = user.password.startsWith("$2")
        ? await bcrypt.compare(currentPassword, user.password)
        : user.password === currentPassword;
      if (!currentMatch) {
        return res.status(401).json({ error: "Senha atual incorreta" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "A nova senha deve ter pelo menos 6 caracteres" });
      }

      const hashedNew = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(userId, { password: hashedNew });
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

  // Public settings endpoint (only exposes safe, public-facing fields)
  app.get("/api/settings/public", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json({ whatsappCommunityUrl: settings.whatsappCommunityUrl ?? null });
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
      const validatedData = systemSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Notifications
  app.get("/api/notifications/user/:userId", requireUser, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      // Users can only read their own notifications
      if (userId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/notifications/:id/read", requireUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Verify the notification belongs to the session user before marking as read
      const userNotifications = await storage.getNotificationsByUser(req.session.userId!);
      const owned = userNotifications.some(n => n.id === id);
      if (!owned) {
        return res.status(403).json({ error: "Forbidden" });
      }
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

  // Get all leads (admin only)
  app.get("/api/leads", requireAdmin, async (_req, res) => {
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

  // Forgot password — reset via phone number
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { phone, newPassword } = req.body;

      if (!phone || !newPassword) {
        return res.status(400).json({ success: false, error: "Telefone e nova senha são obrigatórios" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: "A senha deve ter pelo menos 6 caracteres" });
      }

      const user = await storage.getUserByPhone(phone);
      if (!user) {
        // Return success anyway to prevent phone enumeration
        return res.json({ success: true, message: "Se o número estiver registado, a senha foi redefinida." });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(user.id, { password: hashed });

      res.json({ success: true, message: "Senha redefinida com sucesso." });
    } catch (error) {
      res.status(500).json({ success: false, error: "Erro interno. Tente novamente." });
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

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({ ...validatedData, password: hashedPassword });

      console.log(`✅ User ${user.id} created`);

      // Iniciar sessão automaticamente após registo
      req.session.userId = user.id;
      await req.session.save();

      // Notify admins of new registration
      storage.createAdminNotification({
        title: "Novo utilizador registado",
        message: `${user.name} (${user.phone}) criou uma conta.`,
        type: "info",
        relatedId: user.id,
      }).catch(() => {});

      // Don't send password back
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({ success: true, data: { ...userWithoutPassword, role: "user" } });
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
        const adminPasswordMatch = admin && (
          admin.password.startsWith("$2") ? await bcrypt.compare(password, admin.password) : admin.password === password
        );
        if (adminPasswordMatch) {
          req.session.adminId = admin!.id;
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

      const userPasswordMatch = user && (
        user.password.startsWith("$2") ? await bcrypt.compare(password, user.password) : user.password === password
      );
      if (!user || !userPasswordMatch) {
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

  // Active plan choices are public; payment values are always resolved again on submit.
  app.get("/api/plans", async (_req, res) => {
    try {
      const catalogPlans = (await storage.getActivePlans()).map(
        ({ whatsappUrl: _whatsappUrl, bonusContentUrl: _bonusContentUrl, ...plan }) => plan
      );
      res.json(catalogPlans);
    } catch (_error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Videos routes
  app.get("/api/videos", requireUser, async (req, res) => {
    try {
      const videos = await storage.getVideos();
      const allowed = await Promise.all(
        videos.map(async (video) => canAccessProgram(req.session.userId!, video.pathologyId))
      );
      res.json(videos.filter((_video, index) => allowed[index]));
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/videos/:id", requireUser, async (req, res) => {
    try {
      const video = await storage.getVideoById(parseInt(req.params.id));
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      if (!(await canAccessProgram(req.session.userId!, video.pathologyId))) {
        return res.status(403).json({ error: "Sem acesso a este programa" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/videos/:id/view", requireUser, async (req, res) => {
    try {
      const video = await storage.getVideoById(parseInt(req.params.id));
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      if (!(await canAccessProgram(req.session.userId!, video.pathologyId))) {
        return res.status(403).json({ error: "Sem acesso a este programa" });
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
  app.get("/api/ebooks", requireUser, async (req, res) => {
    try {
      const pathologyId = req.query.pathologyId ? parseInt(req.query.pathologyId as string) : undefined;
      let ebooks;
      if (pathologyId) {
        ebooks = await storage.getEbooksByPathology(pathologyId);
      } else {
        ebooks = await storage.getEbooks();
      }
      const allowed = await Promise.all(
        ebooks.map(async (ebook) =>
          ebook.pathologyId === null || canAccessProgram(req.session.userId!, ebook.pathologyId)
        )
      );
      res.json(ebooks.filter((_ebook, index) => allowed[index]));
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/ebooks/:id", requireUser, async (req, res) => {
    try {
      const ebook = await storage.getEbookById(parseInt(req.params.id));
      if (!ebook) {
        return res.status(404).json({ error: "Ebook not found" });
      }
      if (ebook.pathologyId !== null && !(await canAccessProgram(req.session.userId!, ebook.pathologyId))) {
        return res.status(403).json({ error: "Sem acesso a este programa" });
      }
      res.json(ebook);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Consultations routes
  app.get("/api/consultations/user/:userId", requireUser, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      // Users can only see their own consultations
      if (userId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const consultations = await storage.getConsultationsByUser(userId);
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/consultations", requireUser, async (req, res) => {
    try {
      // Force userId from session — never trust the body
      const validatedData = insertConsultationSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
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

  // Student cancel/reschedule consultation
  app.patch("/api/consultations/:id", requireUser, async (req, res) => {
    try {
      const consultationId = parseInt(req.params.id);
      // Verify ownership — users may only modify their own consultations
      const existing = await storage.getConsultationsByUser(req.session.userId!);
      const owned = existing.some(c => c.id === consultationId);
      if (!owned) {
        return res.status(403).json({ error: "Forbidden" });
      }
      // Only allow changing status/datetime — no userId override
      const allowedStatuses = ["cancelada", "pendente", "reagendada"];
      const updateData: Record<string, string> = {};
      if (req.body.status && allowedStatuses.includes(req.body.status)) {
        updateData.status = req.body.status;
      }
      if (req.body.datetime && typeof req.body.datetime === "string") {
        updateData.datetime = req.body.datetime;
      }
      const consultation = await storage.updateConsultation(consultationId, updateData);
      if (!consultation) {
        return res.status(404).json({ error: "Consultation not found" });
      }
      res.json(consultation);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Subscriptions routes
  app.get("/api/subscriptions/user/:userId", requireUser, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      // Users can only see their own subscription
      if (userId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const subscription = await storage.getSubscriptionByUser(userId);
      res.json(subscription || null);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/subscriptions/cancel", requireUser, async (req, res) => {
    try {
      const current = await storage.getSubscriptionByUser(req.session.userId!);
      if (!current) {
        return res.status(404).json({ error: "Assinatura não encontrada" });
      }
      if (current.status === "inativa") {
        return res.status(400).json({ error: "A assinatura já está cancelada" });
      }

      const cancelled = await storage.cancelUserSubscription(req.session.userId!);
      res.json({ success: true, subscription: cancelled });
    } catch (error) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({ error: "Não foi possível cancelar a assinatura" });
    }
  });

  app.get("/api/user/active-plan", requireUser, async (req, res) => {
    try {
      const subscription = await storage.getSubscriptionByUser(req.session.userId!);
      if (
        !subscription?.planId ||
        !["ativa", "por_programa"].includes(subscription.status) ||
        new Date(subscription.renewalDate) <= new Date()
      ) {
        return res.json(null);
      }

      const plan = await storage.getPlanById(subscription.planId);
      if (!plan || plan.active !== 1) {
        return res.json(null);
      }

      res.json({
        ...plan,
        startDate: subscription.startDate,
        expiryDate: subscription.renewalDate,
        expiresAt: subscription.renewalDate,
        subscriptionStatus: subscription.status,
      });
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

      const adminMatch = admin && (
        admin.password.startsWith("$2") ? await bcrypt.compare(validatedData.password, admin.password) : admin.password === validatedData.password
      );
      if (!adminMatch) {
        return res.status(401).json({
          success: false,
          error: "Email ou senha incorretos",
        });
      }

      // Iniciar sessão admin
      req.session.adminId = admin!.id;
      await req.session.save();

      const { password, ...adminWithoutPassword } = admin!;
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
      // Whitelist only safe editable fields — never allow arbitrary mass assignment
      const { name, phone, address, password } = req.body;
      const allowed: Record<string, string> = {};
      if (name && typeof name === "string") allowed.name = name.trim();
      if (phone && typeof phone === "string") allowed.phone = phone.trim();
      if (address && typeof address === "string") allowed.address = address.trim();
      if (password && typeof password === "string" && password.length >= 6) {
        // Admin setting a new password must always be hashed
        allowed.password = await bcrypt.hash(password, 10);
      }
      if (Object.keys(allowed).length === 0) {
        return res.status(400).json({ error: "Nenhum campo válido para atualizar" });
      }
      const user = await storage.updateUser(parseInt(req.params.id), allowed);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _pw, ...userWithoutPassword } = user;
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

  // Admin - Plans management
  app.get("/api/admin/plans", requireAdmin, async (_req, res) => {
    try {
      res.json(await storage.getPlans());
    } catch (_error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/plans", requireAdmin, async (req, res) => {
    try {
      const normalizedBody = {
        ...req.body,
        whatsappUrl: req.body.whatsappUrl?.trim() || null,
        bonusContentUrl: req.body.bonusContentUrl?.trim() || null,
        durationDays: req.body.type === "ilimitado" && (!req.body.durationDays || req.body.durationDays < 1)
          ? 365
          : req.body.durationDays,
      };
      const data = insertPlanSchema.parse(normalizedBody);
      if (data.pathologyId != null && !await storage.getPathologyById(data.pathologyId)) {
        return res.status(400).json({ error: "Programa não encontrado" });
      }

      if (data.type === "ilimitado") {
        const existingUnlimited = (await storage.getPlans()).find(
          (plan) => plan.type === "ilimitado" && plan.pathologyId === null
        );
        if (existingUnlimited) {
          const updated = await storage.updatePlan(existingUnlimited.id, data);
          return res.status(200).json(updated);
        }
      }

      res.status(201).json(await storage.createPlan(data));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Create plan error:", error);
      res.status(500).json({ error: "Não foi possível guardar o plano", details: error?.message });
    }
  });

  app.patch("/api/admin/plans/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getPlanById(id);
      if (!existing) return res.status(404).json({ error: "Plano não encontrado" });
      const changes = z.object({
        pathologyId: z.number().int().positive().nullable().optional(),
        type: z.enum(["mensal", "trimestral", "ilimitado"]).optional(),
        price: z.number().int().nonnegative().optional(),
        durationDays: z.number().int().nonnegative().optional(),
        whatsappUrl: z.string().url().nullable().optional(),
        bonusContentUrl: z.string().url().nullable().optional(),
        active: z.number().int().min(0).max(1).optional(),
      }).parse(req.body);
      const data = insertPlanSchema.parse({ ...existing, ...changes });
      if (data.pathologyId != null && !await storage.getPathologyById(data.pathologyId)) {
        return res.status(400).json({ error: "Programa não encontrado" });
      }
      res.json(await storage.updatePlan(id, changes));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/plans/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!await storage.getPlanById(id)) return res.status(404).json({ error: "Plano não encontrado" });
      const data = insertPlanSchema.parse({
        ...req.body,
        whatsappUrl: req.body.whatsappUrl?.trim() || null,
        bonusContentUrl: req.body.bonusContentUrl?.trim() || null,
        durationDays: req.body.type === "ilimitado" && (!req.body.durationDays || req.body.durationDays < 1)
          ? 365
          : req.body.durationDays,
      });
      if (data.pathologyId != null && !await storage.getPathologyById(data.pathologyId)) {
        return res.status(400).json({ error: "Programa não encontrado" });
      }
      res.json(await storage.updatePlan(id, data));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Update plan error:", error);
      res.status(500).json({ error: "Não foi possível actualizar o plano", details: error?.message });
    }
  });

  app.delete("/api/admin/plans/:id", requireAdmin, async (req, res) => {
    try {
      if (!await storage.deletePlan(parseInt(req.params.id))) {
        return res.status(404).json({ error: "Plano não encontrado" });
      }
      res.json({ success: true });
    } catch (_error) {
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
      const validatedData = insertUserAccessSchema.parse(req.body);
      const access = await storage.createUserAccess(validatedData);
      res.json(access);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/user-access/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUserAccessSchema.partial().parse(req.body);
      const updated = await storage.updateUserAccess(id, validatedData);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(400).json({ message: error.message });
    }
  });


  // Admin - Leads management
  app.delete("/api/admin/leads/:id", requireAdmin, async (req, res) => {
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
      const access = await storage.getUserAccess(userId!);
      res.json(access);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // exposed endpoint for current user to fetch own access records
  app.get("/api/user/access", requireUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
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
      const userId = req.session.userId!;

      // The client selects a plan only. Amount and program are resolved from it.
      const paymentSchema = z.object({
        planId: z.number().int().positive("ID do plano inválido"),
        proofUrl: z.string().url("URL do comprovativo inválida").min(1, "URL do comprovativo é obrigatória"),
      });

      const parsed = paymentSchema.safeParse({
        ...req.body,
        planId: typeof req.body.planId === "string" ? parseInt(req.body.planId) : req.body.planId,
      });

      if (!parsed.success) {
        return res.status(400).json({ error: "Dados de pagamento inválidos", details: parsed.error.errors });
      }

      const { planId, proofUrl } = parsed.data;
      const plan = await storage.getPlanById(planId);
      if (!plan || plan.active !== 1) {
        return res.status(404).json({ error: "Plano não encontrado ou indisponível" });
      }
      if (plan.type !== "ilimitado" && plan.pathologyId == null) {
        return res.status(400).json({ error: "Plano sem programa associado" });
      }

      const paymentProof = await storage.createPaymentProof({
        userId,
        // Legacy column remains required. Zero identifies a global unlimited plan.
        pathologyId: plan.pathologyId ?? 0,
        planId: plan.id,
        amount: plan.price,
        proofUrl,
        status: "pendente",
      });

      storage.createAdminNotification({
        title: "Novo comprovante de pagamento",
        message: `Utilizador #${userId} enviou comprovante para o plano #${plan.id} (${plan.price} Kz). Aguarda verificação.`,
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

      const pendingProof = await storage.getPaymentProofById(paymentId);
      if (!pendingProof) return res.status(404).json({ error: "Pagamento não encontrado" });
      if (pendingProof.status !== "pendente") return res.status(400).json({ error: "Este pagamento já foi processado" });
      if (!pendingProof.planId) return res.status(400).json({ error: "Pagamento legado sem plano associado" });
      const plan = await storage.getPlanById(pendingProof.planId);
      if (!plan) return res.status(400).json({ error: "Plano associado não encontrado" });

      const proof = await storage.approvePlanPayment(paymentId, adminId || 1, plan);
      if (proof) {
        // Notify the user their payment was approved
        storage.createNotification({
          userId: proof.userId,
          title: "Pagamento aprovado!",
          message: plan.type === "ilimitado"
            ? "O seu comprovante foi verificado e já tens acesso a todos os programas. Bom estudo!"
            : "O seu comprovante foi verificado e já tens acesso ao programa. Bom estudo!",
          type: "content",
        }).catch(() => {});
      }

      if (!proof) return res.status(409).json({ error: "Este pagamento já foi processado" });
      res.json(proof);
    } catch (error: any) {
      if (error?.message === "ACTIVE_UNLIMITED_PLAN") {
        return res.status(409).json({ error: "O utilizador já possui um plano ilimitado activo" });
      }
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
        if (proof.planId || proof.pathologyId === 0) continue;
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
        if (sub && !sub.planId && sub.status === "ativa") {
          await storage.updateSubscription(sub.id, { status: "por_programa" });
        }
      }

      res.json({ success: true, fixedUsers: Array.from(new Set(fixed)), totalProofs: approvedProofs.length });
    } catch (error) {
      console.error("Migrate access error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
