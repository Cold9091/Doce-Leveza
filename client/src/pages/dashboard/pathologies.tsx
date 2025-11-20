import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Pathology } from "@shared/schema";
import { Activity, TrendingDown, HeartPulse, Baby } from "lucide-react";

const iconMap: Record<string, any> = {
  Activity,
  TrendingDown,
  HeartPulse,
  Baby,
};

export default function Pathologies() {
  const { data: pathologies, isLoading } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Patologias</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-40 sm:h-48 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground" data-testid="heading-pathologies">
          Patologias
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Escolha uma área para acessar conteúdos especializados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {pathologies?.map((pathology) => {
          const Icon = iconMap[pathology.icon] || Activity;
          return (
            <Link key={pathology.id} href={`/dashboard/patologias/${pathology.slug}`}>
              <a data-testid={`card-pathology-${pathology.slug}`}>
                <Card className="hover-elevate active-elevate-2 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-accent" />
                        {pathology.title}
                      </CardTitle>
                      <Badge variant="secondary" data-testid={`badge-pathology-${pathology.slug}`}>
                        Ver conteúdos
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      {pathology.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
