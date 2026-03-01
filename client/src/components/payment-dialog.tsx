import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Upload, CheckCircle, Loader2 } from "lucide-react";
import type { Pathology } from "@shared/schema";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PaymentDialogProps {
  program: Pathology;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Bank details (you can make this configurable from admin later)
const BANK_DETAILS = {
  bankName: "Banco BIC - Angola",
  accountHolder: "Doce Leveza Saúde",
  accountNumber: "000123456789",
  iban: "AO06000100000000123456789",
  swift: "BICAAOAO",
};

export function PaymentDialog({ program, isOpen, onOpenChange }: PaymentDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  const submitPaymentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest("POST", "/api/payments/submit", formData);
    },
    onSuccess: () => {
      // Reset form
      setFile(null);
      onOpenChange(false);
      // Show success message
      alert("Pagamento enviado com sucesso. Um administrador irá verificar seu comprovante.");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Erro ao enviar pagamento";
      alert(`Erro: ${errorMessage}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.includes("pdf")) {
      setFileError("Por favor, selecione um arquivo PDF");
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError("O arquivo deve ter no máximo 5MB");
      return;
    }

    setFileError("");
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      setFileError("Por favor, selecione um arquivo PDF com o comprovante");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("programId", String(program.id));
    formData.append("amount", String(program.price || 0));

    submitPaymentMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-md overflow-y-auto sm:w-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{program.title}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Realize a transferência e envie o comprovante
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Program Details */}
          <Card className="bg-muted/50">
            <CardContent className="pt-3 sm:pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Programa:</span>
                  <span className="font-medium text-xs sm:text-sm text-right">{program.title}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Valor:</span>
                  <span className="text-base sm:text-lg font-bold text-primary">
                    {program.price || 0} Kz
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">Dados Bancários</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Transfira para esta conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg space-y-2 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Banco:</span>
                  <p className="font-medium text-xs sm:text-sm">{BANK_DETAILS.bankName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Titular:</span>
                  <p className="font-medium text-xs sm:text-sm">{BANK_DETAILS.accountHolder}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Conta:</span>
                  <p className="font-medium text-xs sm:text-sm">{BANK_DETAILS.accountNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">IBAN:</span>
                  <p className="font-medium text-xs sm:text-sm break-all">{BANK_DETAILS.iban}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">SWIFT:</span>
                  <p className="font-medium text-xs sm:text-sm">{BANK_DETAILS.swift}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">Comprovante de Pagamento</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Envie o PDF do comprovante bancário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center hover:bg-muted/50 transition-colors">
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    {file ? (
                      <>
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                        <div>
                          <p className="font-medium text-xs sm:text-sm line-clamp-1">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                        <p className="text-xs sm:text-sm font-medium">Clique para selecionar PDF</p>
                        <p className="text-xs text-muted-foreground">ou arraste um arquivo</p>
                      </>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={submitPaymentMutation.isPending}
                  />
                </label>
              </div>

              {fileError && (
                <Alert variant="destructive" className="text-xs sm:text-sm">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertTitle className="text-xs sm:text-sm">Erro</AlertTitle>
                  <AlertDescription className="text-xs">{fileError}</AlertDescription>
                </Alert>
              )}

              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-xs sm:text-sm">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <AlertTitle className="text-blue-900 dark:text-blue-200 text-xs sm:text-sm">
                  Importante
                </AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-300 text-xs">
                  Após enviar o comprovante, um administrador verificará sua transferência
                  e ativará seu acesso ao programa.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitPaymentMutation.isPending}
              className="flex-1 text-xs sm:text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!file || submitPaymentMutation.isPending}
              className="flex-1 text-xs sm:text-sm"
            >
              {submitPaymentMutation.isPending ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="hidden sm:inline">Enviando...</span>
                  <span className="inline sm:hidden">Enviar...</span>
                </>
              ) : (
                <span className="text-xs sm:text-sm">Enviar Comprovante</span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
