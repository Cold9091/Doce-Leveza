import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Subscription, User, Pathology, UserAccess, AdminNotification } from "@shared/schema";
import { CreditCard, Trash2, User as UserIcon, Settings, UserCircle, Calendar, Info, Package, ExternalLink, Bell, Check, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export default function AdminSubscriptions() {
  const { toast } = useToast();
  const [selectedSubscriptionUser, setSelectedSubscriptionUser] = useState<Omit<User, "password"> | null>(null);
  const [editingAccess, setEditingAccess] = useState<{ id?: number, pathologyId: number, status: string } | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editingRenewal, setEditingRenewal] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/admin/subscriptions"],
  });

  const { data: users } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: adminNotifications } = useQuery<AdminNotification[]>({
    queryKey: ["/api/admin/notifications"],
  });

  const filteredSubscriptions = useMemo(() => {
    if (!subscriptions || !users) return [];
    if (!searchQuery.trim()) return subscriptions;

    const query = searchQuery.toLowerCase().trim();
    return subscriptions.filter(sub => {
      const user = users.find(u => u.id === sub.userId);
      if (!user) return false;
      return (
        user.name.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query) ||
        sub.paymentMethod.toLowerCase().includes(query) ||
        sub.plan.toLowerCase().includes(query)
      );
    });
  }, [subscriptions, users, searchQuery]);

  const unreadCount = adminNotifications?.filter(n => !n.read).length || 0;

  const handleNotificationClick = (notification: AdminNotification) => {
    // Marcar como lida
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }

    // Extrair nome do usuário da mensagem se possível
    // Ex: "Maria Silva realizou um pagamento..."
    const message = notification.message;
    // Tenta pegar as primeiras palavras que parecem um nome (capitalizadas)
    const match = message.match(/^([A-Z][a-zÀ-ÿ]+\s+[A-Z][a-zÀ-ÿ]+)/);
    if (match && match[1]) {
      setSearchQuery(match[1]);
    } else if (notification.relatedId) {
      // Se tiver relatedId (assinatura), busca o usuário associado
      const sub = subscriptions?.find(s => s.id === notification.relatedId);
      if (sub) {
        const user = users?.find(u => u.id === sub.userId);
        if (user) {
          setSearchQuery(user.name);
        }
      }
    }
  };

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/admin/notifications/${id}/read`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
    },
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

  const updateAccessMutation = useMutation({
    mutationFn: async (data: { id?: number, pathologyId: number, status: string }) => {
      if (data.id) {
        await apiRequest("PATCH", `/api/admin/user-access/${data.id}`, { status: data.status });
      } else {
        await apiRequest("POST", "/api/admin/user-access", {
          userId: selectedSubscriptionUser?.id,
          pathologyId: data.pathologyId,
          status: data.status,
          startDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      await apiRequest("PATCH", `/api/admin/subscriptions/${data.id}`, { status: data.status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/user", selectedSubscriptionUser?.id] });
      setEditingSubscription(null);
      setEditingRenewal(null);
      toast({ title: "Sucesso", description: "Assinatura atualizada com sucesso" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/subscriptions/${id}`, undefined);
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
      <Badge variant={variants[status] || "default"} className="font-medium">
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
      <Badge variant="secondary" className="font-medium">
        {labels[plan] || plan}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-admin-subscriptions">
            Gerenciar Assinaturas
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize e gerencie todas as assinaturas do sistema
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative h-10 w-10">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <h4 className="text-sm font-semibold">Notificações</h4>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {unreadCount} novas
                </Badge>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {adminNotifications && adminNotifications.length > 0 ? (
                <div className="flex flex-col">
                  {adminNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex flex-col gap-1 border-b p-4 text-sm transition-colors hover:bg-muted/50 cursor-pointer ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{notification.title}</span>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60 mt-1">
                        {format(new Date(notification.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center p-4 text-center">
                  <Bell className="mb-2 h-8 w-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">Sem novas notificações</p>
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, telefone ou plano..."
            className="pl-10 h-12 bg-card border-border/60 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground font-medium">
                {searchQuery ? (
                  <>Total de {filteredSubscriptions.length} resultados encontrados</>
                ) : (
                  <>Total de {subscriptions?.length || 0} assinaturas</>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse bg-muted rounded-lg" />
                ))}
              </div>
            ) : filteredSubscriptions && filteredSubscriptions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {filteredSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="hover-elevate transition-all border-border/60" data-testid={`card-subscription-${subscription.id}`}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                            <UserIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg leading-tight">
                              {users?.find((u) => u.id === subscription.userId)?.name || `Usuário #${subscription.userId}`}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">
                                {subscription.paymentMethod}
                              </Badge>
                              {getPlanBadge(subscription.plan)}
                              {getStatusBadge(subscription.status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none gap-2"
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
                            className="h-9 w-9"
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
              <div className="text-center py-16 bg-muted/20 rounded-xl border-2 border-dashed">
                {searchQuery ? (
                  <>
                    <Search className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground font-medium">
                      Nenhum aluno encontrado para "{searchQuery}"
                    </p>
                    <Button 
                      variant="ghost" 
                      className="mt-2 text-primary hover:bg-primary/10"
                      onClick={() => setSearchQuery("")}
                    >
                      Limpar pesquisa
                    </Button>
                  </>
                ) : (
                  <>
                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground font-medium">
                      Nenhuma assinatura cadastrada
                    </p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedSubscriptionUser} onOpenChange={(open) => !open && setSelectedSubscriptionUser(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden sm:rounded-xl">
          <div className="bg-primary/5 px-6 py-6 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                Gestão de Assinatura
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium mt-1">
                {selectedSubscriptionUser?.name} • {selectedSubscriptionUser?.phone}
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedSubscriptionUser && (
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="bg-card border p-4 rounded-xl cursor-pointer hover:bg-accent/50 transition-all hover-elevate active-elevate-2 group" 
                  onClick={() => selectedUserSubscription && setEditingSubscription(selectedUserSubscription)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Plano Atual</p>
                    <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedUserSubscription?.status || "expirada")}
                    <span className="text-sm font-semibold capitalize text-foreground">
                      {selectedUserSubscription?.plan || 'N/A'}
                    </span>
                  </div>
                </div>

                <div 
                  className="bg-card border p-4 rounded-xl cursor-pointer hover:bg-accent/50 transition-all hover-elevate active-elevate-2 group" 
                  onClick={() => selectedUserSubscription && setEditingRenewal(selectedUserSubscription)}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2 flex items-center justify-between">
                    Renovação
                    <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      {selectedUserSubscription ? (
                        (() => {
                          const now = new Date();
                          const renewal = new Date(selectedUserSubscription.renewalDate);
                          const diffTime = renewal.getTime() - now.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return diffDays > 0 ? `${diffDays} dias` : "Expirado";
                        })()
                      ) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                    <Package className="h-3.5 w-3.5" />
                    Acesso aos Programas
                  </h4>
                  <Badge variant="outline" className="text-[10px] py-0 h-5 px-2 bg-muted/50">
                    {pathologies?.length || 0} Total
                  </Badge>
                </div>
                
                <div className="grid gap-2">
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
                        className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-muted/30 cursor-pointer hover:bg-accent/40 transition-all hover-elevate group"
                        onClick={() => setEditingAccess({ id: access?.id, pathologyId: pathology.id, status })}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {pathology.title}
                          </span>
                          {access && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              Expira em: {format(new Date(access.expiryDate), "dd/MM/yyyy")}
                            </span>
                          )}
                        </div>
                        <Badge variant={config.variant} className="text-[10px] px-2 py-0 h-5 font-bold uppercase tracking-tight">
                          {config.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button variant="outline" className="flex-1 h-11" onClick={() => setSelectedSubscriptionUser(null)}>
                  Fechar Painel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pop-up de Edição de Status do Programa - Compacto */}
      <Dialog open={!!editingAccess} onOpenChange={(open) => !open && setEditingAccess(null)}>
        <DialogContent className="sm:max-w-[320px] p-0 overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <DialogTitle className="text-base font-bold">Status do Programa</DialogTitle>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {[
              { val: "activo", label: "Pago", variant: "default" },
              { val: "pendente", label: "Pendente", variant: "secondary" },
              { val: "inativo", label: "Inativo", variant: "outline" },
              { val: "expirado", label: "Expirado", variant: "destructive" }
            ].map((s) => (
              <Button
                key={s.val}
                variant={editingAccess?.status === s.val ? (s.variant as any) : "ghost"}
                className={`h-10 text-xs font-bold uppercase tracking-wider ${editingAccess?.status === s.val ? "shadow-sm" : ""}`}
                onClick={() => editingAccess && updateAccessMutation.mutate({ ...editingAccess, status: s.val })}
                disabled={updateAccessMutation.isPending}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Pop-up de Edição de Status da Assinatura - Compacto */}
      <Dialog open={!!editingSubscription} onOpenChange={(open) => !open && setEditingSubscription(null)}>
        <DialogContent className="sm:max-w-[320px] p-0 overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <DialogTitle className="text-base font-bold">Status da Assinatura</DialogTitle>
          </div>
          <div className="p-3 grid grid-cols-1 gap-2">
            {[
              { val: "ativa", label: "Ativa", variant: "default" },
              { val: "cancelada", label: "Cancelada", variant: "destructive" },
              { val: "expirada", label: "Expirada", variant: "secondary" }
            ].map((s) => (
              <Button
                key={s.val}
                variant={editingSubscription?.status === s.val ? (s.variant as any) : "ghost"}
                className={`h-11 font-bold uppercase tracking-widest ${editingSubscription?.status === s.val ? "shadow-md" : ""}`}
                onClick={() => editingSubscription && updateSubscriptionMutation.mutate({ id: editingSubscription.id, status: s.val as any })}
                disabled={updateSubscriptionMutation.isPending}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      {/* Pop-up de Edição de Renovação - Compacto */}
      <Dialog open={!!editingRenewal} onOpenChange={(open) => !open && setEditingRenewal(null)}>
        <DialogContent className="sm:max-w-[320px] p-0 overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <DialogTitle className="text-base font-bold">Alterar Prazo de Renovação</DialogTitle>
          </div>
          <div className="p-3 grid grid-cols-1 gap-2">
            {[
              { days: 15, label: "15 Dias" },
              { days: 30, label: "30 Dias" },
              { days: 365, label: "365 Dias (1 Ano)" }
            ].map((opt) => (
              <Button
                key={opt.days}
                variant="ghost"
                className="h-11 font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary"
                onClick={() => {
                  if (editingRenewal) {
                    const newRenewalDate = new Date();
                    newRenewalDate.setDate(newRenewalDate.getDate() + opt.days);
                    updateSubscriptionMutation.mutate({ 
                      id: editingRenewal.id, 
                      renewalDate: newRenewalDate.toISOString() 
                    } as any);
                  }
                }}
                disabled={updateSubscriptionMutation.isPending}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
