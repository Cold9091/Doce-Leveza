import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, BookOpen, Calendar, CreditCard, Mail, TrendingUp, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Statistics } from "@shared/schema";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<Statistics>({
    queryKey: ["/api/admin/statistics"],
  });

  const statCards = [
    {
      title: "Total de Alunos",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      testId: "stat-total-users",
    },
    {
      title: "Assinaturas Ativas",
      value: stats?.activeSubscriptions || 0,
      icon: CreditCard,
      color: "text-green-600 dark:text-green-400",
      testId: "stat-active-subscriptions",
    },
    {
      title: "Total de Vídeos",
      value: stats?.totalVideos || 0,
      icon: Video,
      color: "text-purple-600 dark:text-purple-400",
      testId: "stat-total-videos",
    },
    {
      title: "Total de Ebooks",
      value: stats?.totalEbooks || 0,
      icon: BookOpen,
      color: "text-orange-600 dark:text-orange-400",
      testId: "stat-total-ebooks",
    },
    {
      title: "Total de Consultas",
      value: stats?.totalConsultations || 0,
      icon: Calendar,
      color: "text-pink-600 dark:text-pink-400",
      testId: "stat-total-consultations",
    },
    {
      title: "Total de Leads",
      value: stats?.totalLeads || 0,
      icon: Mail,
      color: "text-cyan-600 dark:text-cyan-400",
      testId: "stat-total-leads",
    },
    {
      title: "Novos Alunos (30 dias)",
      value: stats?.recentUsers || 0,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      testId: "stat-recent-users",
    },
    {
      title: "Atividade",
      value: "100%",
      icon: Activity,
      color: "text-indigo-600 dark:text-indigo-400",
      testId: "stat-activity",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-heading font-bold">Dashboard Administrativo</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
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
