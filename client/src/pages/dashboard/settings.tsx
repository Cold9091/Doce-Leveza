import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Lock, Bell, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { User as UserType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Settings() {
  const { toast } = useToast();
  const [notifContent, setNotifContent] = useState(true);
  const [notifConsultation, setNotifConsultation] = useState(true);

  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });

  const profileForm = useForm({
    values: {
      name: user?.name || "",
      address: user?.address || "",
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: { name: string; address: string }) => {
      const res = await apiRequest("PATCH", "/api/auth/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Perfil atualizado", description: "As suas informações foram guardadas com sucesso." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const passwordForm = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("PATCH", "/api/auth/password", data);
      return res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({ title: "Senha alterada", description: "A sua senha foi atualizada com sucesso." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const handleProfileSave = profileForm.handleSubmit((data) => {
    profileMutation.mutate(data);
  });

  const handlePasswordChange = passwordForm.handleSubmit((data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (data.newPassword.length < 6) {
      toast({ title: "Erro", description: "A nova senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    passwordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword });
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground" data-testid="heading-settings">
          Configurações
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Gerencie suas preferências e informações pessoais
        </p>
      </div>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados cadastrais</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  data-testid="input-name"
                  {...profileForm.register("name", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+244 9XX XXX XXX"
                  defaultValue={user?.phone || ""}
                  disabled
                  className="opacity-60"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                placeholder="Seu endereço"
                data-testid="input-address"
                {...profileForm.register("address")}
              />
            </div>
            <Button type="submit" disabled={profileMutation.isPending} data-testid="button-save-profile">
              {profileMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />A guardar...</>
              ) : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Altere sua senha de acesso</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Digite sua senha atual"
                data-testid="input-current-password"
                {...passwordForm.register("currentPassword", { required: true })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Nova senha"
                  data-testid="input-new-password"
                  {...passwordForm.register("newPassword", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirme a nova senha"
                  data-testid="input-confirm-password"
                  {...passwordForm.register("confirmPassword", { required: true })}
                />
              </div>
            </div>
            <Button type="submit" disabled={passwordMutation.isPending} data-testid="button-change-password">
              {passwordMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />A alterar...</>
              ) : "Alterar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure como deseja receber notificações</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Novos Conteúdos</p>
              <p className="text-sm text-muted-foreground">
                Receba avisos quando novos vídeos forem publicados
              </p>
            </div>
            <Switch
              checked={notifContent}
              onCheckedChange={setNotifContent}
              data-testid="switch-notif-content"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Lembretes de Consultas</p>
              <p className="text-sm text-muted-foreground">
                Lembrete 24h antes das suas consultas agendadas
              </p>
            </div>
            <Switch
              checked={notifConsultation}
              onCheckedChange={setNotifConsultation}
              data-testid="switch-notif-consultation"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
