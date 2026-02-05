import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import Overview from "@/pages/dashboard/overview";
import Pathologies from "@/pages/dashboard/pathologies";
import PathologyDetail from "@/pages/dashboard/pathology-detail";
import Library from "@/pages/dashboard/library";
import Consultations from "@/pages/dashboard/consultations";
import Settings from "@/pages/dashboard/settings";
import Profile from "@/pages/dashboard/profile";
import Subscription from "@/pages/dashboard/subscription";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminPathologies from "@/pages/admin/pathologies";
import AdminVideos from "@/pages/admin/videos";
import AdminEbooks from "@/pages/admin/ebooks";
import AdminConsultations from "@/pages/admin/consultations";
import AdminSubscriptions from "@/pages/admin/subscriptions";
import AdminSettings from "@/pages/admin/settings";

function ProtectedRoute({ children, type = "user" }: { children: React.ReactNode, type?: "user" | "admin" }) {
  const [, setLocation] = useLocation();
  const endpoint = type === "admin" ? "/api/admin/me" : "/api/auth/me";
  
  const { data: user, isLoading } = useQuery({
    queryKey: [endpoint],
    retry: false,
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return <>{children}</>;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-muted/30">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader userName="Maria" />
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-3 sm:gap-4 border-b p-3 sm:p-4 bg-background">
            <div className="flex items-center gap-3 sm:gap-4">
              <SidebarTrigger data-testid="button-admin-sidebar-toggle" className="text-muted-foreground hover:text-foreground" />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <Overview />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/programas">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <Pathologies />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/programas/:slug">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <PathologyDetail />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/biblioteca">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <Library />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/perfil">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/consultas">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <Consultations />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/configuracoes">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/assinatura">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <Subscription />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin">
        {() => (
          <ProtectedRoute type="admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/alunos">
        {() => (
          <ProtectedRoute type="admin">
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/programas">
        {() => (
          <ProtectedRoute type="admin">
            <AdminLayout>
              <AdminPathologies />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/videos">
        {() => (
          <ProtectedRoute type="admin">
            <AdminLayout>
              <AdminVideos />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/ebooks">
        {() => (
          <ProtectedRoute type="admin">
            <AdminLayout>
              <AdminEbooks />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/consultas">
        {() => (
          <ProtectedRoute type="admin">
            <AdminLayout>
              <AdminConsultations />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/assinaturas">
        {() => (
          <ProtectedRoute type="admin">
            <AdminLayout>
              <AdminSubscriptions />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/configuracoes">
        {() => (
          <ProtectedRoute type="admin">
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
