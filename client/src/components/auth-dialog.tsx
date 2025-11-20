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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const signupSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string()
    .min(9, "Telefone é obrigatório")
    .regex(/^(\+244)?[0-9]{9}$/, "Formato: +244 9XX XXX XXX"),
  address: z.string().min(5, "Endereço é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const loginSchema = z.object({
  phone: z.string()
    .min(9, "Telefone é obrigatório")
    .regex(/^(\+244)?[0-9]{9}$/, "Formato: +244 9XX XXX XXX"),
  password: z.string().min(6, "Senha é obrigatória"),
});

type SignupData = z.infer<typeof signupSchema>;
type LoginData = z.infer<typeof loginSchema>;

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup");

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      password: "",
    },
  });

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      return await apiRequest("POST", "/api/auth/signup", data);
    },
    onSuccess: () => {
      setSuccess(true);
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao DOCE LEVEZA.",
      });
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        signupForm.reset();
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: () => {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta ao DOCE LEVEZA.",
      });
      setTimeout(() => {
        onOpenChange(false);
        loginForm.reset();
        // Redirecionar para área de membros
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Telefone ou senha incorretos.",
        variant: "destructive",
      });
    },
  });

  const onSignupSubmit = (data: SignupData) => {
    signupMutation.mutate(data);
  };

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[420px] sm:max-w-md max-h-[90vh] overflow-y-auto" data-testid="dialog-auth">
        {!success ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-heading font-normal text-center">
                Acesso à Área de Membros
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-center">
                Entre ou crie sua conta no{" "}
                <span className="text-accent font-bold">DOCE LEVEZA</span>
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")} className="w-full mt-3 sm:mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup" className="text-xs sm:text-sm" data-testid="tab-signup">Criar Conta</TabsTrigger>
                <TabsTrigger value="login" className="text-xs sm:text-sm" data-testid="tab-login">Entrar</TabsTrigger>
              </TabsList>

              <TabsContent value="signup" className="mt-3 sm:mt-4">
                <Form {...signupForm}>
                  <form
                    onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                    className="space-y-3 sm:space-y-4"
                  >
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite seu nome"
                              {...field}
                              data-testid="input-signup-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone*</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                +244
                              </span>
                              <Input
                                type="tel"
                                placeholder="9XX XXX XXX"
                                {...field}
                                className="pl-16"
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '');
                                  field.onChange(value);
                                }}
                                data-testid="input-signup-phone"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite seu endereço"
                              {...field}
                              data-testid="input-signup-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha*</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Mínimo 6 caracteres"
                              {...field}
                              data-testid="input-signup-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-sm sm:text-base py-5 sm:py-6 uppercase rounded-full"
                      disabled={signupMutation.isPending}
                      data-testid="button-submit-signup"
                    >
                      {signupMutation.isPending ? "Criando..." : "Criar Conta"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="login" className="mt-3 sm:mt-4">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="space-y-3 sm:space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone*</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                +244
                              </span>
                              <Input
                                type="tel"
                                placeholder="9XX XXX XXX"
                                {...field}
                                className="pl-16"
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '');
                                  field.onChange(value);
                                }}
                                data-testid="input-login-phone"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha*</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Digite sua senha"
                              {...field}
                              data-testid="input-login-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-sm sm:text-base py-5 sm:py-6 uppercase rounded-full"
                      disabled={loginMutation.isPending}
                      data-testid="button-submit-login"
                    >
                      {loginMutation.isPending ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-accent" />
            </div>
            <DialogTitle className="text-2xl font-heading font-normal">
              Conta Criada!
            </DialogTitle>
            <DialogDescription className="text-base">
              Bem-vindo ao DOCE LEVEZA!
              <br />
              Você já pode acessar a área de membros.
            </DialogDescription>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
