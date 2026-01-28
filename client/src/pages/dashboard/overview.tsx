import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, BookOpen, Calendar, Video, ArrowRight, Sparkles, TrendingUp, Clock, User, Lock, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Pathology, Ebook, Consultation, Subscription } from "@shared/schema";

export default function Overview() {
  const { data: pathologies } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });

  const { data: ebooks } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks"],
  });

  const userId = 1;
  const { data: consultations } = useQuery<Consultation[]>({
    queryKey: ["/api/consultations/user", userId],
  });

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ["/api/subscriptions/user", userId],
  });

  const upcomingConsultations = consultations?.filter(c => c.status === "agendada") || [];

  // Logic for active program info
  const activeSubscription = subscription?.status === "ativa";
  const firstPathology = pathologies?.[0];

  const stats = [
    {
      title: "Programas",
      value: pathologies?.length || 0,
      subtitle: "disponíveis para estudo",
      icon: Activity,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/5",
      testId: "stat-programs",
    },
    {
      title: "Vídeos Assistidos",
      value: 12,
      subtitle: "de 24 totais",
      icon: Video,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-500/10 to-emerald-600/5",
      testId: "stat-videos",
    },
    {
      title: "Ebooks",
      value: ebooks?.length || 0,
      subtitle: "na sua biblioteca",
      icon: BookOpen,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/5",
      testId: "stat-ebooks",
    },
    {
      title: "Consultas",
      value: upcomingConsultations.length,
      subtitle: "agendadas",
      icon: Calendar,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-500/10 to-orange-500/5",
      testId: "stat-consultations",
    },
  ];

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-6 sm:p-8 text-primary-foreground">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5" />
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Área de Membros
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mb-2" data-testid="heading-overview">
            Olá, seja bem-vindo!
          </h1>
          <p className="text-sm sm:text-base text-primary-foreground/80 max-w-xl mb-6">
            Continue sua jornada de transformação com nosso conteúdo exclusivo. 
            Acompanhe seu progresso e evolua a cada dia.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/programas">
              <Button variant="secondary" className="bg-white text-primary hover:bg-white/90" data-testid="button-explore-content">
                Explorar Conteúdo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/consultas">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm" data-testid="button-schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Consulta
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Subscription Status Bar */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${activeSubscription ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
              {activeSubscription ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Lock className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {activeSubscription 
                  ? "Assinatura Ativa - Acesso Completo" 
                  : "Acesso Limitado - Primeiro Programa Liberado"}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeSubscription 
                  ? "Você tem acesso a todos os programas e biblioteca." 
                  : `Programa atual: ${firstPathology?.title || 'Carregando...'}`}
              </p>
            </div>
          </div>
          {!activeSubscription && (
            <Link href="/dashboard/programas">
              <Button size="sm" className="w-full sm:w-auto">
                Ver outros programas
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className={`relative overflow-hidden hover-elevate transition-all bg-gradient-to-br ${stat.bgGradient}`}
            data-testid={stat.testId}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-foreground/80">
                {stat.title}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.subtitle}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Seu Progresso</span>
          <span className="text-sm text-muted-foreground">50% completo</span>
        </div>
        <Progress value={50} className="h-2" />
        <p className="text-xs text-muted-foreground">12 de 24 vídeos assistidos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Video className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-base sm:text-lg">Continue Assistindo</CardTitle>
            </div>
            <Link href="/dashboard/programas">
              <Button variant="ghost" size="sm" className="text-xs">
                Ver todos
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Introdução à Nutrição Funcional", progress: 75, duration: "15:00" },
              { title: "Alimentação e Metabolismo", progress: 30, duration: "22:30" },
            ].map((video, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="relative h-12 w-20 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted-foreground/20">
                    <div 
                      className="h-full bg-emerald-500" 
                      style={{ width: `${video.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{video.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{video.duration}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {video.progress}% concluído
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {pathologies?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Seus vídeos recentes aparecerão aqui
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-base sm:text-lg">Próximas Consultas</CardTitle>
            </div>
            <Link href="/dashboard/consultas">
              <Button variant="ghost" size="sm" className="text-xs">
                Ver todas
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingConsultations.length > 0 ? (
              upcomingConsultations.slice(0, 2).map((consultation) => {
                const { date, time } = formatDateTime(consultation.datetime);
                return (
                  <div 
                    key={consultation.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{consultation.professionalName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {consultation.professionalSpecialty}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{date}</p>
                      <p className="text-xs text-muted-foreground">{time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  Nenhuma consulta agendada
                </p>
                <Link href="/dashboard/consultas">
                  <Button size="sm" data-testid="button-schedule-consultation-overview">
                    Agendar Consulta
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="hover-elevate transition-all">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-base sm:text-lg">Biblioteca de Ebooks</CardTitle>
          </div>
          <Link href="/dashboard/biblioteca">
            <Button variant="ghost" size="sm" className="text-xs">
              Ver biblioteca
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {ebooks && ebooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {ebooks.slice(0, 4).map((ebook) => (
                <div 
                  key={ebook.id}
                  className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-muted cursor-pointer"
                >
                  <img
                    src={ebook.coverUrl}
                    alt={ebook.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white text-xs font-medium line-clamp-2">
                      {ebook.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Seus ebooks aparecerão aqui
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
