import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Consultation, User } from "@shared/schema";
import { Calendar, Trash2, User as UserIcon, CheckCircle2, XCircle, Clock } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdminConsultations() {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: consultations, isLoading } = useQuery<Consultation[]>({
    queryKey: ["/api/admin/consultations"],
  });

  const { data: users } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PUT", `/api/admin/consultations/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations"] });
      toast({ title: "Status actualizado", description: "O status da consulta foi actualizado." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível actualizar o status.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/consultations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations"] });
      toast({ title: "Sucesso", description: "Consulta removida com sucesso." });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível remover a consulta.", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      agendada:  { label: "Agendada",  className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
      concluida: { label: "Concluída", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      cancelada: { label: "Cancelada", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    };
    const c = config[status] || config.agendada;
    return <Badge className={`border-0 ${c.className}`}>{c.label}</Badge>;
  };

  const agendadas = consultations?.filter(c => c.status === "agendada") ?? [];
  const outras = consultations?.filter(c => c.status !== "agendada") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-admin-consultations">
          Gerenciar Consultas
        </h1>
        <p className="text-muted-foreground mt-2">Visualize e gerencie todas as consultas agendadas</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Agendadas", count: agendadas.length, icon: Clock, color: "text-emerald-600" },
          { label: "Total", count: consultations?.length ?? 0, icon: Calendar, color: "text-primary" },
          { label: "Concluídas", count: consultations?.filter(c => c.status === "concluida").length ?? 0, icon: CheckCircle2, color: "text-blue-600" },
        ].map(({ label, count, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm text-muted-foreground font-medium">
            Total de {consultations?.length ?? 0} consultas
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
              {/* Pending first */}
              {agendadas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Aguardando Acção
                  </p>
                  {agendadas.map((consultation) => (
                    <ConsultationRow
                      key={consultation.id}
                      consultation={consultation}
                      user={users?.find(u => u.id === consultation.userId)}
                      onStatusChange={(status) => updateStatusMutation.mutate({ id: consultation.id, status })}
                      onDelete={() => setDeleteId(consultation.id)}
                      isPending={updateStatusMutation.isPending}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              )}
              {/* Others */}
              {outras.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Histórico
                  </p>
                  {outras.map((consultation) => (
                    <ConsultationRow
                      key={consultation.id}
                      consultation={consultation}
                      user={users?.find(u => u.id === consultation.userId)}
                      onStatusChange={(status) => updateStatusMutation.mutate({ id: consultation.id, status })}
                      onDelete={() => setDeleteId(consultation.id)}
                      isPending={updateStatusMutation.isPending}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma consulta cadastrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Consulta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja remover esta consulta permanentemente? Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
            >
              {deleteMutation.isPending ? "Removendo..." : "Sim, Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function buildWhatsAppLink(phone: string | null | undefined, userName: string, datetime: string): string | null {
  if (!phone) return null;

  // Normalise Angola phone number → +244XXXXXXXXX
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("244")) {
    // already has country code
  } else if (digits.startsWith("0")) {
    digits = "244" + digits.slice(1);
  } else {
    digits = "244" + digits;
  }

  const date = new Date(datetime);
  const dateStr = date.toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });

  const message =
    `Olá ${userName}! 👋\n\n` +
    `A sua consulta com a equipa *Doce Leveza* está marcada para:\n` +
    `📅 *${dateStr}* às *${timeStr}*\n\n` +
    `Pedimos que chegue com alguns minutos de antecedência.\n` +
    `Caso precise reagendar, entre em contacto connosco.\n\n` +
    `Equipa Doce Leveza 💚`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function ConsultationRow({
  consultation,
  user,
  onStatusChange,
  onDelete,
  isPending,
  getStatusBadge,
}: {
  consultation: Consultation;
  user?: Omit<User, "password">;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
  isPending: boolean;
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  const formatDateTime = (dt: string) =>
    new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const whatsappLink = buildWhatsAppLink(user?.phone, user?.name || "Aluno", consultation.datetime);

  return (
    <Card data-testid={`card-consultation-${consultation.id}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-sm">
                  {user?.name || `Utilizador #${consultation.userId}`}
                </h3>
                {getStatusBadge(consultation.status)}
              </div>
              {user?.phone && (
                <p className="text-xs text-muted-foreground mb-1">{user.phone}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDateTime(consultation.datetime)}
              </div>
              {consultation.notes && (
                <p className="text-xs mt-2 text-muted-foreground bg-muted/50 rounded p-2 line-clamp-2">
                  {consultation.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs h-8"
                  data-testid={`button-whatsapp-consultation-${consultation.id}`}
                >
                  <SiWhatsapp className="mr-1 h-3 w-3" />
                  Notificar
                </Button>
              </a>
            )}
            {consultation.status === "agendada" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs h-8"
                  onClick={() => onStatusChange("concluida")}
                  disabled={isPending}
                  data-testid={`button-complete-consultation-${consultation.id}`}
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Concluir
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs h-8"
                  onClick={() => onStatusChange("cancelada")}
                  disabled={isPending}
                  data-testid={`button-cancel-consultation-admin-${consultation.id}`}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Cancelar
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              data-testid={`button-delete-consultation-${consultation.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
