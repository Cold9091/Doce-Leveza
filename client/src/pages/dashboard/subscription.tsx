import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Subscription() {
  const currentPlan = {
    name: "Anual",
    status: "ativa",
    startDate: "20 Nov 2024",
    renewalDate: "20 Nov 2025",
    paymentMethod: "Cartão de Crédito •••• 4242",
  };

  const benefits = [
    "Acesso ilimitado a todos os vídeos",
    "Biblioteca completa de ebooks",
    "2 consultas mensais com nutricionistas",
    "Conteúdo exclusivo por patologia",
    "Suporte prioritário",
    "Atualizações semanais de conteúdo",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-subscription">
          Minha Assinatura
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seu plano e métodos de pagamento
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Plano {currentPlan.name}</CardTitle>
                <CardDescription>Sua assinatura está ativa</CardDescription>
              </div>
              <Badge variant="default" className="h-fit" data-testid="badge-status">
                {currentPlan.status === "ativa" ? "Ativa" : "Inativa"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Data de Início
                </div>
                <p className="font-medium" data-testid="text-start-date">{currentPlan.startDate}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Próxima Renovação
                </div>
                <p className="font-medium" data-testid="text-renewal-date">{currentPlan.renewalDate}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Método de Pagamento
              </div>
              <p className="font-medium" data-testid="text-payment-method">{currentPlan.paymentMethod}</p>
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
                <li key={idx} className="flex items-start gap-3" data-testid={`benefit-${idx}`}>
                  <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>Seus últimos pagamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "20 Nov 2024", amount: "49.900 AOA", status: "Pago" },
            ].map((payment, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-3 border-b last:border-0"
                data-testid={`payment-${idx}`}
              >
                <div>
                  <p className="font-medium">{payment.date}</p>
                  <p className="text-sm text-muted-foreground">Assinatura Anual</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{payment.amount}</p>
                  <Badge variant="secondary" className="mt-1">
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
