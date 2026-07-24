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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ArrowLeft } from "lucide-react";

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
  identifier: z.string().min(3, "Digite seu telefone ou email"),
  password: z.string().min(6, "Senha é obrigatória"),
});

const forgotSchema = z.object({
  phone: z.string().min(9, "Telefone é obrigatório"),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme a nova senha"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SignupData = z.infer<typeof signupSchema>;
type LoginData = z.infer<typeof loginSchema>;
type ForgotData = z.infer<typeof forgotSchema>;

type View = "auth" | "forgot" | "forgot-success";

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { toast } = useToast();
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup");
  const [view, setView] = useState<View>("auth");

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", phone: "", address: "", password: "" },
  });

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const forgotForm = useForm<ForgotData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { phone: "", newPassword: "", confirmPassword: "" },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      const res = await apiRequest("POST", "/api/auth/signup", data);
      return await res.json();
    },
    onSuccess: (response: any) => {
      toast({ title: "Conta criada com sucesso!", description: "Bem-vindo ao DOCE LEVEZA." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      onOpenChange(false);
      signupForm.reset();
      window.location.href = "/dashboard";
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
      const res = await apiRequest("POST", "/api/auth/login", data);
      return await res.json();
    },
    onSuccess: (response: any) => {
      toast({ title: "Login realizado!", description: "Bem-vindo de volta ao DOCE LEVEZA." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
      const userData = response.data;
      if (userData?.role === "admin" || userData?.role === "super_admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
      onOpenChange(false);
      loginForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Telefone ou senha incorretos.",
        variant: "destructive",
      });
    },
  });

  const forgotMutation = useMutation({
    mutationFn: async (data: ForgotData) => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", {
        phone: data.phone,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      setView("forgot-success");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setView("auth");
      setSignupSuccess(false);
      forgotForm.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[420px] sm:max-w-md max-h-[90vh] overflow-y-auto" data-testid="dialog-auth">

        {/* ── FORGOT PASSWORD SUCCESS ── */}
        {view === "forgot-success" && (
          <div className="py-10 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-accent" />
            </div>
            <DialogTitle className="text-2xl font-heading font-normal">
              Senha Redefinida!
            </DialogTitle>
            <DialogDescription className="text-base">
              A sua senha foi actualizada com sucesso.
              <br />
              Já pode entrar com a nova senha.
            </DialogDescription>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold uppercase rounded-full"
              onClick={() => { setView("auth"); setActiveTab("login"); forgotForm.reset(); }}
              data-testid="button-goto-login"
            >
              Fazer Login
            </Button>
          </div>
        )}

        {/* ── FORGOT PASSWORD FORM ── */}
        {view === "forgot" && (
          <>
            <DialogHeader>
              <button
                onClick={() => { setView("auth"); forgotForm.reset(); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-1 w-fit"
                data-testid="button-back-to-login"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </button>
              <DialogTitle className="text-xl sm:text-2xl font-heading font-normal text-center">
                Recuperar Senha
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-center">
                Insira o seu número de telefone e escolha uma nova senha.
              </DialogDescription>
            </DialogHeader>

            <Form {...forgotForm}>
              <form
                onSubmit={forgotForm.handleSubmit((data) => forgotMutation.mutate(data))}
                className="space-y-4 mt-4"
              >
                <FormField
                  control={forgotForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Telefone*</FormLabel>
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
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                            data-testid="input-forgot-phone"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={forgotForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha*</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          {...field}
                          data-testid="input-forgot-new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={forgotForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha*</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Repita a nova senha"
                          {...field}
                          data-testid="input-forgot-confirm-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold text-sm sm:text-base py-5 sm:py-6 uppercase rounded-full"
                  disabled={forgotMutation.isPending}
                  data-testid="button-submit-forgot"
                >
                  {forgotMutation.isPending ? "A redefinir..." : "Redefinir Senha"}
                </Button>
              </form>
            </Form>
          </>
        )}

        {/* ── SIGNUP SUCCESS ── */}
        {view === "auth" && signupSuccess && (
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

        {/* ── MAIN AUTH (LOGIN / SIGNUP) ── */}
        {view === "auth" && !signupSuccess && (
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

              {/* SIGNUP TAB */}
              <TabsContent value="signup" className="mt-3 sm:mt-4">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit((d) => signupMutation.mutate(d))} className="space-y-3 sm:space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo*</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu nome" {...field} data-testid="input-signup-name" />
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
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">+244</span>
                              <Input
                                type="tel"
                                placeholder="9XX XXX XXX"
                                {...field}
                                className="pl-16"
                                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
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
                            <Input placeholder="Digite seu endereço" {...field} data-testid="input-signup-address" />
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
                            <Input type="password" placeholder="Mínimo 6 caracteres" {...field} data-testid="input-signup-password" />
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

              {/* LOGIN TAB */}
              <TabsContent value="login" className="mt-3 sm:mt-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((d) => loginMutation.mutate(d))} className="space-y-3 sm:space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone ou Email*</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu telefone ou email" {...field} data-testid="input-login-identifier" />
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
                          <div className="flex items-center justify-between">
                            <FormLabel>Senha*</FormLabel>
                            <button
                              type="button"
                              onClick={() => setView("forgot")}
                              className="text-xs text-primary hover:underline"
                              data-testid="link-forgot-password"
                            >
                              Esqueceu a senha?
                            </button>
                          </div>
                          <FormControl>
                            <Input type="password" placeholder="Digite sua senha" {...field} data-testid="input-login-password" />
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
        )}
      </DialogContent>
    </Dialog>
  );
}
