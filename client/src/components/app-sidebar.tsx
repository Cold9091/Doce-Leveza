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
import { useLocation } from "wouter";
import logoImage from "@assets/Rectangle__1_-removebg-preview_1763494828422.png";

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
    badge: 2,
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
  const [location, setLocation] = useLocation();

  const handleNavigation = (url: string) => {
    setLocation(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader className="p-3 flex items-center justify-center">
        <button 
          onClick={() => handleNavigation("/dashboard")}
          className="cursor-pointer flex items-center justify-center" 
          data-testid="sidebar-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
            <img src={logoImage} alt="Doce Leveza" className="h-6 w-auto" />
          </div>
        </button>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarMenu className="space-y-2">
          {mainMenuItems.map((item) => {
            const isActive = location === item.url || 
              (item.url !== "/dashboard" && location.startsWith(item.url));
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => handleNavigation(item.url)}
                  className={`
                    relative h-12 w-12 p-0 mx-auto rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer
                    ${isActive 
                      ? "bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/25" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                  data-testid={item.testId}
                >
                  <Icon className="h-5 w-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-2 py-4">
        <SidebarSeparator className="mb-4" />
        <SidebarMenu className="space-y-2">
          {bottomMenuItems.map((item) => {
            const isActive = location === item.url;
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => handleNavigation(item.url)}
                  className={`
                    h-12 w-12 p-0 mx-auto rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer
                    ${isActive 
                      ? "bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/25" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                  data-testid={item.testId}
                >
                  <Icon className="h-5 w-5" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Sair da Conta"
              onClick={() => handleNavigation("/")}
              className="h-12 w-12 p-0 mx-auto rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 flex items-center justify-center cursor-pointer"
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
