import { AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

interface DiagnosticsPanelProps {
  errors: string[];
  warnings: string[];
  backendNote?: string;
}

export function DiagnosticsPanel({ errors, warnings, backendNote }: DiagnosticsPanelProps) {
  const [open, setOpen] = useState(false);

  const hasIssues = errors.length > 0 || warnings.length > 0 || Boolean(backendNote);

  return (
    <Card
      title="Diagnostics"
      subtitle="Client-side validation, payload quality checks, and backend connectivity notes."
      action={
        <Button
          onClick={() => setOpen((prev) => !prev)}
          size="sm"
          variant="secondary"
        >
          {open ? "Hide" : "Show"}
          <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
        </Button>
      }
    >
      {!open && (
        <div className="text-xs text-slate-600 dark:text-slate-300">
          {hasIssues ? "Open diagnostics to review issues and warnings before solving." : "No diagnostics issues detected."}
        </div>
      )}

      {open && (
        <div className="space-y-3">
          {errors.length === 0 && warnings.length === 0 && !backendNote && (
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Input diagnostics look healthy.
            </div>
          )}

          {errors.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">Validation Errors</h4>
              <ul className="space-y-1 text-xs text-rose-700 dark:text-rose-200">
                {errors.map((error) => (
                  <li key={error} className="flex items-start gap-2 rounded-lg bg-rose-100 px-2 py-1.5 dark:bg-rose-900/50">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Warnings</h4>
              <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-200">
                {warnings.map((warning) => (
                  <li key={warning} className="flex items-start gap-2 rounded-lg bg-amber-100 px-2 py-1.5 dark:bg-amber-900/50">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {backendNote && (
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">Backend</h4>
              <p className="rounded-lg bg-cyan-100 px-2 py-1.5 text-xs text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200">{backendNote}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
