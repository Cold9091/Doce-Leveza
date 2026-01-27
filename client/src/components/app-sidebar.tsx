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
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/Rectangle__1_-removebg-preview_1763494828422.png";

const mainMenuItems = [
  {
    title: "Visão Geral",
    url: "/dashboard",
    icon: LayoutDashboard,
    testId: "nav-overview",
  },
  {
    title: "Programas",
    url: "/dashboard/programas",
    icon: Activity,
    testId: "nav-programs",
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
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="px-6 py-6">
        <Link href="/dashboard">
          <a className="flex items-center gap-2" data-testid="sidebar-logo">
            <img src={logoImage} alt="Doce Leveza" className="h-10 w-auto" />
          </a>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarMenu className="space-y-1">
          {mainMenuItems.map((item) => {
            const isActive = location === item.url || 
              (item.url !== "/dashboard" && location.startsWith(item.url));
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
          {bottomMenuItems.map((item) => {
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
