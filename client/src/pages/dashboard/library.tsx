import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Ebook } from "@shared/schema";
import { BookOpen, Download, FileText } from "lucide-react";

export default function Library() {
  const { data: ebooks, isLoading } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-heading font-bold">Biblioteca</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-96 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-library">
          Biblioteca de Ebooks
        </h1>
        <p className="text-muted-foreground mt-2">
          Acesse e baixe todos os materiais de estudo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ebooks?.map((ebook) => (
          <Card
            key={ebook.id}
            className="overflow-hidden hover-elevate active-elevate-2 transition-all"
            data-testid={`card-ebook-${ebook.id}`}
          >
            <div className="relative aspect-[3/4] bg-muted">
              <img
                src={ebook.coverUrl}
                alt={ebook.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-black/60 backdrop-blur-sm">
                  <FileText className="mr-1 h-3 w-3" />
                  {ebook.pages} páginas
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-2">{ebook.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {ebook.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {ebook.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button className="w-full" data-testid={`button-download-ebook-${ebook.id}`}>
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!ebooks || ebooks.length === 0) && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum ebook disponível no momento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
