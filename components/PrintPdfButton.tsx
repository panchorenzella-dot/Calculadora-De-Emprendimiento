"use client";

import { trackEvent } from "@/lib/analytics";

type Props = {
  filename: string;
  source: "scenario_detail" | "scenario_comparison";
  className?: string;
  children?: React.ReactNode;
};

function printableFilename(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLocaleLowerCase("es");

  return normalized || "escenario-calculadora-emprendedora";
}

export default function PrintPdfButton({ filename, source, className = "", children = "Exportar PDF" }: Props) {
  function printDocument() {
    const previousTitle = document.title;
    const nextTitle = printableFilename(filename);
    let restored = false;

    const restoreTitle = () => {
      if (restored) return;
      restored = true;
      document.title = previousTitle;
    };

    document.title = nextTitle;
    window.addEventListener("afterprint", restoreTitle, { once: true });
    trackEvent("export_scenario_pdf", { source });
    window.print();
    window.setTimeout(restoreTitle, 60_000);
  }

  return (
    <button
      type="button"
      onClick={printDocument}
      className={className}
      aria-label={`${String(children)}. En el diálogo elegí Guardar como PDF.`}
      title="En el diálogo de impresión elegí Guardar como PDF"
    >
      {children}
    </button>
  );
}
