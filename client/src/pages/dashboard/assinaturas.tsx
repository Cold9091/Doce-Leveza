import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Pathology, User, Subscription } from "@shared/schema";
import { useState } from "react";
import { PaymentDialog } from "@/components/payment-dialog";
import { Lock } from "lucide-react";

export default function Assinaturas() {
  const [selectedProgram, setSelectedProgram] = useState<Pathology | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Fetch user data to check access
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  // Fetch user subscription to check active status
  const { data: subscription } = useQuery<Subscription>({
    queryKey: ["/api/subscriptions/user", user?.id],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  // Fetch all pathologies
  const { data: pathologies = [], isLoading } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  });

  const hasActiveSubscription = subscription?.status === "ativa" || subscription?.status === "por_programa";

  const handlePaymentClick = (program: Pathology) => {
    setSelectedProgram(program);
    setIsPaymentDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Assinaturas
          </h1>
          <p className="text-muted-foreground mt-2">
            Escolha um programa e faça o pagamento
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Assinaturas
        </h1>
        <p className="text-muted-foreground mt-2">
          Escolha um programa e faça o pagamento
        </p>
        {hasActiveSubscription && (
          <Badge className="mt-4 bg-green-100 text-green-800">
            Sua assinatura está ativa
          </Badge>
        )}
      </div>

      {pathologies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum programa disponível no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pathologies.map((program) => (
            <Card key={program.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {program.imageUrl ? (
                <div className="h-40 overflow-hidden bg-muted">
                  <img
                    src={program.imageUrl}
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <div className="text-4xl">{program.icon}</div>
                </div>
              )}

              <CardHeader>
                <CardTitle className="line-clamp-2">{program.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {program.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">
                    {program.price || 0}
                  </span>
                  <span className="text-muted-foreground text-sm">Kz</span>
                </div>

                <Button
                  onClick={() => handlePaymentClick(program)}
                  className="w-full"
                  disabled={hasActiveSubscription}
                >
                  {hasActiveSubscription ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Já tem acesso
                    </>
                  ) : (
                    `Comprar por ${program.price || 0} Kz`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedProgram && (
        <PaymentDialog
          program={selectedProgram}
          isOpen={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
        />
      )}
    </div>
  );
}
