import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Plus } from "lucide-react";

export default function Consultations() {
  const consultations = [
    {
      id: 1,
      professional: "Dra. Camila Monteiro",
      specialty: "Nutricionista Clínica",
      date: "25 Nov 2024",
      time: "14:00",
      status: "agendada" as const,
    },
    {
      id: 2,
      professional: "Dra. Ana Costa",
      specialty: "Nutricionista Funcional",
      date: "28 Nov 2024",
      time: "10:30",
      status: "agendada" as const,
    },
  ];

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
        <Button className="w-full sm:w-auto text-xs sm:text-sm" data-testid="button-schedule-consultation">
          <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Agendar Consulta
        </Button>
      </div>

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
                    <CardTitle className="text-lg">{consultation.professional}</CardTitle>
                    <CardDescription>{consultation.specialty}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(consultation.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {consultation.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {consultation.time}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" size="sm">
                  Reagendar
                </Button>
                <Button variant="outline" size="sm">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {consultations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Você não tem consultas agendadas.
            </p>
            <Button data-testid="button-schedule-first-consultation">
              <Plus className="mr-2 h-4 w-4" />
              Agendar Primeira Consulta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
