import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, BookOpen, Calendar, CreditCard, Mail, TrendingUp, Activity, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Statistics } from "@shared/schema";

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery<Statistics>({
    queryKey: ["/api/admin/statistics"],
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando estatísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">Erro ao carregar dados do dashboard.</p>
            <p className="text-sm text-muted-foreground mt-1">Por favor, verifique se você tem permissões de administrador.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-admin-dashboard">
          Dashboard Administrativo
        </h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do sistema Doce Leveza
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Últimas atividades do sistema aparecerão aqui.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análises Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Insights e análises do sistema aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
