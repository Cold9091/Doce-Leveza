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
  const [selectedUser, setSelectedUser] = useState<Omit<User, "password"> | null>(null);

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
    queryKey: ["/api/admin/users", selectedUser?.id, "access"],
    enabled: !!selectedUser,
  });

  const { data: selectedUserSubscription } = useQuery<Subscription | null>({
    queryKey: ["/api/subscriptions/user", selectedUser?.id],
    enabled: !!selectedUser,
  });

  const getProgramTitle = (pathologyId?: number) => {
    if (!pathologyId) return "Acesso Geral";
    return pathologies?.find(p => p.id === pathologyId)?.title || "Programa";
  };

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
                            if (user) setSelectedUser(user);
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

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <UserCircle className="h-6 w-6 text-primary" />
              Detalhes do Aluno
            </DialogTitle>
            <DialogDescription>
              Informações completas e histórico de acessos
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* Seção 1: Informações Pessoais */}
              <section className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Informações Pessoais
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Nome Completo</p>
                    <p className="font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                  <div className="col-span-2 border-t pt-2 mt-2">
                    <p className="text-xs text-muted-foreground">Endereço</p>
                    <p className="font-medium">{selectedUser.address}</p>
                  </div>
                </div>
              </section>

              {/* Seção 2: Status da Conta */}
              <section className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Status da Conta
                </h4>
                <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={selectedUserSubscription?.status === 'ativa' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-500'}>
                      {selectedUserSubscription?.status === 'ativa' ? 'Assinatura Ativa' : (selectedUserSubscription ? 'Inativa' : 'Sem Assinatura')}
                    </Badge>
                    <span className="text-sm text-muted-foreground capitalize">
                      Plano {selectedUserSubscription?.plan || 'N/A'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Cadastrado em</p>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedUser.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </section>

              {/* Seção 3: Programas e Acessos */}
              <section className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Programas e Acessos
                </h4>
                <div className="space-y-2">
                  {userAccess && userAccess.length > 0 ? (
                    userAccess.map((access) => (
                      <div key={access.id} className="border rounded-lg overflow-hidden mb-2">
                        <div className="bg-muted/50 p-3 border-b flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {getProgramTitle(access.pathologyId)}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {access.status}
                          </Badge>
                        </div>
                        <div className="p-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Início do Acesso</p>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              {format(new Date(access.startDate), "dd/MM/yyyy")}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Expiração</p>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-orange-500" />
                              {format(new Date(access.expiryDate), "dd/MM/yyyy")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : selectedUserSubscription ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 p-3 border-b flex items-center justify-between">
                        <span className="font-medium text-sm">
                          Acesso Geral (Assinatura)
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {selectedUserSubscription.plan}
                        </Badge>
                      </div>
                      <div className="p-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Início do Acesso</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {format(new Date(selectedUserSubscription.startDate), "dd/MM/yyyy")}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Próxima Renovação</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-orange-500" />
                            {format(new Date(selectedUserSubscription.renewalDate), "dd/MM/yyyy")}
                          </div>
                        </div>
                        <div className="col-span-2 pt-2">
                          <p className="text-xs text-muted-foreground mb-2">Método de Pagamento</p>
                          <Badge variant="secondary" className="font-normal">
                            {selectedUserSubscription.paymentMethod}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">Nenhum programa ativo no momento</p>
                    </div>
                  )}
                </div>
              </section>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
