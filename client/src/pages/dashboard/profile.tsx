import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Package, 
  ChevronRight,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Pathology, Subscription } from "@shared/schema";
import { Link } from "wouter";

export default function Profile() {
  const { data: pathologies } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
  });

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ["/api/subscriptions/user/1"], // Hardcoded for demo
  });

  const user = {
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "+244 912 345 678",
    address: "Rua das Flores, 123, Luanda",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9ce29b2933?w=400",
  };

  const otherPrograms = pathologies?.filter(p => p.id !== 1) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            Meu Perfil
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie suas informações, assinaturas e novos programas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription>Membro desde Nov 2024</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{user.address}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" data-testid="button-edit-profile">
              Editar Perfil
            </Button>
          </CardContent>
        </Card>

        {/* Subscription & Programs Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Subscription */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Assinatura Ativa</CardTitle>
                </div>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">Ativa</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Plano Atual</p>
                  <p className="text-lg font-bold">Plano Anual - Reeducação Alimentar</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Próxima renovação: 20 Nov 2025</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/dashboard/assinatura">
                    <Button variant="secondary" size="sm" className="hover-elevate">
                      Gerenciar Plano
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Programs to Unlock */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Desbloquear Outros Programas</CardTitle>
              </div>
              <CardDescription>Expanda seu conhecimento com outros programas especializados</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherPrograms.map((program) => (
                <div 
                  key={program.id}
                  className="group relative p-4 rounded-xl border bg-card hover:bg-accent/5 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm leading-tight pr-8">{program.title}</h3>
                    <Badge variant="outline" className="text-primary border-primary/20">
                      {program.price?.toLocaleString()} AOA
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                    {program.description}
                  </p>
                  <Button variant="outline" size="sm" className="w-full text-xs font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                    Desbloquear Agora
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
