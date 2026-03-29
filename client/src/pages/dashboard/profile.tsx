import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Phone,
  MapPin,
  CreditCard,
  Package,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Pencil,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Pathology, Subscription, User as UserType, UserAccess } from "@shared/schema";
import { Link } from "wouter";

export default function Profile() {
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const { data: userInfo, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const { data: pathologies } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  });

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ["/api/subscriptions/user", userInfo?.id || 1],
    enabled: !!userInfo?.id,
    staleTime: 1000 * 60,
  });

  const { data: userAccessList = [] } = useQuery<UserAccess[]>({
    queryKey: ["/api/user/access"],
    enabled: !!userInfo?.id,
    staleTime: 1000 * 60,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; address: string }) =>
      apiRequest("PATCH", "/api/auth/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setEditOpen(false);
      toast({ title: "Perfil atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar perfil", variant: "destructive" });
    },
  });

  const openEdit = () => {
    setEditName(userInfo?.name || "");
    setEditAddress(userInfo?.address || "");
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!editName.trim()) {
      toast({ title: "O nome não pode estar vazio", variant: "destructive" });
      return;
    }
    updateProfileMutation.mutate({ name: editName.trim(), address: editAddress.trim() });
  };

  const user = userInfo || { name: "Usuário", phone: "-", address: "-", avatar: "" };

  // IDs dos programas já com acesso ativo e não expirado
  const unlockedPathologyIds = new Set(
    userAccessList
      .filter(a => a.status === "ativo" && new Date(a.expiryDate) > new Date())
      .map(a => a.pathologyId)
  );

  const hasFullAccess = subscription?.status === "ativa";

  const lockedPrograms = hasFullAccess
    ? []
    : (pathologies || []).filter(p => !unlockedPathologyIds.has(p.id));

  if (userLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
          <div className="lg:col-span-2 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            Meu Perfil
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie suas informações, assinaturas e novos programas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription>
              Membro desde{" "}
              {userInfo?.createdAt
                ? new Date(userInfo.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
                : "—"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {user.phone && user.phone !== "-" && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.address && user.address !== "-" && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{user.address}</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              data-testid="button-edit-profile"
              onClick={openEdit}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </CardContent>
        </Card>

        {/* Subscription & Programs Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Subscription */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Assinatura</CardTitle>
                </div>
                {(subscription?.status === "ativa" || subscription?.status === "por_programa") && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    {subscription.status === "por_programa" ? "Por Programa" : "Ativa"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(subscription?.status === "ativa" || subscription?.status === "por_programa") ? (
                <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Plano Atual</p>
                    <p className="text-lg font-bold capitalize">
                      {subscription.status === "por_programa" ? "Acesso por Programa" : subscription.plan}
                    </p>
                    {subscription.status === "ativa" && subscription.renewalDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Próxima renovação:{" "}
                          {new Date(subscription.renewalDate).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard/assinatura">
                      <Button variant="secondary" size="sm" className="hover-elevate">
                        Gerenciar Plano
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 p-6 text-center rounded-lg bg-muted/50 border border-dashed">
                  <CreditCard className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">Sem assinatura ativa</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Adquira um programa para ter acesso ao conteúdo exclusivo.
                    </p>
                  </div>
                  <Link href="/dashboard/assinatura">
                    <Button size="sm">Ver Planos</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Locked Programs */}
          {lockedPrograms.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Desbloquear Outros Programas</CardTitle>
                </div>
                <CardDescription>Expanda seu conhecimento com outros programas especializados</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="group relative p-4 rounded-xl border bg-card hover:bg-accent/5 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm leading-tight pr-8">{program.title}</h3>
                      <Badge variant="outline" className="text-primary border-primary/20">
                        {program.price?.toLocaleString()} AOA
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {program.description}
                    </p>
                    <Link href="/dashboard/assinaturas">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                        data-testid={`button-unlock-program-${program.id}`}
                      >
                        Desbloquear Agora
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* All programs unlocked */}
          {lockedPrograms.length === 0 && (subscription?.status === "ativa" || subscription?.status === "por_programa") && (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <ShieldCheck className="h-10 w-10 text-green-500" />
                <p className="font-semibold text-foreground">Todos os programas desbloqueados!</p>
                <p className="text-sm text-muted-foreground">
                  Você tem acesso a todos os programas disponíveis.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome completo</Label>
              <Input
                id="edit-name"
                data-testid="input-edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Localização / Endereço</Label>
              <Input
                id="edit-address"
                data-testid="input-edit-address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Ex: Luanda, Angola"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} data-testid="button-cancel-edit">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? "A guardar..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
