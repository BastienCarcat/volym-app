"use client";

import type { DbProgram } from "@/lib/database/get-program-by-id";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProgramHeaderProps {
  program: NonNullable<DbProgram>;
}

export function ProgramHeader({ program }: ProgramHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);

    try {
      const response = await fetch(`/api/programs/${program.id}/pdf`);

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${program.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
        {program.note && (
          <p className="text-muted-foreground mt-2">{program.note}</p>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={isExporting}
      >
        <Download />
        {isExporting ? "Exporting..." : "Export PDF"}
      </Button>
    </header>
  );
}
