import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SidebarTrigger } from "@/components/ui/sidebar";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { setOpen } = useSidebar();

  return (
    <div className="flex h-screen w-full bg-muted/30">
      <div 
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <AppSidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
        <DashboardHeader userName="Maria" />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import Overview from "@/pages/dashboard/overview";
import Pathologies from "@/pages/dashboard/pathologies";
import PathologyDetail from "@/pages/dashboard/pathology-detail";
import Library from "@/pages/dashboard/library";
import Consultations from "@/pages/dashboard/consultations";
import Settings from "@/pages/dashboard/settings";
import Subscription from "@/pages/dashboard/subscription";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminPathologies from "@/pages/admin/pathologies";
import AdminVideos from "@/pages/admin/videos";
import AdminEbooks from "@/pages/admin/ebooks";
import AdminConsultations from "@/pages/admin/consultations";
import AdminSubscriptions from "@/pages/admin/subscriptions";
import AdminLeads from "@/pages/admin/leads";
import AdminSettings from "@/pages/admin/settings";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "5rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties} defaultOpen={false}>
      <DashboardContent>{children}</DashboardContent>
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
          <DashboardLayout>
            <Overview />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/programas">
        {() => (
          <DashboardLayout>
            <Pathologies />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/programas/:slug">
        {() => (
          <DashboardLayout>
            <PathologyDetail />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/biblioteca">
        {() => (
          <DashboardLayout>
            <Library />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/consultas">
        {() => (
          <DashboardLayout>
            <Consultations />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/configuracoes">
        {() => (
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/assinatura">
        {() => (
          <DashboardLayout>
            <Subscription />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin">
        {() => (
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/alunos">
        {() => (
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/programas">
        {() => (
          <AdminLayout>
            <AdminPathologies />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/videos">
        {() => (
          <AdminLayout>
            <AdminVideos />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/ebooks">
        {() => (
          <AdminLayout>
            <AdminEbooks />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/consultas">
        {() => (
          <AdminLayout>
            <AdminConsultations />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/assinaturas">
        {() => (
          <AdminLayout>
            <AdminSubscriptions />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/leads">
        {() => (
          <AdminLayout>
            <AdminLeads />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/configuracoes">
        {() => (
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
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
