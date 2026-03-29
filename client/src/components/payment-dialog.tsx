import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Upload,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import type { Pathology } from "@shared/schema";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface PaymentDialogProps {
  program: Pathology;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const BANK_DETAILS = {
  bankName: "Banco BIC - Angola",
  accountHolder: "Doce Leveza Saúde",
  accountNumber: "000123456789",
  iban: "AO06000100000000123456789",
  swift: "BICAAOAO",
};

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const ACCEPTED_LABEL = "PDF, JPG ou PNG (máx. 5MB)";

export function PaymentDialog({ program, isOpen, onOpenChange }: PaymentDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isPending = isUploading || isSubmitting;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFileError("Formato inválido. Por favor selecione PDF, JPG ou PNG.");
      setFile(null);
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setFileError("O ficheiro deve ter no máximo 5MB.");
      setFile(null);
      return;
    }

    setFileError("");
    setFile(selected);
  };

  const removeFile = () => {
    setFile(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) {
      setFileError("Selecione o comprovativo antes de enviar.");
      return;
    }

    try {
      // Step 1: Upload the file to Cloudinary
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/payments/upload-proof", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error || "Falha ao enviar o ficheiro");
      }

      const { url: proofUrl } = await uploadRes.json();
      setIsUploading(false);

      // Step 2: Register the payment proof
      setIsSubmitting(true);
      const submitRes = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          programId: program.id,
          amount: program.price ?? 0,
          proofUrl,
        }),
      });

      if (!submitRes.ok) {
        const err = await submitRes.json().catch(() => ({}));
        throw new Error(err.error || "Falha ao registar pagamento");
      }

      toast({
        title: "Comprovativo enviado!",
        description:
          "O teu comprovativo foi recebido. Um administrador irá verificar e ativar o teu acesso em breve.",
      });

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Erro ao enviar",
        description: err.message || "Ocorreu um erro. Tenta novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isPending) {
      if (!open) {
        setFile(null);
        setFileError("");
      }
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-md overflow-y-auto sm:w-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{program.title}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Realize a transferência e envie o comprovativo bancário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Program summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-3 sm:pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Programa:</span>
                  <span className="font-medium text-xs sm:text-sm text-right">
                    {program.title}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Valor:</span>
                  <span className="text-base sm:text-lg font-bold text-primary">
                    {(program.price ?? 0).toLocaleString()} Kz
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">Dados Bancários</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Transfira para esta conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg space-y-2">
                {[
                  ["Banco", BANK_DETAILS.bankName],
                  ["Titular", BANK_DETAILS.accountHolder],
                  ["Conta", BANK_DETAILS.accountNumber],
                  ["IBAN", BANK_DETAILS.iban],
                  ["SWIFT", BANK_DETAILS.swift],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-muted-foreground text-xs">{label}:</span>
                    <p className="font-medium text-xs sm:text-sm break-all">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">Comprovante de Pagamento</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Envie o comprovativo bancário (PDF ou imagem)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
                  file
                    ? "border-green-400/60 bg-green-50/50 dark:bg-green-900/10"
                    : "hover:bg-muted/50 border-muted-foreground/30"
                }`}
              >
                <label className={`cursor-pointer ${isPending ? "pointer-events-none opacity-60" : ""}`}>
                  <div className="flex flex-col items-center gap-2">
                    {file ? (
                      <>
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                        <div className="w-full">
                          <p className="font-medium text-xs sm:text-sm line-clamp-1 break-all">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                        <p className="text-xs sm:text-sm font-medium">
                          Clique para selecionar ficheiro
                        </p>
                        <p className="text-xs text-muted-foreground">{ACCEPTED_LABEL}</p>
                      </>
                    )}
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isPending}
                    data-testid="input-payment-proof"
                  />
                </label>
              </div>

              {/* Remove file button */}
              {file && !isPending && (
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  onClick={removeFile}
                  data-testid="button-remove-proof-file"
                >
                  <X className="h-3 w-3" /> Remover ficheiro
                </button>
              )}

              {fileError && (
                <Alert variant="destructive" className="text-xs sm:text-sm">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertTitle className="text-xs sm:text-sm">Erro</AlertTitle>
                  <AlertDescription className="text-xs">{fileError}</AlertDescription>
                </Alert>
              )}

              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <AlertTitle className="text-blue-900 dark:text-blue-200 text-xs sm:text-sm">
                  Importante
                </AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-300 text-xs">
                  Após enviar o comprovativo, um administrador verificará a tua transferência
                  e ativará o teu acesso ao programa.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Upload progress indicator */}
          {isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
              <span>
                {isUploading
                  ? "A enviar ficheiro para o servidor..."
                  : "A registar pagamento..."}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="flex-1 text-xs sm:text-sm"
              data-testid="button-cancel-payment"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!file || isPending}
              className="flex-1 text-xs sm:text-sm"
              data-testid="button-submit-payment"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  {isUploading ? "A enviar..." : "A registar..."}
                </>
              ) : (
                "Enviar Comprovativo"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
