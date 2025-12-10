import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  FileText,
} from "lucide-react";
import type { Ebook } from "@shared/schema";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfReaderProps {
  ebook: Ebook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PdfReader({ ebook, open, onOpenChange }: PdfReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("Error loading PDF:", error);
    setIsLoading(false);
  }, []);

  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(2.0, prev + 0.2));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.5, prev - 0.2));
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPageNumber(1);
      setScale(1.0);
      setIsLoading(true);
    }
    onOpenChange(newOpen);
  };

  if (!ebook) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-lg sm:text-xl font-semibold">
                {ebook.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {ebook.description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              <FileText className="mr-1 h-3 w-3" />
              {ebook.pages} páginas
            </Badge>
            {ebook.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/50 flex items-start justify-center p-4">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-sm text-muted-foreground">Carregando PDF...</div>
            </div>
          )}
          <Document
            file={ebook.downloadUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="flex justify-center"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="shadow-lg"
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>

        <div className="p-3 border-t bg-background shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-3 min-w-[100px] text-center">
                Página {pageNumber} de {numPages}
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                data-testid="button-next-page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                onClick={zoomOut}
                disabled={scale <= 0.5}
                data-testid="button-zoom-out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={zoomIn}
                disabled={scale >= 2.0}
                data-testid="button-zoom-in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
