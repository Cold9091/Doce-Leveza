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
import { ErrorBoundary } from "@/components/error-boundary";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";

import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

const Overview = lazy(() => import("@/pages/dashboard/overview"));
const Pathologies = lazy(() => import("@/pages/dashboard/pathologies"));
const PathologyDetail = lazy(() => import("@/pages/dashboard/pathology-detail"));
const Library = lazy(() => import("@/pages/dashboard/library"));
const Consultations = lazy(() => import("@/pages/dashboard/consultations"));
const Settings = lazy(() => import("@/pages/dashboard/settings"));
const Profile = lazy(() => import("@/pages/dashboard/profile"));
const Subscription = lazy(() => import("@/pages/dashboard/subscription"));
const Assinaturas = lazy(() => import("@/pages/dashboard/assinaturas"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminPathologies = lazy(() => import("@/pages/admin/pathologies"));
const AdminVideos = lazy(() => import("@/pages/admin/videos"));
const AdminEbooks = lazy(() => import("@/pages/admin/ebooks"));
const AdminConsultations = lazy(() => import("@/pages/admin/consultations"));
const AdminSubscriptions = lazy(() => import("@/pages/admin/subscriptions"));
const AdminPayments = lazy(() => import("@/pages/admin/payments"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({ children, type = "user" }: { children: React.ReactNode, type?: "user" | "admin" }) {
  const endpoint = type === "admin" ? "/api/admin/me" : "/api/auth/me";
  
  const { data: user, isLoading } = useQuery<any>({
    queryKey: [endpoint],
    retry: false,
    staleTime: 1000 * 60, // 60 segundos de cache
    gcTime: 1000 * 60 * 5, // 5 minutos de garbage collection
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/"; // Forçar redirecionamento total para limpar estado
    return null;
  }

  // Se é usuario e está acessando rota de user, verificar se é admin
  if (type === "user" && (user?.role === "admin" || user?.role === "super_admin")) {
    window.location.replace("/admin");
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
          <DashboardHeader />
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
    <Suspense fallback={<PageLoader />}>
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
      <Route path="/dashboard/assinaturas">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <Assinaturas />
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
      <Route path="/admin/pagamentos">
        {() => (
          <ProtectedRoute type="admin">
            <AdminLayout>
              <AdminPayments />
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
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
