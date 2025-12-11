import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Activity,
  Calendar,
  BookOpen,
  Settings,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/Rectangle__1_-removebg-preview_1763494828422.png";
import { Badge } from "@/components/ui/badge";

const mainMenuItems = [
  {
    title: "Visão Geral",
    url: "/dashboard",
    icon: LayoutDashboard,
    testId: "nav-overview",
  },
  {
    title: "Patologias",
    url: "/dashboard/patologias",
    icon: Activity,
    testId: "nav-pathologies",
  },
  {
    title: "Consultas",
    url: "/dashboard/consultas",
    icon: Calendar,
    testId: "nav-consultations",
  },
  {
    title: "Biblioteca",
    url: "/dashboard/biblioteca",
    icon: BookOpen,
    testId: "nav-library",
  },
];

const bottomMenuItems = [
  {
    title: "Configurações",
    url: "/dashboard/configuracoes",
    icon: Settings,
    testId: "nav-settings",
  },
  {
    title: "Assinatura",
    url: "/dashboard/assinatura",
    icon: CreditCard,
    testId: "nav-subscription",
    badge: "Pro",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="px-4 py-6">
        <Link href="/dashboard">
          <a className="flex items-center gap-3" data-testid="sidebar-logo">
            <img src={logoImage} alt="Doce Leveza" className="h-10 w-auto" />
          </a>
        </Link>
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">Membro Ativo</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Acesso completo à plataforma
          </p>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <div className="mb-2 px-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu Principal
          </span>
        </div>
        <SidebarMenu className="space-y-1">
          {mainMenuItems.map((item) => {
            const isActive = location === item.url || 
              (item.url !== "/dashboard" && location.startsWith(item.url));
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`
                    h-11 px-4 rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-medium shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <Link href={item.url}>
                    <a
                      className="flex items-center gap-3 w-full"
                      data-testid={item.testId}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : ""}`} />
                      <span className="text-sm">{item.title}</span>
                    </a>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <SidebarSeparator className="my-4" />

        <div className="mb-2 px-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Conta
          </span>
        </div>
        <SidebarMenu className="space-y-1">
          {bottomMenuItems.map((item) => {
            const isActive = location === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`
                    h-11 px-4 rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-medium shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <Link href={item.url}>
                    <a
                      className="flex items-center gap-3 w-full"
                      data-testid={item.testId}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : ""}`} />
                      <span className="text-sm flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              className="h-11 px-4 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <Link href="/">
                <a
                  className="flex items-center gap-3 w-full"
                  data-testid="button-logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm">Sair da Conta</span>
                </a>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
