import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Lead } from "@shared/schema";
import { Mail, Trash2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLeads() {
  const { toast } = useToast();

  const { data: leads, isLoading } = useQuery<(Lead & { id: string })[]>({
    queryKey: ["/api/leads"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/admin/leads/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Sucesso",
        description: "Lead removido com sucesso",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-admin-leads">
          Gerenciar Leads
        </h1>
        <p className="text-muted-foreground mt-2">
          Leads capturados através dos formulários de contato
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm text-muted-foreground">
            Total de {leads?.length || 0} leads capturados
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : leads && leads.length > 0 ? (
            <div className="space-y-3">
              {leads.map((lead) => (
                <Card key={lead.id} data-testid={`card-lead-${lead.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{lead.name}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteMutation.mutate(lead.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-lead-${lead.id}`}
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
              <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum lead capturado ainda
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
