import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Pathology, User as UserType } from "@shared/schema";
import { useState } from "react";
import { PaymentDialog } from "@/components/payment-dialog";
import { CheckCircle2, Lock, ShoppingCart } from "lucide-react";

export type ProgramPlan = {
  id: number;
  pathologyId: number | null;
  name?: string;
  type: "mensal" | "trimestral" | "ilimitado";
  price: number;
  durationDays?: number;
  active?: number;
  whatsappUrl?: string | null;
  bonusContentUrl?: string | null;
};

const planLabel = (plan: ProgramPlan) =>
  plan.type === "trimestral" ? "Trimestral" : plan.type === "ilimitado" ? "Ilimitado" : "Mensal";

export default function Assinaturas() {
  const [selectedPlan, setSelectedPlan] = useState<ProgramPlan | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Pathology | null>(null);
  const { data: user } = useQuery<UserType>({ queryKey: ["/api/auth/me"] });
  const { data: pathologies = [], isLoading } = useQuery<Pathology[]>({ queryKey: ["/api/pathologies"] });
  const { data: plans = [] } = useQuery<ProgramPlan[]>({ queryKey: ["/api/plans"] });
  const { data: activePlan } = useQuery<ProgramPlan | null>({
    queryKey: ["/api/user/active-plan"],
    enabled: !!user?.id,
    refetchInterval: 30 * 1000,
  });

  const activeNonUnlimited = !!activePlan && activePlan.type !== "ilimitado";
  const activeProgramId = activePlan?.pathologyId;
  const selectablePlans = (programId: number) =>
    plans.filter((plan) => plan.pathologyId === programId && plan.active !== 0);
  const unlimitedPlans = plans.filter((plan) => plan.pathologyId === null && plan.active !== 0);

  const choosePlan = (program: Pathology, plan: ProgramPlan) => {
    setSelectedProgram(program);
    setSelectedPlan(plan);
  };

  if (isLoading) return <div className="space-y-6"><h1 className="text-3xl font-heading font-bold">Assinaturas</h1><div className="grid md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />)}</div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Assinaturas</h1>
        <p className="text-muted-foreground mt-2">Escolha um programa e o plano que melhor se adapta a si.</p>
        {activePlan?.type === "ilimitado" && <Badge className="mt-4 bg-green-100 text-green-800">Plano ilimitado activo — acesso a todos os programas</Badge>}
      </div>
      {unlimitedPlans.length > 0 && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader><CardTitle>Oferta de acesso ilimitado</CardTitle><CardDescription>Aceda a todos os programas sem restrições.</CardDescription></CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            {unlimitedPlans.map(plan => <Button key={plan.id} onClick={() => choosePlan({ id: 0, title: "Acesso ilimitado" } as Pathology, plan)} disabled={activePlan?.type === "ilimitado"}><ShoppingCart className="mr-2 h-4 w-4" />{planLabel(plan)} — {plan.price.toLocaleString()} Kz</Button>)}
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pathologies.map(program => {
          const locked = activeNonUnlimited && activeProgramId !== program.id;
          const isCurrent = activeProgramId === program.id || activePlan?.type === "ilimitado";
          const programPlans = selectablePlans(program.id);
          return <Card key={program.id} className={`overflow-hidden ${locked ? "opacity-60" : ""}`} data-testid={`card-program-${program.id}`}>
            {program.imageUrl && <img src={program.imageUrl} alt={program.title} className="h-40 w-full object-cover" />}
            <CardHeader><CardTitle>{program.title}</CardTitle><CardDescription>{program.description}</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {isCurrent ? <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" />Plano activo</Badge> : locked ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Lock className="h-4 w-4" />Disponível apenas após término do seu plano actual</div> : programPlans.length ? programPlans.map(plan =>
                <Button key={plan.id} className="w-full justify-between" variant={plan.type === "trimestral" ? "outline" : "default"} onClick={() => choosePlan(program, plan)} data-testid={`button-buy-plan-${plan.id}`}>
                  <span>{planLabel(plan)}</span><span>{plan.price.toLocaleString()} Kz</span>
                </Button>) : <p className="text-sm text-muted-foreground">Nenhum plano disponível.</p>}
            </CardContent>
          </Card>;
        })}
      </div>
      {selectedProgram && selectedPlan && <PaymentDialog program={selectedProgram} plan={selectedPlan} isOpen={!!selectedPlan} onOpenChange={(open) => { if (!open) setSelectedPlan(null); }} />}
    </div>
  );
}