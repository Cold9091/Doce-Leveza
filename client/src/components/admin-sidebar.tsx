import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
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

const menuItems = [
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
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/admin">
          <a className="flex items-center gap-2" data-testid="admin-sidebar-logo">
            <img src={logoImage} alt="Doce Leveza Admin" className="h-12 w-auto" />
          </a>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={isActive ? "bg-sidebar-accent" : ""}
                    >
                      <Link href={item.url}>
                        <a
                          className="flex items-center gap-3 w-full"
                          data-testid={item.testId}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <a
                  className="flex items-center gap-3 w-full"
                  data-testid="button-admin-logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </a>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
