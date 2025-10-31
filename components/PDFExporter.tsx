'use client';

import { Button } from './ui/button';
import { FileDown } from 'lucide-react';

interface PDFExporterProps {
  moduleCode: string;
  editionCode: string;
}

export function PDFExporter() {
  const handleExportPDF = () => {
    // Usar window.print() que é mais simples e confiável
    window.print();
  };

  return (
    <Button
      onClick={handleExportPDF}
      className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
      size="lg"
    >
      <FileDown className="w-4 h-4" />
      Exportar para PDF
    </Button>
  );
}
