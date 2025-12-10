import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Ebook } from "@shared/schema";
import { BookOpen, FileText } from "lucide-react";
import { PdfReader } from "@/components/pdf-reader";

export default function Library() {
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);

  const { data: ebooks, isLoading } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Biblioteca</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-80 sm:h-96 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground" data-testid="heading-library">
          Biblioteca de Ebooks
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Acesse e baixe todos os materiais de estudo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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
              <Button 
                className="w-full" 
                data-testid={`button-read-ebook-${ebook.id}`}
                onClick={() => {
                  setSelectedEbook(ebook);
                  setReaderOpen(true);
                }}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Ler Livro
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <PdfReader
        ebook={selectedEbook}
        open={readerOpen}
        onOpenChange={setReaderOpen}
      />

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
