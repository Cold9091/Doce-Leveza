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
  Users,
  Activity,
  Video,
  BookOpen,
  Calendar,
  CreditCard,
  Mail,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/Rectangle__1_-removebg-preview_1763494828422.png";
import { Badge } from "@/components/ui/badge";

const mainMenuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    testId: "nav-admin-dashboard",
  },
  {
    title: "Alunos",
    url: "/admin/alunos",
    icon: Users,
    testId: "nav-admin-users",
  },
  {
    title: "Patologias",
    url: "/admin/patologias",
    icon: Activity,
    testId: "nav-admin-pathologies",
  },
  {
    title: "Vídeos",
    url: "/admin/videos",
    icon: Video,
    testId: "nav-admin-videos",
  },
  {
    title: "Ebooks",
    url: "/admin/ebooks",
    icon: BookOpen,
    testId: "nav-admin-ebooks",
  },
];

const secondaryMenuItems = [
  {
    title: "Consultas",
    url: "/admin/consultas",
    icon: Calendar,
    testId: "nav-admin-consultations",
  },
  {
    title: "Assinaturas",
    url: "/admin/assinaturas",
    icon: CreditCard,
    testId: "nav-admin-subscriptions",
  },
  {
    title: "Leads",
    url: "/admin/leads",
    icon: Mail,
    testId: "nav-admin-leads",
  },
  {
    title: "Configurações",
    url: "/admin/configuracoes",
    icon: Settings,
    testId: "nav-admin-settings",
  },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="px-6 py-6">
        <Link href="/admin">
          <a className="flex items-center gap-2" data-testid="admin-sidebar-logo">
            <img src={logoImage} alt="Doce Leveza Admin" className="h-10 w-auto" />
            <Badge variant="secondary" className="text-xs">Admin</Badge>
          </a>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarMenu className="space-y-1">
          {mainMenuItems.map((item) => {
            const isActive = location === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`
                    h-11 px-4 rounded-lg transition-all duration-200
                    ${isActive 
                      ? "bg-primary text-primary-foreground font-medium" 
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

        <SidebarMenu className="space-y-1">
          {secondaryMenuItems.map((item) => {
            const isActive = location === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`
                    h-11 px-4 rounded-lg transition-all duration-200
                    ${isActive 
                      ? "bg-primary text-primary-foreground font-medium" 
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
      </SidebarContent>

      <SidebarFooter className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              className="h-11 px-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            >
              <Link href="/">
                <a
                  className="flex items-center gap-3 w-full"
                  data-testid="button-admin-logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm">Sair</span>
                </a>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
