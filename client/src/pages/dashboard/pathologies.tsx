import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Pathology } from "@shared/schema";

const pathologyImageMap: Record<string, string> = {
  "diabetes": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=450&fit=crop",
  "emagrecimento": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop",
  "hipertensao": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=450&fit=crop",
  "gestantes": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&h=450&fit=crop",
};

export default function Pathologies() {
  const { data: pathologies, isLoading } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Patologias</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
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
          Patologias
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Escolha uma área para acessar conteúdos especializados
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {pathologies?.map((pathology) => {
          const imageUrl = pathologyImageMap[pathology.slug] || pathologyImageMap["diabetes"];
          return (
            <Link key={pathology.id} href={`/dashboard/patologias/${pathology.slug}`}>
              <a data-testid={`card-pathology-${pathology.slug}`}>
                <div className="relative overflow-hidden rounded-md group aspect-[2/3] hover-elevate active-elevate-2 transition-all cursor-pointer">
                  <img
                    src={imageUrl}
                    alt={pathology.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>
                  <div className="relative h-full flex flex-col justify-end p-5 text-white">
                    <h3 className="text-lg font-normal mb-2">
                      {pathology.title}
                    </h3>
                    <p className="text-xs text-white/90 mb-4 line-clamp-2">
                      {pathology.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-white border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/40 self-start"
                      data-testid={`button-pathology-${pathology.slug}`}
                    >
                      Ver conteúdo
                    </Button>
                  </div>
                </div>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
