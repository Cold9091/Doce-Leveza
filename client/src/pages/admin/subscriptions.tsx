import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Subscription, User, Pathology, UserAccess } from "@shared/schema";
import { CreditCard, Trash2, User as UserIcon, Settings, UserCircle, Calendar, Info, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminSubscriptions() {
  const { toast } = useToast();
  const [selectedSubscriptionUser, setSelectedSubscriptionUser] = useState<Omit<User, "password"> | null>(null);
  const [editingAccess, setEditingAccess] = useState<{ id?: number, pathologyId: number, status: string } | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/admin/subscriptions"],
  });

  const { data: users } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: pathologies } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });

  const { data: userAccess } = useQuery<UserAccess[]>({
    queryKey: ["/api/admin/users", selectedSubscriptionUser?.id, "access"],
    enabled: !!selectedSubscriptionUser,
  });

  const { data: selectedUserSubscription } = useQuery<Subscription | null>({
    queryKey: ["/api/subscriptions/user", selectedSubscriptionUser?.id],
    enabled: !!selectedSubscriptionUser,
  });

  const getProgramTitle = (pathologyId?: number) => {
    if (!pathologyId) return "Acesso Geral";
    return pathologies?.find(p => p.id === pathologyId)?.title || "Programa";
  };

  const updateAccessMutation = useMutation({
    mutationFn: async (data: { id?: number, pathologyId: number, status: string }) => {
      if (data.id) {
        await apiRequest(`/api/admin/user-access/${data.id}`, {
          method: "PATCH",
          body: { status: data.status },
        });
      } else {
        await apiRequest("/api/admin/user-access", {
          method: "POST",
          body: {
            userId: selectedSubscriptionUser?.id,
            pathologyId: data.pathologyId,
            status: data.status,
            startDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users", selectedSubscriptionUser?.id, "access"] });
      setEditingAccess(null);
      toast({ title: "Sucesso", description: "Status do programa atualizado" });
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data: { id: number, status: string }) => {
      await apiRequest(`/api/admin/subscriptions/${data.id}`, {
        method: "PATCH",
        body: { status: data.status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/user", selectedSubscriptionUser?.id] });
      setEditingSubscription(null);
      toast({ title: "Sucesso", description: "Status da assinatura atualizado" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/subscriptions/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      toast({
        title: "Sucesso",
        description: "Assinatura removida com sucesso",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      ativa: "default",
      cancelada: "destructive",
      expirada: "secondary",
    };
    const labels: Record<string, string> = {
      ativa: "Ativa",
      cancelada: "Cancelada",
      expirada: "Expirada",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const labels: Record<string, string> = {
      mensal: "Mensal",
      anual: "Anual",
    };
    return (
      <Badge variant="secondary">
        {labels[plan] || plan}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-admin-subscriptions">
          Gerenciar Assinaturas
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualize e gerencie todas as assinaturas do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm text-muted-foreground">
            Total de {subscriptions?.length || 0} assinaturas
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : subscriptions && subscriptions.length > 0 ? (
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id} data-testid={`card-subscription-${subscription.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {users?.find((u) => u.id === subscription.userId)?.name || `Usuário #${subscription.userId}`}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] py-0">
                                {subscription.paymentMethod}
                              </Badge>
                              {getPlanBadge(subscription.plan)}
                              {getStatusBadge(subscription.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => {
                            const user = users?.find(u => u.id === subscription.userId);
                            if (user) setSelectedSubscriptionUser(user);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                          Gerenciar
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja remover esta assinatura?")) {
                              deleteMutation.mutate(subscription.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-subscription-${subscription.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma assinatura cadastrada
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSubscriptionUser} onOpenChange={(open) => !open && setSelectedSubscriptionUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <CreditCard className="h-6 w-6 text-primary" />
              Gestão de Assinatura
            </DialogTitle>
            <DialogDescription>
              Informações de pagamento e programas contratados
            </DialogDescription>
          </DialogHeader>

          {selectedSubscriptionUser && (
            <div className="space-y-6 py-4">
              {/* Seção 1: Identificação do Assinante */}
              <section className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Assinante
                </h4>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-medium text-lg">{selectedSubscriptionUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubscriptionUser.phone}</p>
                </div>
              </section>

              {/* Seção 2: Detalhes do Plano e Tempo Restante */}
              <section className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Plano e Vigência
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => selectedUserSubscription && setEditingSubscription(selectedUserSubscription)}>
                    <p className="text-xs text-muted-foreground mb-1">Status e Plano (Clique para editar)</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedUserSubscription?.status || "expirada")}
                      <span className="text-sm font-medium capitalize">
                        {selectedUserSubscription?.plan || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Tempo Restante</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">
                        {selectedUserSubscription ? (
                          (() => {
                            const now = new Date();
                            const renewal = new Date(selectedUserSubscription.renewalDate);
                            const diffTime = renewal.getTime() - now.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays > 0 ? `${diffDays} dias restantes` : "Expirado";
                          })()
                        ) : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Seção 3: Programas Contratados */}
              <section className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Programas e Status
                </h4>
                <div className="space-y-2">
                  {pathologies?.map((pathology) => {
                    const access = userAccess?.find(a => a.pathologyId === pathology.id);
                    const status = access?.status || "inativo";
                    
                    const statusConfig: Record<string, { label: string, variant: "default" | "secondary" | "outline" | "destructive" }> = {
                      activo: { label: "Pago", variant: "default" },
                      pendente: { label: "Pendente", variant: "secondary" },
                      inativo: { label: "Inativo", variant: "outline" },
                      expirado: { label: "Expirado", variant: "destructive" },
                    };

                    const config = statusConfig[status] || statusConfig.inativo;

                    return (
                      <div 
                        key={pathology.id} 
                        className="flex items-center justify-between p-3 border rounded-lg bg-card cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => setEditingAccess({ id: access?.id, pathologyId: pathology.id, status })}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {pathology.title}
                          </span>
                          {access && (
                            <span className="text-xs text-muted-foreground">
                              Expira em: {format(new Date(access.expiryDate), "dd/MM/yyyy")}
                            </span>
                          )}
                        </div>
                        <Badge variant={config.variant} className="text-[10px] uppercase">
                          {config.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setSelectedSubscriptionUser(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pop-up de Edição de Status do Programa */}
      <Dialog open={!!editingAccess} onOpenChange={(open) => !open && setEditingAccess(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alterar Status do Programa</DialogTitle>
            <DialogDescription>
              Selecione o novo status para o programa: {pathologies?.find(p => p.id === editingAccess?.pathologyId)?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: "activo", label: "Pago", variant: "default" },
                { val: "pendente", label: "Pendente", variant: "secondary" },
                { val: "inativo", label: "Inativo", variant: "outline" },
                { val: "expirado", label: "Expirado", variant: "destructive" }
              ].map((s) => (
                <Button
                  key={s.val}
                  variant={editingAccess?.status === s.val ? (s.variant as any) : "ghost"}
                  className={editingAccess?.status === s.val ? "ring-2 ring-primary ring-offset-2" : ""}
                  onClick={() => editingAccess && updateAccessMutation.mutate({ ...editingAccess, status: s.val })}
                  disabled={updateAccessMutation.isPending}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pop-up de Edição de Status da Assinatura */}
      <Dialog open={!!editingSubscription} onOpenChange={(open) => !open && setEditingSubscription(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alterar Status da Assinatura</DialogTitle>
            <DialogDescription>
              Selecione o novo status para a assinatura do aluno
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: "ativa", label: "Ativa", variant: "default" },
                { val: "cancelada", label: "Cancelada", variant: "destructive" },
                { val: "expirada", label: "Expirada", variant: "secondary" }
              ].map((s) => (
                <Button
                  key={s.val}
                  variant={editingSubscription?.status === s.val ? (s.variant as any) : "ghost"}
                  className={editingSubscription?.status === s.val ? "ring-2 ring-primary ring-offset-2" : ""}
                  onClick={() => editingSubscription && updateSubscriptionMutation.mutate({ id: editingSubscription.id, status: s.val as any })}
                  disabled={updateSubscriptionMutation.isPending}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
