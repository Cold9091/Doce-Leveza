import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BookOpen, Calendar, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Pathology, Ebook, Consultation } from "@shared/schema";

export default function Overview() {
  const { data: pathologies } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });

  const { data: ebooks } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks"],
  });

  const stats = [
    {
      title: "Patologias Disponíveis",
      value: pathologies?.length || 0,
      icon: Activity,
      color: "text-blue-600 dark:text-blue-400",
      testId: "stat-pathologies",
    },
    {
      title: "Vídeos Assistidos",
      value: "12",
      icon: Video,
      color: "text-green-600 dark:text-green-400",
      testId: "stat-videos",
    },
    {
      title: "Ebooks Disponíveis",
      value: ebooks?.length || 0,
      icon: BookOpen,
      color: "text-purple-600 dark:text-purple-400",
      testId: "stat-ebooks",
    },
    {
      title: "Consultas Agendadas",
      value: "2",
      icon: Calendar,
      color: "text-orange-600 dark:text-orange-400",
      testId: "stat-consultations",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-overview">
          Bem-vindo à Área de Membros
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seu conteúdo e acompanhe seu progresso
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
            <CardTitle>Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Seus vídeos e conteúdos assistidos recentemente aparecerão aqui.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Suas consultas agendadas aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
