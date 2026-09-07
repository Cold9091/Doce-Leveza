import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Pencil, Trash2, Activity, Upload, ImageIcon, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPathologySchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

type ProgramPlan = {
  id: number;
  pathologyId: number | null;
  type: "mensal" | "trimestral" | "ilimitado";
  price: number;
  durationDays: number;
  whatsappUrl?: string | null;
  bonusContentUrl?: string | null;
  active: number;
};

const emptyPlan = (): Omit<ProgramPlan, "id"> => ({
  pathologyId: null, type: "mensal", price: 0, durationDays: 30,
  whatsappUrl: null, bonusContentUrl: null, active: 1,
});

export default function AdminPathologies() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPathology, setEditingPathology] = useState<Pathology | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProgramPlan | null>(null);
  const [planDraft, setPlanDraft] = useState<Omit<ProgramPlan, "id">>(emptyPlan());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: pathologies, isLoading } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });
  const { data: plans = [] } = useQuery<ProgramPlan[]>({
    queryKey: ["/api/admin/plans"],
    queryFn: async () => {
      const response = await fetch("/api/admin/plans", { credentials: "include" });
      if (!response.ok) throw new Error("Não foi possível carregar os planos");
      return response.json();
    },
  });
  const savePlanMutation = useMutation({
    mutationFn: async (data: Omit<ProgramPlan, "id">) => {
      if (editingPlan) return apiRequest("PUT", `/api/admin/plans/${editingPlan.id}`, data);
      return apiRequest("POST", "/api/admin/plans", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      setPlanDialogOpen(false);
      setEditingPlan(null);
      toast({ title: "Sucesso", description: "Plano guardado com sucesso" });
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message || "Não foi possível guardar o plano", variant: "destructive" }),
  });
  const deletePlanMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
    },
  });
  const openPlanDialog = (plan?: ProgramPlan, pathologyId: number | null = null) => {
    setEditingPlan(plan || null);
    setPlanDraft(plan ? { pathologyId: plan.pathologyId, type: plan.type, price: plan.price, durationDays: plan.durationDays, whatsappUrl: plan.whatsappUrl || null, bonusContentUrl: plan.bonusContentUrl || null, active: plan.active } : { ...emptyPlan(), pathologyId, type: pathologyId === null ? "ilimitado" : "mensal", durationDays: pathologyId === null ? 365 : 30 });
    setPlanDialogOpen(true);
  };

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

  const uploadCover = async (slug: string): Promise<string | null> => {
    if (!coverFile) return form.getValues("imageUrl") || null;
    const formData = new FormData();
    formData.append("image", coverFile);
    formData.append("folder", "doce-leveza/programs");
    formData.append("publicId", `program-${slug}`);
    const res = await fetch("/api/admin/upload/image", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Falha ao enviar imagem");
    const data = await res.json();
    return data.url as string;
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertPathology) => {
      await apiRequest("POST", "/api/admin/pathologies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pathologies"], refetchType: "all" });
      queryClient.refetchQueries({ queryKey: ["/api/pathologies"] });
      toast({ title: "Sucesso", description: "Programa criado com sucesso" });
      setIsDialogOpen(false);
      form.reset();
      setCoverFile(null);
      setCoverPreview("");
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.message || "Erro ao criar programa", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertPathology }) => {
      await apiRequest("PUT", `/api/admin/pathologies/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pathologies"], refetchType: "all" });
      queryClient.refetchQueries({ queryKey: ["/api/pathologies"] });
      toast({ title: "Sucesso", description: "Programa atualizado com sucesso" });
      setIsDialogOpen(false);
      setEditingPathology(null);
      form.reset();
      setCoverFile(null);
      setCoverPreview("");
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.message || "Erro ao atualizar programa", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/pathologies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pathologies"], refetchType: "all" });
      queryClient.refetchQueries({ queryKey: ["/api/pathologies"] });
      toast({ title: "Sucesso", description: "Programa removido com sucesso" });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.message || "Erro ao remover programa", variant: "destructive" });
    },
  });

  const onSubmit = async (data: InsertPathology) => {
    try {
      setIsUploading(true);
      const imageUrl = await uploadCover(data.slug);
      const finalData = { ...data, imageUrl: imageUrl || data.imageUrl };
      if (editingPathology) {
        updateMutation.mutate({ id: editingPathology.id, data: finalData });
      } else {
        createMutation.mutate(finalData);
      }
    } catch (err: any) {
      toast({ title: "Erro de upload", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
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
    setCoverPreview(pathology.imageUrl || "");
    setCoverFile(null);
    setIsDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingPathology(null);
      form.reset({ slug: "", title: "", description: "", icon: "Activity", imageUrl: "", price: 0 });
      setCoverFile(null);
      setCoverPreview("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Formato inválido", description: "Por favor selecione uma imagem (JPG, PNG, WEBP)", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Ficheiro muito grande", description: "A imagem deve ter no máximo 5MB", variant: "destructive" });
      return;
    }
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    form.setValue("imageUrl", "");
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview("");
    form.setValue("imageUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isSaving = isUploading || createMutation.isPending || updateMutation.isPending;

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
          <p className="text-sm text-muted-foreground">
            {pathologies ? `${pathologies.length} programa(s) encontrado(s)` : "a carregar..."}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-pathology">
              <Plus className="mr-2 h-4 w-4" />
              Novo Programa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPathology ? "Editar Programa" : "Novo Programa"}</DialogTitle>
              <DialogDescription>
                {editingPathology ? "Atualize as informações do programa" : "Adicione um novo programa ao sistema"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Imagem de Capa</label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors cursor-pointer ${
                      coverPreview ? "border-primary/40" : "border-muted-foreground/30 hover:border-primary/40"
                    }`}
                    style={{ minHeight: "160px" }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {coverPreview ? (
                      <div className="relative">
                        <img
                          src={coverPreview}
                          alt="Pré-visualização da capa"
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="text-white text-sm font-medium flex items-center gap-1">
                            <Upload className="h-4 w-4" /> Alterar imagem
                          </span>
                        </div>
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                          onClick={(e) => { e.stopPropagation(); removeCover(); }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {coverFile && (
                          <Badge className="absolute bottom-2 left-2 bg-primary text-xs">
                            Nova imagem · {(coverFile.size / 1024).toFixed(0)} KB
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground px-4">
                        <ImageIcon className="h-8 w-8" />
                        <p className="text-sm font-medium text-center">Clique para selecionar uma imagem</p>
                        <p className="text-xs text-center">JPG, PNG ou WEBP · máx. 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    data-testid="input-pathology-cover"
                  />
                </div>

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
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
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
                    disabled={isSaving}
                    data-testid="button-submit-pathology"
                  >
                    {isSaving ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isUploading ? "A enviar imagem..." : "A guardar..."}
                      </>
                    ) : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Planos e ofertas</CardTitle><p className="text-sm text-muted-foreground mt-1">Defina preço, duração, links de WhatsApp e bónus por plano.</p></div>
          <Button
            variant="outline"
            onClick={() => openPlanDialog(plans.find(plan => plan.type === "ilimitado" && plan.pathologyId === null), null)}
            data-testid="button-add-unlimited-plan"
          >
            Configurar oferta ilimitada
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {pathologies?.map(pathology => {
            const programPlans = plans.filter(plan => plan.pathologyId === pathology.id);
            return <div key={pathology.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium">{pathology.title}</p><Button size="sm" variant="outline" onClick={() => openPlanDialog(undefined, pathology.id)}>Adicionar plano</Button></div>
              <div className="mt-3 space-y-2">{programPlans.length ? programPlans.map(plan => <div className="flex flex-wrap items-center justify-between gap-2 text-sm" key={plan.id}>
                <span><Badge variant={plan.active ? "default" : "secondary"}>{plan.type === "trimestral" ? "Trimestral" : "Mensal"}</Badge> <strong className="ml-2">{plan.price.toLocaleString()} Kz</strong> · {plan.durationDays} dias</span>
                <span className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => openPlanDialog(plan)}>Editar</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => deletePlanMutation.mutate(plan.id)}>Remover</Button></span>
              </div>) : <p className="text-sm text-muted-foreground">Sem planos configurados.</p>}</div>
            </div>;
          })}
          {plans.filter(plan => plan.pathologyId === null).map(plan => <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center justify-between" key={plan.id}><span><strong>Oferta ilimitada</strong> — {plan.price.toLocaleString()} Kz</span><Button size="sm" variant="outline" onClick={() => openPlanDialog(plan)}>Editar</Button></div>)}
        </CardContent>
      </Card>
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingPlan ? "Editar plano" : "Novo plano"}</DialogTitle><DialogDescription>Os links são usados para a comunidade e o bónus do programa.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Tipo de plano<select className="mt-1 w-full rounded-md border bg-background p-2" value={planDraft.type} onChange={e => setPlanDraft({ ...planDraft, type: e.target.value as ProgramPlan["type"], durationDays: e.target.value === "trimestral" ? 90 : e.target.value === "ilimitado" ? 365 : 30 })} disabled={planDraft.pathologyId === null}><option value="mensal">Mensal</option><option value="trimestral">Trimestral</option><option value="ilimitado">Ilimitado</option></select></label>
            <label className="text-sm font-medium">Preço (Kz)<Input type="number" value={planDraft.price} onChange={e => setPlanDraft({ ...planDraft, price: Number(e.target.value) })} /></label>
            <label className="text-sm font-medium">Duração (dias)<Input type="number" value={planDraft.durationDays} disabled={planDraft.type === "ilimitado"} onChange={e => setPlanDraft({ ...planDraft, durationDays: Number(e.target.value) })} /></label>
            <label className="text-sm font-medium">URL da comunidade WhatsApp<Input value={planDraft.whatsappUrl || ""} onChange={e => setPlanDraft({ ...planDraft, whatsappUrl: e.target.value || null })} placeholder="https://chat.whatsapp.com/..." /></label>
            <label className="text-sm font-medium">URL do bónus<Input value={planDraft.bonusContentUrl || ""} onChange={e => setPlanDraft({ ...planDraft, bonusContentUrl: e.target.value || null })} placeholder="https://..." /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!planDraft.active} onChange={e => setPlanDraft({ ...planDraft, active: e.target.checked ? 1 : 0 })} /> Plano activo</label>
          </div>
          <DialogFooter><Button onClick={() => savePlanMutation.mutate(planDraft)} disabled={savePlanMutation.isPending}>{savePlanMutation.isPending ? "A guardar..." : "Guardar plano"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted" />
          ))}
        </div>
      ) : pathologies && pathologies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pathologies.map((pathology) => (
            <Card key={pathology.id} data-testid={`card-pathology-${pathology.id}`} className="overflow-hidden">
              {/* Cover Image */}
              <div className="relative w-full h-40 bg-muted">
                {pathology.imageUrl ? (
                  <img
                    src={pathology.imageUrl}
                    alt={pathology.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Activity className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="truncate text-base">{pathology.title}</span>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    {pathology.price?.toLocaleString()} AOA
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {pathology.description}
                </p>
                <p className="text-xs text-muted-foreground">Slug: <span className="font-mono">{pathology.slug}</span></p>
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
            <p className="text-muted-foreground">Nenhum programa cadastrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
