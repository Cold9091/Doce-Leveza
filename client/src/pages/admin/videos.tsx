import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Video, Pathology, InsertVideo } from "@shared/schema";
import {
  Plus,
  Pencil,
  Trash2,
  Video as VideoIcon,
  Search,
  Eye,
  Loader2,
  ImageOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVideoSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export default function AdminVideos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [filterPathology, setFilterPathology] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  const { data: pathologies } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  });

  const form = useForm<InsertVideo>({
    resolver: zodResolver(insertVideoSchema),
    defaultValues: {
      pathologyId: undefined as unknown as number,
      title: "",
      description: "",
      duration: "",
      thumbnailUrl: "",
      videoUrl: "",
      resources: [],
    },
  });

  const invalidateVideos = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/videos"], refetchType: "all" });
    queryClient.refetchQueries({ queryKey: ["/api/videos"] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertVideo) => {
      await apiRequest("POST", "/api/admin/videos", data);
    },
    onSuccess: () => {
      invalidateVideos();
      toast({ title: "Sucesso", description: "Vídeo criado com sucesso" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: async (err: any) => {
      let message = "Erro ao criar vídeo";
      try {
        const body = err?.response ? await err.response.json() : null;
        if (body?.details?.[0]?.message) message = body.details[0].message;
        else if (body?.error) message = body.error;
      } catch {}
      toast({ title: "Erro", description: message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertVideo }) => {
      await apiRequest("PATCH", `/api/admin/videos/${id}`, data);
    },
    onSuccess: () => {
      invalidateVideos();
      toast({ title: "Sucesso", description: "Vídeo atualizado com sucesso" });
      setIsDialogOpen(false);
      setEditingVideo(null);
      form.reset();
    },
    onError: async (err: any) => {
      let message = "Erro ao atualizar vídeo";
      try {
        const body = err?.response ? await err.response.json() : null;
        if (body?.details?.[0]?.message) message = body.details[0].message;
        else if (body?.error) message = body.error;
      } catch {}
      toast({ title: "Erro", description: message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeletingId(id);
      await apiRequest("DELETE", `/api/admin/videos/${id}`);
    },
    onSuccess: () => {
      invalidateVideos();
      toast({ title: "Sucesso", description: "Vídeo removido com sucesso" });
      setDeleteTarget(null);
      setDeletingId(null);
    },
    onError: async (err: any) => {
      let message = "Erro ao remover vídeo";
      try {
        const body = err?.response ? await err.response.json() : null;
        if (body?.error) message = body.error;
      } catch {}
      toast({ title: "Erro", description: message, variant: "destructive" });
      setDeletingId(null);
    },
  });

  const filteredVideos = videos?.filter((video) => {
    const matchesPathology =
      filterPathology === "all" || video.pathologyId === parseInt(filterPathology);
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPathology && matchesSearch;
  });

  const onSubmit = (data: InsertVideo) => {
    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    form.reset({
      pathologyId: video.pathologyId,
      title: video.title,
      description: video.description,
      duration: video.duration,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      resources: video.resources || [],
    });
    setIsDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingVideo(null);
      form.reset({
        pathologyId: undefined as unknown as number,
        title: "",
        description: "",
        duration: "",
        thumbnailUrl: "",
        videoUrl: "",
        resources: [],
      });
    }
  };

  const pathologyName = (id: number) =>
    pathologies?.find((p) => p.id === id)?.title ?? "—";

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-heading font-bold text-foreground"
            data-testid="heading-admin-videos"
          >
            Gerenciar Vídeos
          </h1>
          <p className="text-muted-foreground mt-1">
            Adicione e gerencie os vídeos do sistema
          </p>
          <p className="text-sm text-muted-foreground">
            {videos
              ? `${videos.length} vídeo(s) · ${filteredVideos?.length ?? 0} exibido(s)`
              : "a carregar..."}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-video">
              <Plus className="mr-2 h-4 w-4" />
              Novo Vídeo
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? "Editar Vídeo" : "Novo Vídeo"}
              </DialogTitle>
              <DialogDescription>
                {editingVideo
                  ? "Atualize as informações do vídeo"
                  : "Adicione um novo vídeo ao sistema"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Título */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Título do vídeo"
                          data-testid="input-video-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descrição */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder="Descrição do vídeo"
                          data-testid="input-video-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Programa + Duração */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pathologyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Programa</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={
                            field.value && field.value > 0
                              ? field.value.toString()
                              : ""
                          }
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-video-pathology">
                              <SelectValue placeholder="Selecione um programa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pathologies && pathologies.length > 0 ? (
                              pathologies.map((pathology) => (
                                <SelectItem
                                  key={pathology.id}
                                  value={pathology.id.toString()}
                                >
                                  {pathology.title}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="__none" disabled>
                                Nenhum programa disponível
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: 15:30"
                            data-testid="input-video-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* URL do vídeo */}
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Vídeo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://..."
                          data-testid="input-video-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* URL da thumbnail */}
                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Thumbnail</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://..."
                          data-testid="input-video-thumbnail"
                        />
                      </FormControl>
                      <FormMessage />
                      {/* Pré-visualização da thumbnail */}
                      {field.value && field.value.startsWith("http") && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-border h-24 bg-muted">
                          <img
                            src={field.value}
                            alt="Pré-visualização"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSaving}
                    data-testid="button-cancel-video"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    data-testid="button-submit-video"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        A guardar...
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vídeos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-videos"
          />
        </div>
        <Select value={filterPathology} onValueChange={setFilterPathology}>
          <SelectTrigger
            className="w-full sm:w-[220px]"
            data-testid="select-filter-pathology"
          >
            <SelectValue placeholder="Todos programas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos programas</SelectItem>
            {pathologies?.map((pathology) => (
              <SelectItem key={pathology.id} value={pathology.id.toString()}>
                {pathology.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 animate-pulse bg-muted rounded-xl" />
          ))}
        </div>
      ) : filteredVideos && filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              pathologyName={pathologyName(video.pathologyId)}
              onEdit={() => handleEdit(video)}
              onDelete={() => setDeleteTarget(video)}
              isDeleting={deletingId === video.id}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <VideoIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium">
              {searchTerm || filterPathology !== "all"
                ? "Nenhum vídeo encontrado com esse filtro"
                : "Nenhum vídeo cadastrado ainda"}
            </p>
            {!searchTerm && filterPathology === "all" && (
              <p className="text-sm text-muted-foreground mt-1">
                Clique em "Novo Vídeo" para adicionar
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmação de exclusão */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar vídeo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que quer eliminar{" "}
              <strong>"{deleteTarget?.title}"</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-video">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-video"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A eliminar...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── Componente de cartão de vídeo ── */
function VideoCard({
  video,
  pathologyName,
  onEdit,
  onDelete,
  isDeleting,
}: {
  video: Video;
  pathologyName: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [thumbError, setThumbError] = useState(false);

  return (
    <Card
      data-testid={`card-video-${video.id}`}
      className="overflow-hidden flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted flex items-center justify-center">
        {!thumbError && video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
            onError={() => setThumbError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs">Sem thumbnail</span>
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs">
          {video.duration}
        </Badge>
        {(video.viewCount ?? 0) > 0 && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 left-2 flex items-center gap-1 text-xs"
          >
            <Eye className="h-3 w-3" />
            {video.viewCount}
          </Badge>
        )}
      </div>

      <CardHeader className="p-4 pb-2 flex-1">
        <h3
          className="font-semibold line-clamp-2 text-sm leading-snug"
          data-testid={`text-video-title-${video.id}`}
        >
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {video.description}
        </p>
        <Badge variant="outline" className="text-xs mt-2 w-fit">
          {pathologyName}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onEdit}
            data-testid={`button-edit-video-${video.id}`}
          >
            <Pencil className="mr-2 h-3 w-3" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            data-testid={`button-delete-video-${video.id}`}
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
