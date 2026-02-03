import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, Subscription, Pathology } from "@shared/schema";
import { Search, Plus, Pencil, Trash2, UserCircle, Calendar, Package, Info } from "lucide-react";
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

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<Omit<User, "password"> | null>(null);
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: subscription } = useQuery<Subscription | null>({
    queryKey: ["/api/subscriptions/user", selectedUser?.id],
    enabled: !!selectedUser,
  });

  const { data: pathologies } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Sucesso",
        description: "Aluno removido com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover aluno",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)
  );

  const getProgramTitle = (pathologyId?: number) => {
    if (!pathologyId) return "Acesso Geral";
    return pathologies?.find(p => p.id === pathologyId)?.title || "Programa";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-admin-users">
            Gerenciar Alunos
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize e gerencie todos os alunos cadastrados
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <Card 
                  key={user.id} 
                  data-testid={`card-user-${user.id}`} 
                  className="hover-elevate cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <UserCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{user.name}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>{user.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-600 bg-emerald-500/5">
                          Ativo
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-view-user-${user.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Tem certeza que deseja remover este aluno?")) {
                              deleteMutation.mutate(user.id);
                            }
                          }}
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
              <UserCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
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
                    <Badge className={subscription?.status === 'ativa' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-500'}>
                      {subscription?.status === 'ativa' ? 'Assinatura Ativa' : (subscription ? 'Inativa' : 'Sem Assinatura')}
                    </Badge>
                    <span className="text-sm text-muted-foreground capitalize">
                      Plano {subscription?.plan || 'N/A'}
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
                  {subscription ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 p-3 border-b flex items-center justify-between">
                        <span className="font-medium text-sm">Acesso Master (Premium)</span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {subscription.plan}
                        </Badge>
                      </div>
                      <div className="p-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Início do Acesso</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {format(new Date(subscription.startDate), "dd/MM/yyyy")}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Próxima Renovação</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-orange-500" />
                            {format(new Date(subscription.renewalDate), "dd/MM/yyyy")}
                          </div>
                        </div>
                        <div className="col-span-2 pt-2">
                          <p className="text-xs text-muted-foreground mb-2">Método de Pagamento</p>
                          <Badge variant="secondary" className="font-normal">
                            {subscription.paymentMethod}
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
