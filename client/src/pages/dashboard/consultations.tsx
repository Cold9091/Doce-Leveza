import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus, Sparkles, Video, Phone, AlertTriangle, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Consultation, User as UserType } from "@shared/schema";

const scheduleFormSchema = z.object({
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
  notes: z.string().min(5, "A descrição (motivo) da consulta é obrigatória"),
});

const rescheduleFormSchema = z.object({
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
});

type ScheduleFormData = z.infer<typeof scheduleFormSchema>;
type RescheduleFormData = z.infer<typeof rescheduleFormSchema>;

const professionals = [
  { name: "Dr. Doce Leveza", specialty: "Equipe de Saúde", avatar: "DL" },
];

const availableTimes = [
  "08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"
];

export default function Consultations() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [rescheduleConsultation, setRescheduleConsultation] = useState<Consultation | null>(null);
  const { toast } = useToast();

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const userId = user?.id || 1;

  const { data: consultations = [], isLoading } = useQuery<Consultation[]>({
    queryKey: ["/api/consultations/user", userId],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: { date: "", time: "", notes: "" },
  });

  const rescheduleForm = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleFormSchema),
    defaultValues: { date: "", time: "" },
  });

  const today = new Date().toISOString().split('T')[0];

  const scheduleMutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      const datetime = `${data.date}T${data.time}:00`;
      return apiRequest("POST", "/api/consultations", { userId, datetime, status: "agendada", notes: data.notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations/user", userId] });
      toast({ title: "Consulta Agendada", description: "Sua consulta foi agendada com sucesso!" });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível agendar a consulta. Tente novamente.", variant: "destructive" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/consultations/${id}`, { status: "cancelada" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations/user", userId] });
      toast({ title: "Consulta Cancelada", description: "A sua consulta foi cancelada." });
      setCancelId(null);
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível cancelar a consulta.", variant: "destructive" });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RescheduleFormData }) => {
      const datetime = `${data.date}T${data.time}:00`;
      return apiRequest("PATCH", `/api/consultations/${id}`, { datetime, status: "agendada" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations/user", userId] });
      toast({ title: "Consulta Reagendada", description: "A sua consulta foi reagendada com sucesso!" });
      setRescheduleConsultation(null);
      rescheduleForm.reset();
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível reagendar a consulta.", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      agendada: { label: "Agendada", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
      concluida: { label: "Concluída", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
      cancelada: { label: "Cancelada", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
    };
    const c = config[status] || config.agendada;
    return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
  };

  const formatDate = (datetime: string) =>
    new Date(datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const formatTime = (datetime: string) =>
    new Date(datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const upcomingConsultations = consultations.filter(c => c.status === "agendada");
  const pastConsultations = consultations.filter(c => c.status !== "agendada");

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/90 via-orange-500 to-orange-600/90 p-6 sm:p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Consultas Online</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2" data-testid="heading-consultations">
              Minhas Consultas
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-md">
              Agende consultas com nossos especialistas e acompanhe sua jornada de saúde
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-white text-orange-600 hover:bg-white/90 shadow-lg" data-testid="button-schedule-consultation">
                <Plus className="mr-2 h-4 w-4" />
                Agendar Consulta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle>Agendar Nova Consulta</DialogTitle>
                    <DialogDescription>Escolha um profissional e horário disponível</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => scheduleMutation.mutate(d))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="date" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input type="date" min={today} {...field} data-testid="input-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="time" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-time"><SelectValue placeholder="Horário" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableTimes.map((t) => (
                              <SelectItem key={t} value={t} data-testid={`option-time-${t}`}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição / Motivo da Consulta</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva detalhadamente o motivo da sua consulta."
                          className="min-h-[120px] resize-none"
                          {...field}
                          data-testid="input-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-schedule">Cancelar</Button>
                    <Button type="submit" disabled={scheduleMutation.isPending} data-testid="button-confirm-schedule">
                      {scheduleMutation.isPending ? "Agendando..." : "Confirmar Agendamento"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingConsultations.length}</p>
              <p className="text-sm text-muted-foreground">Agendadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pastConsultations.filter(c => c.status === "concluida").length}</p>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{professionals.length}</p>
              <p className="text-sm text-muted-foreground">Especialistas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultation list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse bg-muted rounded-xl" />
          ))}
        </div>
      ) : consultations.length > 0 ? (
        <div className="space-y-6">
          {upcomingConsultations.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Próximas Consultas
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {upcomingConsultations.map((consultation) => (
                  <Card key={consultation.id} className="hover-elevate overflow-hidden" data-testid={`card-consultation-${consultation.id}`}>
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20">
                            DL
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-lg">Consulta de Saúde</CardTitle>
                              {getStatusBadge(consultation.status)}
                            </div>
                            <CardDescription className="mt-1">Atendimento Equipe Doce Leveza</CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-1 sm:text-right">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(consultation.datetime)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {formatTime(consultation.datetime)}
                          </div>
                        </div>
                      </div>
                      {consultation.notes && (
                        <p className="text-sm text-muted-foreground mt-4 p-3 rounded-lg bg-muted/50">
                          {consultation.notes}
                        </p>
                      )}
                      <div className="flex gap-3 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            rescheduleForm.reset({ date: "", time: "" });
                            setRescheduleConsultation(consultation);
                          }}
                          data-testid={`button-reschedule-${consultation.id}`}
                        >
                          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                          Reagendar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                          onClick={() => setCancelId(consultation.id)}
                          data-testid={`button-cancel-${consultation.id}`}
                        >
                          <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {pastConsultations.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                Histórico
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {pastConsultations.map((consultation) => (
                  <Card key={consultation.id} className="opacity-75 hover:opacity-100 transition-opacity" data-testid={`card-consultation-${consultation.id}`}>
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">DL</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-base">Consulta de Saúde</CardTitle>
                              {getStatusBadge(consultation.status)}
                            </div>
                            <CardDescription className="text-sm">Atendimento Equipe Doce Leveza</CardDescription>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{formatDate(consultation.datetime)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma consulta agendada</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto" data-testid="text-no-consultations">
              Agende sua primeira consulta com um de nossos especialistas e comece sua jornada de saúde.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cancel confirmation dialog */}
      <AlertDialog open={cancelId !== null} onOpenChange={(open) => !open && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Consulta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter Consulta</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => cancelId !== null && cancelMutation.mutate(cancelId)}
            >
              {cancelMutation.isPending ? "Cancelando..." : "Sim, Cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule dialog */}
      <Dialog open={rescheduleConsultation !== null} onOpenChange={(open) => !open && setRescheduleConsultation(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <RotateCcw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Reagendar Consulta</DialogTitle>
                <DialogDescription>Escolha nova data e horário</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <Form {...rescheduleForm}>
            <form
              onSubmit={rescheduleForm.handleSubmit((d) =>
                rescheduleConsultation && rescheduleMutation.mutate({ id: rescheduleConsultation.id, data: d })
              )}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField control={rescheduleForm.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Data</FormLabel>
                    <FormControl>
                      <Input type="date" min={today} {...field} data-testid="input-reschedule-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={rescheduleForm.control} name="time" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Novo Horário</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-reschedule-time"><SelectValue placeholder="Horário" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTimes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setRescheduleConsultation(null)}>Cancelar</Button>
                <Button type="submit" disabled={rescheduleMutation.isPending}>
                  {rescheduleMutation.isPending ? "Reagendando..." : "Confirmar Reagendamento"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
