import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import type { Consultation } from "@shared/schema";

const scheduleFormSchema = z.object({
  professionalName: z.string().min(1, "Selecione um profissional"),
  professionalSpecialty: z.string().min(1, "Especialidade é obrigatória"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
  notes: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

const professionals = [
  { name: "Dra. Camila Monteiro", specialty: "Nutricionista Clínica" },
  { name: "Dra. Ana Costa", specialty: "Nutricionista Funcional" },
  { name: "Dr. Ricardo Santos", specialty: "Nutricionista Esportivo" },
  { name: "Dra. Fernanda Lima", specialty: "Nutricionista Comportamental" },
];

const availableTimes = [
  "08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"
];

export default function Consultations() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const userId = 1;

  const { data: consultations = [], isLoading } = useQuery<Consultation[]>({
    queryKey: ["/api/consultations/user", userId],
  });

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      professionalName: "",
      professionalSpecialty: "",
      date: "",
      time: "",
      notes: "",
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      const datetime = `${data.date}T${data.time}:00`;
      const response = await apiRequest("/api/consultations", {
        method: "POST",
        body: JSON.stringify({
          userId,
          professionalName: data.professionalName,
          professionalSpecialty: data.professionalSpecialty,
          datetime,
          status: "agendada",
          notes: data.notes || "",
        }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations/user", userId] });
      toast({
        title: "Consulta Agendada",
        description: "Sua consulta foi agendada com sucesso!",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível agendar a consulta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScheduleFormData) => {
    scheduleMutation.mutate(data);
  };

  const handleProfessionalChange = (name: string) => {
    const professional = professionals.find(p => p.name === name);
    if (professional) {
      form.setValue("professionalName", professional.name, { shouldValidate: true, shouldDirty: true });
      form.setValue("professionalSpecialty", professional.specialty, { shouldValidate: true, shouldDirty: true });
    }
  };

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

  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const today = new Date().toISOString().split('T')[0];

  const ScheduleDialog = () => (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto text-xs sm:text-sm" data-testid="button-schedule-consultation">
          <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Agendar Consulta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agendar Nova Consulta</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para agendar sua consulta com um de nossos profissionais.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="professionalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissional</FormLabel>
                  <Select onValueChange={handleProfessionalChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-professional">
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionals.map((prof) => (
                        <SelectItem key={prof.name} value={prof.name} data-testid={`option-professional-${prof.name.replace(/\s/g, '-')}`}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{prof.name}</span>
                            <span className="text-xs text-muted-foreground">{prof.specialty}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="professionalSpecialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled 
                      placeholder="A especialidade será preenchida automaticamente"
                      data-testid="input-specialty"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        min={today}
                        {...field} 
                        data-testid="input-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-time">
                          <SelectValue placeholder="Horário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time} data-testid={`option-time-${time}`}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o motivo da consulta ou informações relevantes..."
                      className="resize-none"
                      {...field}
                      data-testid="input-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                data-testid="button-cancel-schedule"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={scheduleMutation.isPending}
                data-testid="button-confirm-schedule"
              >
                {scheduleMutation.isPending ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground" data-testid="heading-consultations">
            Minhas Consultas
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Gerencie suas consultas com nossos profissionais
          </p>
        </div>
        <ScheduleDialog />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse bg-muted rounded-md" />
          ))}
        </div>
      ) : consultations.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {consultations.map((consultation) => (
            <Card key={consultation.id} data-testid={`card-consultation-${consultation.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{consultation.professionalName}</CardTitle>
                      <CardDescription>{consultation.professionalSpecialty}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(consultation.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(consultation.datetime)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatTime(consultation.datetime)}
                  </div>
                </div>
                {consultation.notes && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {consultation.notes}
                  </p>
                )}
                {consultation.status === "agendada" && (
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" size="sm" data-testid={`button-reschedule-${consultation.id}`}>
                      Reagendar
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-cancel-${consultation.id}`}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Você não tem consultas agendadas.
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-schedule-first-consultation">
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Primeira Consulta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Agendar Nova Consulta</DialogTitle>
                  <DialogDescription>
                    Preencha os dados abaixo para agendar sua consulta com um de nossos profissionais.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="professionalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profissional</FormLabel>
                          <Select onValueChange={handleProfessionalChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-professional-empty">
                                <SelectValue placeholder="Selecione um profissional" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {professionals.map((prof) => (
                                <SelectItem key={prof.name} value={prof.name}>
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">{prof.name}</span>
                                    <span className="text-xs text-muted-foreground">{prof.specialty}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="professionalSpecialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidade</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled 
                              placeholder="A especialidade será preenchida automaticamente"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                min={today}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Horário" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableTimes.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações (opcional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva o motivo da consulta ou informações relevantes..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={scheduleMutation.isPending}
                      >
                        {scheduleMutation.isPending ? "Agendando..." : "Confirmar Agendamento"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
