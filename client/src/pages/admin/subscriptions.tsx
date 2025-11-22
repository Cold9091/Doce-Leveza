import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Subscription, User } from "@shared/schema";
import { CreditCard, Trash2, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSubscriptions() {
  const { toast } = useToast();

  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/admin/subscriptions"],
  });

  const { data: users } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/admin/users"],
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
                            <p className="text-sm text-muted-foreground">
                              {subscription.paymentMethod}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {getPlanBadge(subscription.plan)}
                          {getStatusBadge(subscription.status)}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                          <span>
                            Início: {new Date(subscription.startDate).toLocaleDateString('pt-BR')}
                          </span>
                          <span>
                            Renovação: {new Date(subscription.renewalDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteMutation.mutate(subscription.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-subscription-${subscription.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
    </div>
  );
}
