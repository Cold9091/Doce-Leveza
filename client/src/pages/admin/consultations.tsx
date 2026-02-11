import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Consultation, User } from "@shared/schema";
import { Calendar, Trash2, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminConsultations() {
  const { toast } = useToast();

  const { data: consultations, isLoading } = useQuery<Consultation[]>({
    queryKey: ["/api/admin/consultations"],
  });

  const { data: users } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/admin/users"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/consultations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations"] });
      toast({
        title: "Sucesso",
        description: "Consulta removida com sucesso",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      agendada: "default",
      concluida: "secondary",
      cancelada: "destructive",
    };
    const labels: Record<string, string> = {
      agendada: "Agendada",
      concluida: "Concluída",
      cancelada: "Cancelada",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-admin-consultations">
          Gerenciar Consultas
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualize e gerencie todas as consultas agendadas
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm text-muted-foreground">
            Total de {consultations?.length || 0} consultas
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : consultations && consultations.length > 0 ? (
            <div className="space-y-3">
              {consultations.map((consultation) => (
                <Card key={consultation.id} data-testid={`card-consultation-${consultation.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {users?.find((u) => u.id === consultation.userId)?.name || `Usuário #${consultation.userId}`}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Status: {consultation.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(consultation.datetime).toLocaleString('pt-BR')}
                          </div>
                          {getStatusBadge(consultation.status)}
                        </div>
                        {consultation.notes && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {consultation.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteMutation.mutate(consultation.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-consultation-${consultation.id}`}
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
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma consulta cadastrada
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
