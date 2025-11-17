import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type Lead } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

interface LeadCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadCaptureDialog({
  open,
  onOpenChange,
}: LeadCaptureDialogProps) {
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);

  const form = useForm<Lead>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: Lead) => {
      return await apiRequest("POST", "/api/leads", data);
    },
    onSuccess: () => {
      setSuccess(true);
      toast({
        title: "Inscrição realizada!",
        description: "Em breve entraremos em contato com você.",
      });
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        form.reset();
      }, 3000);
    },
    onError: () => {
      toast({
        title: "Erro ao enviar",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Lead) => {
    createLeadMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-lead-capture">
        {!success ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading font-bold text-center">
                Comece Sua Transformação Agora!
              </DialogTitle>
              <DialogDescription className="text-center">
                Preencha seus dados abaixo e garanta seu acesso ao{" "}
                <span className="text-accent font-bold">DOCE LEVEZA</span>
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 mt-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu nome"
                          {...field}
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail*</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(00) 00000-0000"
                          {...field}
                          data-testid="input-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-lg py-6 uppercase"
                  disabled={createLeadMutation.isPending}
                  data-testid="button-submit-lead"
                >
                  {createLeadMutation.isPending
                    ? "Enviando..."
                    : "Quero começar agora"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Ao se inscrever, você concorda em receber comunicações sobre o
                  DOCE LEVEZA
                </p>
              </form>
            </Form>
          </>
        ) : (
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-accent" />
            </div>
            <DialogTitle className="text-2xl font-heading font-bold">
              Inscrição Confirmada!
            </DialogTitle>
            <DialogDescription className="text-base">
              Obrigado por se inscrever no DOCE LEVEZA!
              <br />
              Em breve você receberá um e-mail com todos os detalhes.
            </DialogDescription>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
