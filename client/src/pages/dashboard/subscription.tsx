import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import type { Subscription as SubscriptionType, User as UserType } from "@shared/schema";

export default function Subscription() {
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const { data: subscription, isLoading } = useQuery<SubscriptionType>({
  queryKey: ["/api/subscriptions/user", user?.id],
  enabled: !!user?.id,
  staleTime: 1000 * 60 * 2,
  gcTime: 1000 * 60 * 10,
});

  const currentPlan = subscription || {
    name: "Sem Plano",
    status: "inativa",
    startDate: "-",
    renewalDate: "-",
    paymentMethod: "-",
  };

  const benefits = [
    "Acesso ilimitado a todos os vídeos",
    "Biblioteca completa de ebooks",
    "2 consultas mensais com nutricionistas",
    "Conteúdo exclusivo por programa",
    "Suporte prioritário",
    "Atualizações semanais de conteúdo",
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            Minha Assinatura
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Gerencie seu plano e métodos de pagamento
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sem Assinatura Ativa</h2>
            <p className="text-muted-foreground">Você ainda não possui nenhuma assinatura ativa.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          Minha Assinatura
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Gerencie seu plano e métodos de pagamento
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentPlan.plan || currentPlan.name}</CardTitle>
                  <CardDescription>
                    Próxima renovação:{" "}
                    {currentPlan?.renewalDate
                      ? new Date(currentPlan.renewalDate).toLocaleDateString("pt-BR")
                      : "-"}
                  </CardDescription>
                </div>
                {currentPlan.status === "ativa" && (
                  <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                )}
                {currentPlan.status === "inativa" && (
                  <Badge variant="secondary">Inativa</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Data de Início
                </div>
                <p className="font-medium">
                  {currentPlan?.startDate
                    ? new Date(currentPlan.startDate).toLocaleDateString("pt-BR")
                    : "-"}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  Método de Pagamento
                </div>
                <p className="font-medium" data-testid="text-payment-method">
                  {currentPlan?.paymentMethod || "-"}
                </p>
                <Button variant="outline" size="sm" data-testid="button-update-payment">
                  Atualizar Método de Pagamento
                </Button>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button variant="outline" data-testid="button-change-plan">
                  Mudar Plano
                </Button>
                <Button variant="destructive" data-testid="button-cancel-subscription">
                  Cancelar Assinatura
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Benefícios Inclusos</CardTitle>
              <CardDescription>
                O que você tem acesso com seu plano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {benefits.map((benefit, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3"
                    data-testid={`benefit-${idx}`}
                  >
                    <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
