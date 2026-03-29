import { Copy, Download, FileJson, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { SolverRequest } from "../../types/sudoku";

interface JsonPanelProps {
  payload: SolverRequest;
  onCopy: () => void;
  onImport: (fileText: string) => void;
}

export function JsonPanel({ payload, onCopy, onImport }: JsonPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const payloadJson = JSON.stringify(payload, null, 2);

  const downloadPayload = () => {
    const blob = new Blob([payloadJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "variant-sudoku-puzzle.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card
      title="JSON Preview & Exchange"
      subtitle="Live payload sent to backend. Import/export compatible with solver contract."
      action={
        <Button
          onClick={() => setExpanded((prev) => !prev)}
          size="sm"
          variant="secondary"
        >
          {expanded ? "Collapse" : "Expand"}
        </Button>
      }
    >
      {expanded && (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button onClick={onCopy} size="sm" variant="accent">
              <Copy className="h-3.5 w-3.5" />
              Copy JSON
            </Button>
            <Button onClick={downloadPayload} size="sm" variant="secondary">
              <Download className="h-3.5 w-3.5" />
              Download .json
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="secondary">
              <Upload className="h-3.5 w-3.5" />
              Import .json
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              onImport(text);
              event.currentTarget.value = "";
            }}
          />

          <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-950 dark:border-slate-700">
            <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2 text-slate-300">
              <FileJson className="h-4 w-4" />
              <span className="text-xs">request-payload.json</span>
            </div>
            <pre className="max-h-80 overflow-auto p-3 text-xs leading-relaxed text-slate-200">{payloadJson}</pre>
          </div>
        </>
      )}

      {!expanded && <p className="text-xs text-slate-600 dark:text-slate-300">Expand this section to inspect, copy, import, or export the exact request JSON.</p>}
    </Card>
  );
}
