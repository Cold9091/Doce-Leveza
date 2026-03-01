import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { PaymentProof, Pathology, User } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface PaymentProofWithDetails extends PaymentProof {
  program?: Pathology;
  user?: User;
}

export default function AdminPayments() {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>("pendente");

  // Fetch payment proofs
  const { data: proofs = [], isLoading, refetch } = useQuery<PaymentProof[]>({
    queryKey: ["/api/admin/payments", selectedStatus],
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  // Fetch all pathologies for reference
  const { data: pathologies = [] } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      return await apiRequest("PUT", `/api/admin/payments/${paymentId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      refetch();
    },
    onError: (error) => {
      alert(`Erro ao aprovar: ${error}`);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      const notes = prompt("Motivo da rejeição:");
      if (!notes) return null;
      return await apiRequest("PUT", `/api/admin/payments/${paymentId}/reject`, { adminNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      refetch();
    },
    onError: (error) => {
      alert(`Erro ao rejeitar: ${error}`);
    },
  });

  const getProgram = (pathologyId: number) => {
    return pathologies.find((p) => p.id === pathologyId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "aprovado":
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando pagamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Gerenciar Pagamentos
        </h1>
        <p className="text-muted-foreground mt-2">
          Revise e aprove comprovantes de pagamento dos usuários
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={selectedStatus === "pendente" ? "default" : "outline"}
          onClick={() => setSelectedStatus("pendente")}
        >
          Pendentes ({proofs.filter((p) => p.status === "pendente").length})
        </Button>
        <Button
          variant={selectedStatus === "aprovado" ? "default" : "outline"}
          onClick={() => setSelectedStatus("aprovado")}
        >
          Aprovados ({proofs.filter((p) => p.status === "aprovado").length})
        </Button>
        <Button
          variant={selectedStatus === "rejeitado" ? "default" : "outline"}
          onClick={() => setSelectedStatus("rejeitado")}
        >
          Rejeitados ({proofs.filter((p) => p.status === "rejeitado").length})
        </Button>
      </div>

      {proofs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum pagamento encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Comprovantes de Pagamento</CardTitle>
            <CardDescription>
              {selectedStatus === "pendente"
                ? "Pagamentos aguardando aprovação"
                : `Pagamentos ${selectedStatus}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proofs.map((proof) => {
                    const program = getProgram(proof.pathologyId);
                    return (
                      <TableRow key={proof.id}>
                        <TableCell className="font-mono text-sm">{proof.id}</TableCell>
                        <TableCell className="font-medium">User #{proof.userId}</TableCell>
                        <TableCell>{program?.title || "Desconhecido"}</TableCell>
                        <TableCell className="font-bold">{proof.amount} Kz</TableCell>
                        <TableCell>{getStatusBadge(proof.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(proof.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="space-x-2">
                          {proof.status === "pendente" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => approveMutation.mutate(proof.id)}
                                disabled={approveMutation.isPending}
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Aprovar
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectMutation.mutate(proof.id)}
                                disabled={rejectMutation.isPending}
                              >
                                {rejectMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Rejeitar
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                          {proof.status === "aprovado" && (
                            <span className="text-xs text-green-600">
                              ✓ Aprovado em {new Date(proof.approvedAt || "").toLocaleDateString("pt-BR")}
                            </span>
                          )}
                          {proof.status === "rejeitado" && (
                            <div className="text-xs text-red-600 max-w-xs">
                              Motivo: {proof.adminNotes || "Sem detalhes"}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
