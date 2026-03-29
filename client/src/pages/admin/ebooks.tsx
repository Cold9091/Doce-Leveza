import { useState, useRef } from "react";
import { pdfjs } from "react-pdf";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Ebook, InsertEbook, Pathology } from "@shared/schema";
import { Plus, Pencil, Trash2, BookOpen, Search, Upload, FileText, ImageIcon, Loader2 } from "lucide-react";
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

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function AdminEbooks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ebook | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: ebooks, isLoading } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks"],
  });

  const { data: pathologies } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
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
      await apiRequest("POST", "/api/admin/ebooks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ebooks"] });
      toast({ title: "Ebook criado com sucesso!" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao criar ebook", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertEbook }) => {
      await apiRequest("PUT", `/api/admin/ebooks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ebooks"] });
      toast({ title: "Ebook atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingEbook(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar ebook", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/ebooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ebooks"] });
      toast({ title: "Ebook removido com sucesso!" });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: "Erro ao remover ebook", variant: "destructive" });
    },
  });

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "doce-leveza/ebooks/covers");
      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload falhou");
      const { url } = await res.json();
      form.setValue("coverUrl", url);
      toast({ title: "Capa enviada com sucesso!" });
    } catch {
      toast({ title: "Erro ao enviar a capa", variant: "destructive" });
    } finally {
      setUploadingCover(false);
    }
  };

  const uploadPdf = async (file: File) => {
    setUploadingPdf(true);
    try {
      // Detect page count from local file before uploading (avoids CORS)
      let detectedPages = 0;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        detectedPages = pdf.numPages;
        pdf.destroy();
      } catch (pageErr) {
        console.warn("Could not auto-detect pages:", pageErr);
      }

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "doce-leveza/ebooks/pdfs");
      const res = await fetch("/api/admin/upload/pdf", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload falhou");
      const { url } = await res.json();
      form.setValue("downloadUrl", url);

      if (detectedPages > 0) {
        form.setValue("pages", detectedPages);
        toast({ title: `PDF enviado! ${detectedPages} páginas detectadas automaticamente.` });
      } else {
        toast({ title: "PDF enviado com sucesso!" });
      }
    } catch {
      toast({ title: "Erro ao enviar o PDF", variant: "destructive" });
    } finally {
      setUploadingPdf(false);
    }
  };

  const filteredEbooks = ebooks?.filter(
    (ebook) =>
      ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebook.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data: InsertEbook) => {
    if (editingEbook) {
      updateMutation.mutate({ id: editingEbook.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (ebook: Ebook) => {
    setEditingEbook(ebook);
    form.reset({
      title: ebook.title,
      description: ebook.description,
      coverUrl: ebook.coverUrl,
      downloadUrl: ebook.downloadUrl,
      tags: ebook.tags,
      pages: ebook.pages,
      pathologyId: ebook.pathologyId,
    });
    setIsDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingEbook(null);
      form.reset({ title: "", description: "", coverUrl: "", downloadUrl: "", tags: [], pages: 0, pathologyId: undefined });
    }
  };

  const coverUrl = form.watch("coverUrl");
  const downloadUrl = form.watch("downloadUrl");

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
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-ebook">
              <Plus className="mr-2 h-4 w-4" />
              Novo Ebook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEbook ? "Editar Ebook" : "Novo Ebook"}</DialogTitle>
              <DialogDescription>
                {editingEbook ? "Atualize as informações do ebook" : "Adicione um novo ebook ao sistema"}
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
                        <FormLabel>Nº de Páginas</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={1}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                                e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean)
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

                {/* Cover Upload */}
                <FormField
                  control={form.control}
                  name="coverUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capa do Ebook</FormLabel>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="URL da capa (gerada automaticamente pelo upload)"
                              readOnly
                              className="bg-muted/50 text-sm"
                              data-testid="input-ebook-cover"
                            />
                          </FormControl>
                          <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadCover(file);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => coverInputRef.current?.click()}
                            disabled={uploadingCover}
                            data-testid="button-upload-cover"
                          >
                            {uploadingCover ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ImageIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {coverUrl && (
                          <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                            <img src={coverUrl} alt="Pré-visualização" className="h-12 w-9 object-cover rounded" />
                            <span className="text-xs text-green-700 dark:text-green-300">Capa carregada</span>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PDF Upload */}
                <FormField
                  control={form.control}
                  name="downloadUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ficheiro PDF do Ebook</FormLabel>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="URL do PDF (gerada automaticamente pelo upload)"
                              readOnly
                              className="bg-muted/50 text-sm"
                              data-testid="input-ebook-download"
                            />
                          </FormControl>
                          <input
                            ref={pdfInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadPdf(file);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => pdfInputRef.current?.click()}
                            disabled={uploadingPdf}
                            data-testid="button-upload-pdf"
                          >
                            {uploadingPdf ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {downloadUrl && (
                          <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                            <FileText className="h-4 w-4 text-green-700 dark:text-green-300" />
                            <span className="text-xs text-green-700 dark:text-green-300">PDF carregado</span>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Program */}
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
                          <SelectTrigger data-testid="select-ebook-program">
                            <SelectValue placeholder="Selecione um programa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pathologies?.map((pathology) => (
                            <SelectItem key={pathology.id} value={pathology.id.toString()}>
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
                    disabled={createMutation.isPending || updateMutation.isPending || uploadingCover || uploadingPdf}
                    data-testid="button-submit-ebook"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "A guardar..." : "Guardar"}
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
                <Card key={ebook.id} className="overflow-hidden" data-testid={`card-ebook-${ebook.id}`}>
                  <div className="relative aspect-[3/4] bg-muted">
                    {ebook.coverUrl ? (
                      <img
                        src={ebook.coverUrl}
                        alt={ebook.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm">
                      {ebook.pages} pág.
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2">{ebook.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{ebook.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ebook.pathologyId && pathologies?.find((p) => p.id === ebook.pathologyId) && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            {pathologies.find((p) => p.id === ebook.pathologyId)?.title}
                          </Badge>
                        )}
                        {ebook.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      {ebook.downloadUrl ? (
                        <span className="text-green-600">PDF carregado</span>
                      ) : (
                        <span className="text-amber-600">Sem PDF</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(ebook)}
                        data-testid={`button-edit-ebook-${ebook.id}`}
                      >
                        <Pencil className="mr-2 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(ebook)}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Ebook</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja remover <strong>"{deleteTarget?.title}"</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              data-testid="button-confirm-delete-ebook"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
