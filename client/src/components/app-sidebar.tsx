import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
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
    title: "Programas",
    url: "/dashboard/programas",
    icon: Activity,
    testId: "nav-programs",
    badge: 6,
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
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  const handleNavigation = (url: string) => {
    setLocation(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader className="p-3 flex items-center justify-center">
        <button 
          onClick={() => handleNavigation("/dashboard")}
          className="cursor-pointer flex items-center justify-center gap-3" 
          data-testid="sidebar-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <img src={logoImage} alt="Doce Leveza" className="h-6 w-auto" />
          </div>
          {isExpanded && (
            <span className="font-heading font-bold text-foreground whitespace-nowrap">
              Doce Leveza
            </span>
          )}
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
                    relative transition-all duration-200 cursor-pointer
                    ${isExpanded 
                      ? "h-11 px-3 mx-0 rounded-lg flex items-center justify-start gap-3" 
                      : "h-12 w-12 p-0 mx-auto rounded-xl flex items-center justify-center"
                    }
                    ${isActive 
                      ? "bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/25" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                  data-testid={item.testId}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.title}</span>
                  )}
                  {item.badge && (
                    <span className={`
                      w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium
                      ${isExpanded ? "ml-auto" : "absolute -top-1 -right-1"}
                    `}>
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
                    transition-all duration-200 cursor-pointer
                    ${isExpanded 
                      ? "h-11 px-3 mx-0 rounded-lg flex items-center justify-start gap-3" 
                      : "h-12 w-12 p-0 mx-auto rounded-xl flex items-center justify-center"
                    }
                    ${isActive 
                      ? "bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/25" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                  data-testid={item.testId}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.title}</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Sair da Conta"
              onClick={() => handleNavigation("/")}
              className={`
                transition-all duration-200 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10
                ${isExpanded 
                  ? "h-11 px-3 mx-0 rounded-lg flex items-center justify-start gap-3" 
                  : "h-12 w-12 p-0 mx-auto rounded-xl flex items-center justify-center"
                }
              `}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap">Sair da Conta</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
