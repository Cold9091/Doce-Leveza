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
import { Plus, Pencil, Trash2, Video as VideoIcon, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVideoSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export default function AdminVideos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterPathology, setFilterPathology] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  const { data: pathologies } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });

  const form = useForm<InsertVideo>({
    resolver: zodResolver(insertVideoSchema),
    defaultValues: {
      pathologyId: 0,
      title: "",
      description: "",
      duration: "",
      thumbnailUrl: "",
      videoUrl: "",
      resources: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertVideo) => {
      await apiRequest("/api/admin/videos", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Sucesso",
        description: "Vídeo criado com sucesso",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar vídeo",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/videos/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Sucesso",
        description: "Vídeo removido com sucesso",
      });
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
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-admin-videos">
            Gerenciar Vídeos
          </h1>
          <p className="text-muted-foreground mt-2">
            Adicione e gerencie os vídeos do sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-video">
              <Plus className="mr-2 h-4 w-4" />
              Novo Vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Vídeo</DialogTitle>
              <DialogDescription>
                Adicione um novo vídeo ao sistema
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
                        <Input {...field} placeholder="Título do vídeo" data-testid="input-video-title" />
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
                        <Textarea {...field} rows={3} placeholder="Descrição do vídeo" data-testid="input-video-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pathologyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patologia</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-video-pathology">
                              <SelectValue placeholder="Selecione" />
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
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: 15:30" data-testid="input-video-duration" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Vídeo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-video-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Thumbnail</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-video-thumbnail" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-video"
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vídeos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-videos"
              />
            </div>
            <Select value={filterPathology} onValueChange={setFilterPathology}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-pathology">
                <SelectValue placeholder="Todas patologias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas patologias</SelectItem>
                {pathologies?.map((pathology) => (
                  <SelectItem key={pathology.id} value={pathology.id.toString()}>
                    {pathology.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : filteredVideos && filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <Card key={video.id} data-testid={`card-video-${video.id}`}>
                  <div className="relative aspect-video bg-muted">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm">
                      {video.duration}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {video.description}
                      </p>
                      <Badge variant="secondary" className="text-xs mt-2">
                        {pathologies?.find((p) => p.id === video.pathologyId)?.title}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        data-testid={`button-edit-video-${video.id}`}
                      >
                        <Pencil className="mr-2 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(video.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-video-${video.id}`}
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
              <VideoIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || filterPathology !== "all"
                  ? "Nenhum vídeo encontrado"
                  : "Nenhum vídeo cadastrado"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
