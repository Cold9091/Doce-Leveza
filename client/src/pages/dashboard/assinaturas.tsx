import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Pathology, User, Subscription, UserAccess } from "@shared/schema";
import { useState } from "react";
import { PaymentDialog } from "@/components/payment-dialog";
import { CheckCircle2, ShoppingCart } from "lucide-react";

export default function Assinaturas() {
  const [selectedProgram, setSelectedProgram] = useState<Pathology | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ["/api/subscriptions/user", user?.id],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const { data: userAccessList = [] } = useQuery<UserAccess[]>({
    queryKey: ["/api/user/access"],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });

  const { data: pathologies = [], isLoading } = useQuery<Pathology[]>({
    queryKey: ["/api/pathologies"],
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  });

  // Assinatura anual = acesso total a todos os programas
  const hasFullAccess = subscription?.status === "ativa";

  // Verifica se o utilizador tem acesso a um programa específico
  const hasProgramAccess = (pathologyId: number): boolean => {
    if (hasFullAccess) return true;
    return userAccessList.some(
      (a) =>
        a.pathologyId === pathologyId &&
        a.status === "ativo" &&
        new Date(a.expiryDate) > new Date()
    );
  };

  const handlePaymentClick = (program: Pathology) => {
    setSelectedProgram(program);
    setIsPaymentDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Assinaturas</h1>
          <p className="text-muted-foreground mt-2">Escolha um programa e faça o pagamento</p>
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
        <h1 className="text-3xl font-heading font-bold text-foreground">Assinaturas</h1>
        <p className="text-muted-foreground mt-2">Escolha um programa e faça o pagamento</p>
        {hasFullAccess && (
          <Badge className="mt-4 bg-green-100 text-green-800">
            Assinatura anual activa — acesso a todos os programas
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
          {pathologies.map((program) => {
            const alreadyOwned = hasProgramAccess(program.id);

            return (
              <Card
                key={program.id}
                className={`hover:shadow-lg transition-shadow overflow-hidden ${alreadyOwned ? "ring-2 ring-green-500/30" : ""}`}
                data-testid={`card-program-${program.id}`}
              >
                {program.imageUrl ? (
                  <div className="h-40 overflow-hidden bg-muted relative">
                    <img
                      src={program.imageUrl}
                      alt={program.title}
                      className="w-full h-full object-cover"
                    />
                    {alreadyOwned && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 text-white border-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Pago
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center relative">
                    <div className="text-4xl">{program.icon}</div>
                    {alreadyOwned && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 text-white border-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Pago
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="line-clamp-2">{program.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{program.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">
                      {program.price || 0}
                    </span>
                    <span className="text-muted-foreground text-sm">Kz</span>
                  </div>

                  <Button
                    onClick={() => !alreadyOwned && handlePaymentClick(program)}
                    className="w-full"
                    variant={alreadyOwned ? "outline" : "default"}
                    disabled={alreadyOwned}
                    data-testid={`button-buy-program-${program.id}`}
                  >
                    {alreadyOwned ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                        <span className="text-green-700">Já tem acesso</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Comprar por {program.price || 0} Kz
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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
