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
  Activity,
  Calendar,
  BookOpen,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/Rectangle__1_-removebg-preview_1763494828422.png";

const menuItems = [
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
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard">
          <a className="flex items-center gap-2" data-testid="sidebar-logo">
            <img src={logoImage} alt="Doce Leveza" className="h-12 w-auto" />
          </a>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
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
                  data-testid="button-logout"
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
