import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Ebook, InsertEbook, Pathology } from "@shared/schema";
import { Plus, Pencil, Trash2, BookOpen, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEbookSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminEbooks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: ebooks, isLoading } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks"],
  });

  const { data: pathologies } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });

  const form = useForm<InsertEbook>({
    resolver: zodResolver(insertEbookSchema),
    defaultValues: {
      title: "",
      description: "",
      coverUrl: "",
      downloadUrl: "",
      tags: [],
      pages: 0,
      pathologyId: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEbook) => {
      await apiRequest("/api/admin/ebooks", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ebooks"] });
      toast({
        title: "Sucesso",
        description: "Ebook criado com sucesso",
      });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/ebooks/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ebooks"] });
      toast({
        title: "Sucesso",
        description: "Ebook removido com sucesso",
      });
    },
  });

  const filteredEbooks = ebooks?.filter((ebook) =>
    ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebook.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data: InsertEbook) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-admin-ebooks">
            Gerenciar Ebooks
          </h1>
          <p className="text-muted-foreground mt-2">
            Adicione e gerencie os ebooks do sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-ebook">
              <Plus className="mr-2 h-4 w-4" />
              Novo Ebook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Ebook</DialogTitle>
              <DialogDescription>
                Adicione um novo ebook ao sistema
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Título do ebook" data-testid="input-ebook-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Descrição do ebook" data-testid="input-ebook-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Páginas</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            placeholder="Ex: 120"
                            data-testid="input-ebook-pages"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (separadas por vírgula)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value.join(", ")}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value.split(",").map((tag) => tag.trim())
                              )
                            }
                            placeholder="diabetes, receitas"
                            data-testid="input-ebook-tags"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="coverUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Capa</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-ebook-cover" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="downloadUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Download</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-ebook-download" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pathologyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Programa Relacionado</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um programa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pathologies?.map((pathology) => (
                            <SelectItem
                              key={pathology.id}
                              value={pathology.id.toString()}
                            >
                              {pathology.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-ebook"
                  >
                    {createMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ebooks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-ebooks"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : filteredEbooks && filteredEbooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEbooks.map((ebook) => (
                <Card key={ebook.id} data-testid={`card-ebook-${ebook.id}`}>
                  <div className="relative aspect-[3/4] bg-muted">
                    <img
                      src={ebook.coverUrl}
                      alt={ebook.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm">
                      {ebook.pages} páginas
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2">{ebook.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {ebook.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ebook.pathologyId && pathologies?.find(p => p.id === ebook.pathologyId) && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            {pathologies.find(p => p.id === ebook.pathologyId)?.title}
                          </Badge>
                        )}
                        {ebook.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        data-testid={`button-edit-ebook-${ebook.id}`}
                      >
                        <Pencil className="mr-2 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(ebook.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-ebook-${ebook.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum ebook encontrado" : "Nenhum ebook cadastrado"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
