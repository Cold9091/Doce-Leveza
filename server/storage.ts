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
  type InsertSystemSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // ... (existing methods)
  getUserAccess(userId: number): Promise<UserAccess[]>;
  createUserAccess(data: any): Promise<UserAccess>;
  updateUserAccess(id: number, data: any): Promise<UserAccess | null>;

  // Settings
  getSettings(): Promise<SystemSettings>;
  updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings>;
}

export class MemStorage implements IStorage {
  private leads: Map<string, Lead & { id: string }>;
  private users: Map<number, User>;
  private pathologies: Map<number, Pathology>;
  private userAccess: Map<number, UserAccess>;
  private admins: Map<number, AdminUser>;
  private settings: SystemSettings;
  private userIdCounter: number;
  private pathologyIdCounter: number;
  private videoIdCounter: number;
  private ebookIdCounter: number;
  private consultationIdCounter: number;
  private subscriptionIdCounter: number;
  private userAccessIdCounter: number;

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
    this.userIdCounter = 1;
    this.pathologyIdCounter = 1;
    this.videoIdCounter = 1;
    this.ebookIdCounter = 1;
    this.consultationIdCounter = 1;
    this.subscriptionIdCounter = 1;
    this.userAccessIdCounter = 1;
    this.settings = {
      id: 1,
      siteName: "Doce Leveza",
      supportEmail: "suporte@doceleveza.com",
      supportPhone: "(11) 99999-9999",
      maintenanceMode: false,
      enableSignup: true,
    };
    
    this.seedData();
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
      }
    ];

    demoUsers.forEach(u => this.users.set(u.id, u));

    // Seed subscriptions for some users
    const demoSubscriptions: Subscription[] = [
      {
        id: this.subscriptionIdCounter++,
        userId: 1,
        plan: "mensal",
        status: "ativa",
        startDate: new Date().toISOString(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: "Transferência",
      },
      {
        id: this.subscriptionIdCounter++,
        userId: 2,
        plan: "anual",
        status: "ativa",
        startDate: new Date().toISOString(),
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: "Referência",
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

  // Pathologies
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

  // Videos
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

  // Ebooks
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

  // Consultations
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

  // Subscriptions
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

  // Admin
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
      totalVideos: 0,
      totalEbooks: 0,
      totalConsultations: 0,
      totalLeads: 0,
      recentUsers,
    };
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

  // Seed data
  private seedData() {
    // Seed pathologies
    const pathologies: Pathology[] = [
      {
        id: 1,
        slug: "programa-perder-peso",
        title: "Programa de reeducação alimentar para perder de peso",
        description: "Plano completo para atingir o seu peso ideal de forma saudável.",
        icon: "TrendingDown",
        price: 85000.00
      },
      {
        id: 2,
        slug: "programa-perder-peso-diabetes",
        title: "Programa de reeducação alimentar para perder de peso na diabetes",
        description: "Orientações específicas para o controlo da glicémia e perda de peso.",
        icon: "Activity",
        price: 110000.00
      },
      {
        id: 3,
        slug: "programa-perder-peso-hipertensao",
        title: "Programa de reeducação alimentar para perder de peso na hipertensão",
        description: "Estratégias para equilibrar a pressão arterial enquanto perde peso.",
        icon: "HeartPulse",
        price: 110000.00
      },
      {
        id: 4,
        slug: "programa-perder-peso-gastrite",
        title: "Programa de reeducação alimentar para perder de peso na gastrite",
        description: "Alimentação leve e curativa para o sistema digestivo.",
        icon: "Utensils",
        price: 85000.00
      },
      {
        id: 5,
        slug: "programa-perder-peso-amamentacao",
        title: "Programa de reeducação alimentar para perder de peso na amamentação",
        description: "Nutrição equilibrada para a mãe e o bebé durante a perda de peso.",
        icon: "Baby",
        price: 85000.00
      },
      {
        id: 6,
        slug: "programa-perder-peso-idosos",
        title: "Programa de reeducação alimentar para perder de peso na terceira idade (Idosos)",
        description: "Cuidados nutricionais específicos para o emagrecimento saudável na longevidade.",
        icon: "Users",
        price: 85000.00
      }
    ];

    pathologies.forEach(p => {
      this.pathologies.set(p.id, p);
      this.pathologyIdCounter = Math.max(this.pathologyIdCounter, p.id + 1);
    });

    // Seed videos
    const videos: Video[] = [
      {
        id: 1,
        pathologyId: 1,
        title: "Introdução ao Programa de Perda de Peso",
        description: "Aprenda os fundamentos para reeducação alimentar focada em emagrecimento",
        duration: "15:30",
        thumbnailUrl: "https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=400",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        resources: ["PDF: Guia Inicial", "Lista de Compras"],
        viewCount: 245
      },
      {
        id: 2,
        pathologyId: 2,
        title: "Diabetes e Alimentação",
        description: "Como gerir a diabetes enquanto perde peso",
        duration: "12:45",
        thumbnailUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
        videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
        viewCount: 189
      },
      {
        id: 3,
        pathologyId: 3,
        title: "Hipertensão e Dieta DASH",
        description: "Estratégias nutricionais para hipertensos",
        duration: "18:20",
        thumbnailUrl: "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=400",
        videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
        viewCount: 512
      },
      {
        id: 4,
        pathologyId: 4,
        title: "Cuidados com a Gastrite",
        description: "Alimentação para alívio dos sintomas da gastrite",
        duration: "14:15",
        thumbnailUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
        videoUrl: "https://www.youtube.com/watch?v=JGwWNGJdvx8",
        viewCount: 156
      },
      {
        id: 5,
        pathologyId: 5,
        title: "Nutrição na Amamentação",
        description: "Perda de peso segura durante o período de amamentação",
        duration: "20:10",
        thumbnailUrl: "https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=400",
        videoUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        viewCount: 328
      },
      {
        id: 6,
        pathologyId: 6,
        title: "Saúde na Terceira Idade",
        description: "Emagrecimento saudável para idosos",
        duration: "22:15",
        thumbnailUrl: "https://images.unsplash.com/photo-1516307364728-25b36c5f400f?w=400",
        videoUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        viewCount: 142
      }
    ];

    videos.forEach(v => {
      this.videos.set(v.id, v);
      this.videoIdCounter = Math.max(this.videoIdCounter, v.id + 1);
    });

    // Seed ebooks
    const ebooks: Ebook[] = [
      {
        id: 1,
        pathologyId: 1,
        title: "Manual de Reeducação Alimentar",
        description: "Guia prático para emagrecimento saudável",
        coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
        downloadUrl: "/assets/A-ARTE-DA-GUERRA_1765386889371.pdf",
        tags: ["emagrecimento", "guia", "nutrição"],
        pages: 45
      },
      {
        id: 2,
        pathologyId: 2,
        title: "30 Dias de Emagrecimento Saudável (Diabetes)",
        description: "Plano alimentar completo para diabéticos",
        coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
        downloadUrl: "/assets/A-ARTE-DA-GUERRA_1765386889371.pdf",
        tags: ["diabetes", "emagrecimento", "plano alimentar"],
        pages: 85
      },
      {
        id: 3,
        pathologyId: 3,
        title: "Receitas de Baixo Sódio",
        description: "50 receitas deliciosas para hipertensos",
        coverUrl: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400",
        downloadUrl: "/assets/A-ARTE-DA-GUERRA_1765386889371.pdf",
        tags: ["receitas", "hipertensão", "saúde"],
        pages: 95
      }
    ];

    ebooks.forEach(e => {
      this.ebooks.set(e.id, e);
      this.ebookIdCounter = Math.max(this.ebookIdCounter, e.id + 1);
    });

    // Seed admin user
    const admin: AdminUser = {
      id: 1,
      name: "Admin",
      email: "admin@doceleveza.com",
      password: "admin123",
      role: "super_admin",
      createdAt: new Date().toISOString(),
    };
    this.admins.set(admin.id, admin);

    this.seedUsers();
    
    // Seed user access for Maria Silva (userId: 1)
    const mariaAccess: UserAccess = {
      id: this.userAccessIdCounter++,
      userId: 1,
      pathologyId: 2, // Programa de reeducação alimentar para perder de peso na diabetes
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "activo",
    };
    this.userAccess.set(mariaAccess.id, mariaAccess);
  }
}

export const storage = new MemStorage();
