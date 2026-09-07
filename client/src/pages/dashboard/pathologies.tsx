import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Pathology, Subscription, User as UserType } from "@shared/schema";
import { Lock } from "lucide-react";

const pathologyImageMap: Record<string, string> = {
  "programa-perder-peso": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop",
  "programa-perder-peso-diabetes": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=450&fit=crop",
  "programa-perder-peso-hipertensao": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=450&fit=crop",
  "programa-perder-peso-gastrite": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop",
  "programa-perder-peso-amamentacao": "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?w=800&h=450&fit=crop",
  "programa-perder-peso-idosos": "https://images.unsplash.com/photo-1516307364728-25b36c5f400f?w=800&h=450&fit=crop",
};

export default function Pathologies() {
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const { data: pathologies = [], isLoading } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
    staleTime: 1000 * 60 * 3, // 3 minutos de cache
    gcTime: 1000 * 60 * 10, // 10 minutos garbage collection
  });

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ["/api/subscriptions/user", user?.id],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
    gcTime: 1000 * 60 * 10, // 10 minutos garbage collection
  });
  const { data: activePlan } = useQuery<{ pathologyId: number | null; type?: string; expiryDate?: string; expiresAt?: string } | null>({
    queryKey: ["/api/user/active-plan"],
    enabled: !!user?.id,
    refetchInterval: 30 * 1000,
  });

  // user-specific access entries, fetched via user endpoint
  const { data: userAccess = [] } = useQuery<any[]>({
    queryKey: ["/api/user/access"],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  // controle de acesso por programa
  const hasAccessToProgram = (programId: number) => {
    // Assinatura anual/total: status "ativa" dá acesso a todos os programas
    if (activePlan?.type === "ilimitado") return true;
    if (
      subscription?.status === "ativa" &&
      new Date(subscription.renewalDate) > new Date()
    ) return true;
    // Acesso individual por programa: verifica o registo com status "ativo" e não expirado
    return userAccess.some(a => {
      if (a.pathologyId !== programId) return false;
      if (a.status !== "ativo") return false;
      if (a.expiryDate && new Date(a.expiryDate) < new Date()) return false;
      return true;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Conteúdo Programático</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[2/3] animate-pulse bg-muted rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground" data-testid="heading-pathologies">
          Conteúdo Programático
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Escolha um programa para acessar os conteúdos especializados
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {pathologies.map((pathology) => {
          const fallbackImageUrl = pathologyImageMap[pathology.slug] || pathologyImageMap["programa-perder-peso"];
          const imageUrl = pathology.imageUrl || fallbackImageUrl;
          const hasAccess = hasAccessToProgram(pathology.id);
          const lockedByCurrentPlan = !!activePlan && activePlan.type !== "ilimitado" && activePlan.pathologyId !== pathology.id;

          const cardContent = (
            <div className={`relative overflow-hidden rounded-md group aspect-[2/3] transition-all ${hasAccess ? 'hover-elevate active-elevate-2 cursor-pointer' : 'opacity-75 grayscale-[0.5]'}`}>
              <img
                src={imageUrl}
                alt={pathology.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(event) => {
                  if (event.currentTarget.src !== fallbackImageUrl) {
                    event.currentTarget.src = fallbackImageUrl;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>

              {!hasAccess && (
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/20">
                  <Lock className="h-4 w-4 text-white" />
                </div>
              )}

              <div className="relative h-full flex flex-col justify-end p-5 text-white">
                <h3 className="text-lg font-normal mb-2 leading-snug">
                  {pathology.title}
                </h3>
                <p className="text-xs text-white/90 mb-4 line-clamp-2">
                  {pathology.description}
                </p>
                <Button
                  variant={hasAccess ? "outline" : "default"}
                  size="sm"
                  className={`text-xs ${hasAccess
                    ? "text-white border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/40"
                    : "bg-primary text-primary-foreground font-bold"
                    } self-start`}
                  data-testid={`button-pathology-${pathology.slug}`}
                >
                  {hasAccess ? "Acessar Programa" : lockedByCurrentPlan ? "Programa bloqueado" : "Ver planos"}
                </Button>
              </div>
            </div>
          );

          if (hasAccess) {
            return (
              <Link key={pathology.id} href={`/dashboard/programas/${pathology.slug}`}>
                <a data-testid={`card-pathology-${pathology.slug}`}>
                  {cardContent}
                </a>
              </Link>
            );
          }

          return <Link key={pathology.id} href="/dashboard/assinaturas"><a data-testid={`card-pathology-${pathology.slug}`}>{cardContent}{lockedByCurrentPlan && <p className="mt-2 text-xs text-muted-foreground">Disponível apenas após término do seu plano actual</p>}</a></Link>;
        })}
      </div>
    </div>
  );
}
