import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { Pathology, InsertPathology } from "@shared/schema";
import { Plus, Pencil, Trash2, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPathologySchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function AdminPathologies() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPathology, setEditingPathology] = useState<Pathology | null>(null);
  const { toast } = useToast();

  const { data: pathologies, isLoading } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });

  const form = useForm<InsertPathology>({
    resolver: zodResolver(insertPathologySchema),
    defaultValues: {
      slug: "",
      title: "",
      description: "",
      icon: "Activity",
      imageUrl: "",
      price: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertPathology) => {
      await apiRequest("POST", "/api/admin/pathologies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pathologies"] });
      toast({
        title: "Sucesso",
        description: "Programa criado com sucesso",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar programa",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertPathology }) => {
      await apiRequest("PUT", `/api/admin/pathologies/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pathologies"] });
      toast({
        title: "Sucesso",
        description: "Programa atualizado com sucesso",
      });
      setIsDialogOpen(false);
      setEditingPathology(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar programa",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/pathologies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pathologies"] });
      toast({
        title: "Sucesso",
        description: "Programa removido com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover programa",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPathology) => {
    if (editingPathology) {
      updateMutation.mutate({ id: editingPathology.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (pathology: Pathology) => {
    setEditingPathology(pathology);
    form.reset({
      slug: pathology.slug,
      title: pathology.title,
      description: pathology.description,
      icon: pathology.icon,
      imageUrl: pathology.imageUrl || "",
      price: pathology.price,
    });
    setIsDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingPathology(null);
      form.reset({
        slug: "",
        title: "",
        description: "",
        icon: "Activity",
        imageUrl: "",
        price: 0,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-admin-pathologies">
            Gerenciar Programas
          </h1>
          <p className="text-muted-foreground mt-2">
            Adicione e gerencie os programas do sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-pathology">
              <Plus className="mr-2 h-4 w-4" />
              Novo Programa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPathology ? "Editar Programa" : "Novo Programa"}</DialogTitle>
              <DialogDescription>
                {editingPathology ? "Atualize as informações do programa" : "Adicione um novo programa ao sistema"}
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
                        <Input {...field} placeholder="Ex: Diabetes" data-testid="input-pathology-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: diabetes" data-testid="input-pathology-slug" />
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
                        <Textarea {...field} rows={3} placeholder="Descrição do programa" data-testid="input-pathology-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ícone (Lucide)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Activity" data-testid="input-pathology-icon" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (AOA)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          placeholder="Ex: 85000" 
                          data-testid="input-pathology-price" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit-pathology"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : pathologies && pathologies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pathologies.map((pathology) => (
            <Card key={pathology.id} data-testid={`card-pathology-${pathology.id}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{pathology.title}</span>
                  <Activity className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {pathology.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  <div>Slug: {pathology.slug}</div>
                  <div>Ícone: {pathology.icon}</div>
                  <div className="font-bold text-foreground mt-1">
                    Preço: {pathology.price?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(pathology)}
                    data-testid={`button-edit-pathology-${pathology.id}`}
                  >
                    <Pencil className="mr-2 h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(pathology.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-pathology-${pathology.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum programa cadastrado
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
