import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Save, ShieldAlert, Globe, Mail, Phone, Power, Code } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SystemSettings } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const mutation = useMutation({
    mutationFn: async (newSettings: Partial<SystemSettings>) => {
      const res = await apiRequest("PATCH", "/api/admin/settings", newSettings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar configurações: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key === "maintenanceMode" || key === "enableSignup") {
        data[key] = value === "on";
      } else if (key === "smtpPort") {
        data[key] = value ? parseInt(value as string) : undefined;
      } else {
        data[key] = value;
      }
    });
    
    // Manual check for switches as they don't appear in FormData if off
    if (!formData.has("maintenanceMode")) data.maintenanceMode = false;
    if (!formData.has("enableSignup")) data.enableSignup = false;

    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-admin-settings">
          Configurações do Sistema
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as preferências globais e configurações avançadas da plataforma.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Avançado
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave}>
          <TabsContent value="general" className="space-y-4 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Identidade visual
                  </CardTitle>
                  <CardDescription>Nome e informações básicas do site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nome do Site</Label>
                    <Input id="siteName" name="siteName" defaultValue={settings?.siteName} data-testid="input-site-name" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Contato e Suporte
                  </CardTitle>
                  <CardDescription>Canais de atendimento ao cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">E-mail de Suporte</Label>
                    <Input id="supportEmail" name="supportEmail" type="email" defaultValue={settings?.supportEmail} data-testid="input-support-email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportPhone">Telefone de Suporte</Label>
                    <Input id="supportPhone" name="supportPhone" defaultValue={settings?.supportPhone} data-testid="input-support-phone" />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <ShieldAlert className="h-5 w-5" />
                    Controle de Acesso
                  </CardTitle>
                  <CardDescription>Configurações de visibilidade e novos registros</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenanceMode">Modo Manutenção</Label>
                      <p className="text-sm text-muted-foreground">
                        Bloqueia o acesso de usuários comuns ao site.
                      </p>
                    </div>
                    <Switch id="maintenanceMode" name="maintenanceMode" defaultChecked={settings?.maintenanceMode} data-testid="switch-maintenance-mode" />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableSignup">Permitir Novos Registros</Label>
                      <p className="text-sm text-muted-foreground">
                        Habilita ou desabilita o formulário de cadastro de novos alunos.
                      </p>
                    </div>
                    <Switch id="enableSignup" name="enableSignup" defaultChecked={settings?.enableSignup} data-testid="switch-enable-signup" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Integrações e API
                  </CardTitle>
                  <CardDescription>IDs de acompanhamento e URLs técnicas</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                    <Input id="googleAnalyticsId" name="googleAnalyticsId" placeholder="UA-XXXXX-Y" defaultValue={settings?.googleAnalyticsId} data-testid="input-ga-id" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                    <Input id="facebookPixelId" name="facebookPixelId" placeholder="123456789" defaultValue={settings?.facebookPixelId} data-testid="input-fb-pixel" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="apiBaseUrl">API Base URL</Label>
                    <Input id="apiBaseUrl" name="apiBaseUrl" type="url" placeholder="https://api.seusite.com" defaultValue={settings?.apiBaseUrl} data-testid="input-api-url" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Servidor de E-mail (SMTP)
                  </CardTitle>
                  <CardDescription>Configurações para envio de e-mails do sistema</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" name="smtpHost" placeholder="smtp.gmail.com" defaultValue={settings?.smtpHost} data-testid="input-smtp-host" />
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" name="smtpPort" type="number" placeholder="587" defaultValue={settings?.smtpPort} data-testid="input-smtp-port" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Usuário</Label>
                    <Input id="smtpUser" name="smtpUser" placeholder="contato@seusite.com" defaultValue={settings?.smtpUser} data-testid="input-smtp-user" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPass">SMTP Senha</Label>
                    <Input id="smtpPass" name="smtpPass" type="password" placeholder="••••••••" defaultValue={settings?.smtpPass} data-testid="input-smtp-pass" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <div className="flex justify-end pt-4 pb-10">
            <Button type="submit" size="lg" className="flex items-center gap-2" disabled={mutation.isPending} data-testid="button-save-settings">
              <Save className="h-4 w-4" />
              {mutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
