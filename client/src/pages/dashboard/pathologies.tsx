import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Pathology, Subscription } from "@shared/schema";
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
  const { data: pathologies, isLoading } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });

  const userId = 1;
  const { data: subscription } = useQuery<Subscription>({
    queryKey: ["/api/subscriptions/user", userId],
  });

  // Simulando controle de acesso por programa individual
  const hasAccessToProgram = (programId: number) => {
    if (subscription?.status === "ativa") return true;
    // Simulação: Apenas o primeiro programa está liberado para demonstração
    return programId === 1;
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
        {pathologies?.map((pathology) => {
          const imageUrl = pathologyImageMap[pathology.slug] || pathologyImageMap["programa-perder-peso"];
          const hasAccess = hasAccessToProgram(pathology.id);

          const cardContent = (
            <div className={`relative overflow-hidden rounded-md group aspect-[2/3] transition-all ${hasAccess ? 'hover-elevate active-elevate-2 cursor-pointer' : 'opacity-75 grayscale-[0.5]'}`}>
              <img
                src={imageUrl}
                alt={pathology.title}
                className="absolute inset-0 w-full h-full object-cover"
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
                  {hasAccess ? "Acessar Programa" : `Comprar por ${pathology.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}`}
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

          return (
            <div key={pathology.id} onClick={() => alert(`Para acessar o ${pathology.title}, o valor é ${pathology.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}. Redirecionando para pagamento...`)}>
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
