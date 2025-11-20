import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import Overview from "@/pages/dashboard/overview";
import Pathologies from "@/pages/dashboard/pathologies";
import PathologyDetail from "@/pages/dashboard/pathology-detail";
import Library from "@/pages/dashboard/library";
import Consultations from "@/pages/dashboard/consultations";
import Settings from "@/pages/dashboard/settings";
import Subscription from "@/pages/dashboard/subscription";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center gap-4 border-b p-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h2 className="text-lg font-semibold">Doce Leveza</h2>
          </header>
          <main className="flex-1 overflow-auto p-6 bg-background">
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
      <Route path="/dashboard/patologias">
        {() => (
          <DashboardLayout>
            <Pathologies />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/patologias/:slug">
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
