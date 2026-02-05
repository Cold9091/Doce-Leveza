import { 
  type Lead, 
  type User, 
  type SignupData,
  type Pathology,
  type InsertPathology,
  type Video,
  type Ebook,
  type Consultation,
  type Subscription,
  type UserAccess,
  type InsertVideo,
  type InsertEbook,
  type InsertConsultation,
  type InsertSubscription,
  type AdminUser,
  type AdminLoginData,
  type Statistics,
  type SystemSettings,
  type InsertSystemSettings,
  type AdminNotification,
  type InsertAdminNotification,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Leads
  createLead(lead: Lead): Promise<Lead & { id: string }>;
  getLeads(): Promise<(Lead & { id: string })[]>;
  deleteLead(id: string): Promise<boolean>;

  // Users
  createUser(data: SignupData): Promise<User>;
  getUserByPhone(phone: string): Promise<User | null>;
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | null>;
  updateUser(id: number, data: Partial<User>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;

  // Pathologies/Programs
  getPathologies(): Promise<Pathology[]>;
  getPathologyById(id: number): Promise<Pathology | null>;
  getPathologyBySlug(slug: string): Promise<Pathology | null>;
  createPathology(data: InsertPathology): Promise<Pathology>;
  updatePathology(id: number, data: Partial<Pathology>): Promise<Pathology | null>;
  deletePathology(id: number): Promise<boolean>;

  // Videos
  getVideos(): Promise<Video[]>;
  getVideosByPathology(pathologyId: number): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | null>;
  createVideo(data: InsertVideo): Promise<Video>;
  updateVideo(id: number, data: Partial<Video>): Promise<Video | null>;
  deleteVideo(id: number): Promise<boolean>;

  // Ebooks
  getEbooks(): Promise<Ebook[]>;
  getEbooksByPathology(pathologyId: number): Promise<Ebook[]>;
  getEbookById(id: number): Promise<Ebook | null>;
  createEbook(data: InsertEbook): Promise<Ebook>;
  updateEbook(id: number, data: Partial<Ebook>): Promise<Ebook | null>;
  deleteEbook(id: number): Promise<boolean>;

  // Consultations
  getConsultations(): Promise<Consultation[]>;
  getConsultationsByUser(userId: number): Promise<Consultation[]>;
  getConsultationById(id: number): Promise<Consultation | null>;
  createConsultation(data: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: number, data: Partial<Consultation>): Promise<Consultation | null>;
  deleteConsultation(id: number): Promise<boolean>;

  // Subscriptions
  getSubscriptions(): Promise<Subscription[]>;
  getSubscriptionByUser(userId: number): Promise<Subscription | null>;
  createSubscription(data: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | null>;
  deleteSubscription(id: number): Promise<boolean>;

  // User Access
  getUserAccess(userId: number): Promise<UserAccess[]>;
  createUserAccess(data: any): Promise<UserAccess>;
  updateUserAccess(id: number, data: any): Promise<UserAccess | null>;

  // Notifications
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(data: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<boolean>;

  // Admin
  getAdminById(id: number): Promise<AdminUser | null>;
  getAdminByEmail(email: string): Promise<AdminUser | null>;
  getStatistics(): Promise<Statistics>;

  // Admin Notifications
  getAdminNotifications(): Promise<AdminNotification[]>;
  createAdminNotification(data: InsertAdminNotification): Promise<AdminNotification>;
  markAdminNotificationRead(id: number): Promise<boolean>;

  // Settings
  getSettings(): Promise<SystemSettings>;
  updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings>;
}

export class MemStorage implements IStorage {
  private leads: Map<string, Lead & { id: string }>;
  private users: Map<number, User>;
  private pathologies: Map<number, Pathology>;
  private videos: Map<number, Video>;
  private ebooks: Map<number, Ebook>;
  private consultations: Map<number, Consultation>;
  private subscriptions: Map<number, Subscription>;
  private userAccess: Map<number, UserAccess>;
  private admins: Map<number, AdminUser>;
  private notifications: Map<number, Notification>;
  private adminNotifications: Map<number, AdminNotification>;
  private settings: SystemSettings;

  private userIdCounter: number;
  private pathologyIdCounter: number;
  private videoIdCounter: number;
  private ebookIdCounter: number;
  private consultationIdCounter: number;
  private subscriptionIdCounter: number;
  private userAccessIdCounter: number;
  private notificationIdCounter: number;
  private adminNotificationIdCounter: number;

  constructor() {
    this.leads = new Map();
    this.users = new Map();
    this.pathologies = new Map();
    this.videos = new Map();
    this.ebooks = new Map();
    this.consultations = new Map();
    this.subscriptions = new Map();
    this.userAccess = new Map();
    this.admins = new Map();
    this.notifications = new Map();
    this.adminNotifications = new Map();

    this.userIdCounter = 1;
    this.pathologyIdCounter = 1;
    this.videoIdCounter = 1;
    this.ebookIdCounter = 1;
    this.consultationIdCounter = 1;
    this.subscriptionIdCounter = 1;
    this.userAccessIdCounter = 1;
    this.notificationIdCounter = 1;
    this.adminNotificationIdCounter = 1;

    this.settings = {
      id: 1,
      siteName: "Doce Leveza",
      supportEmail: "suporte@doceleveza.com",
      supportPhone: "(11) 99999-9999",
      maintenanceMode: false,
      enableSignup: true,
    };
  }

  async getSettings(): Promise<SystemSettings> {
    return this.settings;
  }

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    this.settings = { ...this.settings, ...data };
    return this.settings;
  }

  private async seedUsers() {
    const demoUsers: User[] = [
      {
        id: this.userIdCounter++,
        name: "Maria Silva",
        phone: "912345678",
        address: "Rua das Flores, 123, Luanda",
        password: "password123",
        createdAt: new Date().toISOString(),
      },
      {
        id: this.userIdCounter++,
        name: "João Pereira",
        phone: "923456789",
        address: "Av. Independência, 45, Talatona",
        password: "password123",
        createdAt: new Date().toISOString(),
      },
      {
        id: this.userIdCounter++,
        name: "Ana Santos",
        phone: "934567890",
        address: "Bairro Alvalade, Luanda",
        password: "password123",
        createdAt: new Date().toISOString(),
      },
      {
        id: this.userIdCounter++,
        name: "Carlos Gomes",
        phone: "945678901",
        address: "Centralidade do Kilamba, Bloco A",
        password: "password123",
        createdAt: new Date().toISOString(),
      },
      {
        id: this.userIdCounter++,
        name: "Aluna Multi Programas",
        phone: "999000111",
        address: "Teste Endereço, Luanda",
        password: "senha123",
        createdAt: new Date().toISOString(),
      },
      {
        id: this.userIdCounter++,
        name: "Aluna Programa Único",
        phone: "999000222",
        address: "Teste Endereço, Luanda",
        password: "senha123",
        createdAt: new Date().toISOString(),
      }
    ];

    demoUsers.forEach(u => this.users.set(u.id, u));

    // Seed User Access
    const multiProgramUserId = 5;
    const singleProgramUserId = 6;

    const demoAccess: UserAccess[] = [
      {
        id: this.userAccessIdCounter++,
        userId: multiProgramUserId,
        pathologyId: 1,
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: "activo",
      },
      {
        id: this.userAccessIdCounter++,
        userId: multiProgramUserId,
        pathologyId: 2,
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: "activo",
      },
      {
        id: this.userAccessIdCounter++,
        userId: singleProgramUserId,
        pathologyId: 3,
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: "activo",
      }
    ];
    demoAccess.forEach(a => this.userAccess.set(a.id, a));

    const demoSubscriptions: Subscription[] = [
      {
        id: this.subscriptionIdCounter++,
        userId: 1,
        plan: "mensal",
        status: "ativa",
        startDate: new Date().toISOString(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: "Transferência",
        proofUrl: "https://images.unsplash.com/photo-1554224155-1696413565d3?w=800&q=80",
      },
      {
        id: this.subscriptionIdCounter++,
        userId: 2,
        plan: "anual",
        status: "ativa",
        startDate: new Date().toISOString(),
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: "Referência",
        proofUrl: "https://images.unsplash.com/photo-1554224155-1696413565d3?w=800&q=80",
      }
    ];
    demoSubscriptions.forEach(s => this.subscriptions.set(s.id, s));
  }

  async createLead(lead: Lead): Promise<Lead & { id: string }> {
    const id = randomUUID();
    const leadWithId = { ...lead, id };
    this.leads.set(id, leadWithId);
    return leadWithId;
  }

  async getLeads(): Promise<(Lead & { id: string })[]> {
    return Array.from(this.leads.values());
  }

  async deleteLead(id: string): Promise<boolean> {
    return this.leads.delete(id);
  }

  async createUser(data: SignupData): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      id,
      name: data.name,
      phone: data.phone,
      address: data.address,
      password: data.password,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    return users.find(user => user.phone === phone) || null;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getPathologies(): Promise<Pathology[]> {
    return Array.from(this.pathologies.values());
  }

  async getPathologyById(id: number): Promise<Pathology | null> {
    return this.pathologies.get(id) || null;
  }

  async getPathologyBySlug(slug: string): Promise<Pathology | null> {
    const pathologies = Array.from(this.pathologies.values());
    return pathologies.find(p => p.slug === slug) || null;
  }

  async createPathology(data: InsertPathology): Promise<Pathology> {
    const id = this.pathologyIdCounter++;
    const pathology: Pathology = { id, ...data };
    this.pathologies.set(id, pathology);
    return pathology;
  }

  async updatePathology(id: number, data: Partial<Pathology>): Promise<Pathology | null> {
    const pathology = this.pathologies.get(id);
    if (!pathology) return null;
    const updated = { ...pathology, ...data };
    this.pathologies.set(id, updated);
    return updated;
  }

  async deletePathology(id: number): Promise<boolean> {
    return this.pathologies.delete(id);
  }

  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getVideosByPathology(pathologyId: number): Promise<Video[]> {
    const videos = Array.from(this.videos.values());
    return videos.filter(v => v.pathologyId === pathologyId);
  }

  async getVideoById(id: number): Promise<Video | null> {
    return this.videos.get(id) || null;
  }

  async createVideo(data: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const video: Video = { id, ...data };
    this.videos.set(id, video);
    return video;
  }

  async updateVideo(id: number, data: Partial<Video>): Promise<Video | null> {
    const video = this.videos.get(id);
    if (!video) return null;
    const updated = { ...video, ...data };
    this.videos.set(id, updated);
    return updated;
  }

  async deleteVideo(id: number): Promise<boolean> {
    return this.videos.delete(id);
  }

  async getEbooks(): Promise<Ebook[]> {
    return Array.from(this.ebooks.values());
  }

  async getEbooksByPathology(pathologyId: number): Promise<Ebook[]> {
    const ebooks = Array.from(this.ebooks.values());
    return ebooks.filter(e => e.pathologyId === pathologyId);
  }

  async getEbookById(id: number): Promise<Ebook | null> {
    return this.ebooks.get(id) || null;
  }

  async createEbook(data: InsertEbook): Promise<Ebook> {
    const id = this.ebookIdCounter++;
    const ebook: Ebook = { id, ...data };
    this.ebooks.set(id, ebook);
    return ebook;
  }

  async updateEbook(id: number, data: Partial<Ebook>): Promise<Ebook | null> {
    const ebook = this.ebooks.get(id);
    if (!ebook) return null;
    const updated = { ...ebook, ...data };
    this.ebooks.set(id, updated);
    return updated;
  }

  async deleteEbook(id: number): Promise<boolean> {
    return this.ebooks.delete(id);
  }

  async getConsultations(): Promise<Consultation[]> {
    return Array.from(this.consultations.values());
  }

  async getConsultationsByUser(userId: number): Promise<Consultation[]> {
    const consultations = Array.from(this.consultations.values());
    return consultations.filter(c => c.userId === userId);
  }

  async getConsultationById(id: number): Promise<Consultation | null> {
    return this.consultations.get(id) || null;
  }

  async createConsultation(data: InsertConsultation): Promise<Consultation> {
    const id = this.consultationIdCounter++;
    const consultation: Consultation = { 
      id, 
      ...data,
      status: data.status || "agendada"
    };
    this.consultations.set(id, consultation);
    return consultation;
  }

  async updateConsultation(id: number, data: Partial<Consultation>): Promise<Consultation | null> {
    const consultation = this.consultations.get(id);
    if (!consultation) return null;
    const updated = { ...consultation, ...data };
    this.consultations.set(id, updated);
    return updated;
  }

  async deleteConsultation(id: number): Promise<boolean> {
    return this.consultations.delete(id);
  }

  async getSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async getSubscriptionByUser(userId: number): Promise<Subscription | null> {
    const subscriptions = Array.from(this.subscriptions.values());
    return subscriptions.find(s => s.userId === userId) || null;
  }

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionIdCounter++;
    const subscription: Subscription = { id, ...data };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | null> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return null;
    const updated = { ...subscription, ...data };
    this.subscriptions.set(id, updated);
    return updated;
  }

  async deleteSubscription(id: number): Promise<boolean> {
    return this.subscriptions.delete(id);
  }

  async getUserAccess(userId: number): Promise<UserAccess[]> {
    return Array.from(this.userAccess.values()).filter(a => a.userId === userId);
  }

  async createUserAccess(data: any): Promise<UserAccess> {
    const id = this.userAccessIdCounter++;
    const access: UserAccess = { id, ...data };
    this.userAccess.set(id, access);
    return access;
  }

  async updateUserAccess(id: number, data: any): Promise<UserAccess | null> {
    const access = this.userAccess.get(id);
    if (!access) return null;
    const updated = { ...access, ...data };
    this.userAccess.set(id, updated);
    return updated;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const notification: Notification = { id, ...data };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    notification.read = true;
    return true;
  }

  async getAdminById(id: number): Promise<AdminUser | null> {
    return this.admins.get(id) || null;
  }

  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    const admins = Array.from(this.admins.values());
    return admins.find(a => a.email === email) || null;
  }

  async getStatistics(): Promise<Statistics> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = Array.from(this.users.values()).filter(
      u => new Date(u.createdAt) >= thirtyDaysAgo
    ).length;

    const activeSubscriptions = Array.from(this.subscriptions.values()).filter(
      s => s.status === "ativa"
    ).length;

    return {
      totalUsers: this.users.size,
      activeSubscriptions,
      totalVideos: this.videos.size,
      totalEbooks: this.ebooks.size,
      totalConsultations: this.consultations.size,
      totalLeads: this.leads.size,
      recentUsers,
    };
  }

  async getAdminNotifications(): Promise<AdminNotification[]> {
    return Array.from(this.adminNotifications.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAdminNotification(data: InsertAdminNotification): Promise<AdminNotification> {
    const id = this.adminNotificationIdCounter++;
    const notification: AdminNotification = { id, ...data };
    this.adminNotifications.set(id, notification);
    return notification;
  }

  async markAdminNotificationRead(id: number): Promise<boolean> {
    const notification = this.adminNotifications.get(id);
    if (!notification) return false;
    notification.read = true;
    return true;
  }
}

export const storage = new MemStorage();
