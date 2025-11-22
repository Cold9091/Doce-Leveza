import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="heading-admin-settings">
          Configurações do Sistema
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure as preferências do sistema administrativo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>
            As configurações do sistema aparecerão aqui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <SettingsIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Página de configurações em construção
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
