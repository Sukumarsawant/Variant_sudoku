import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Layers2, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { SudokuGrid } from "../grid/SudokuGrid";
import type { GridState, SolveStatus } from "../../types/sudoku";
import type { VariantCounts } from "../../lib/state/selectors";

interface ResultsPanelProps {
  status: SolveStatus;
  solvedGrid: GridState | null;
  originalGrid: GridState | null;
  showComparison: boolean;
  onToggleComparison: () => void;
  solverMessage: string;
  variantCounts: VariantCounts;
}

function statusTone(status: SolveStatus): string {
  switch (status) {
    case "solved":
      return "text-emerald-600 dark:text-emerald-300";
    case "error":
      return "text-rose-600 dark:text-rose-300";
    case "no_solution":
      return "text-amber-600 dark:text-amber-300";
    case "solving":
      return "text-cyan-600 dark:text-cyan-300";
    default:
      return "text-slate-600 dark:text-slate-300";
  }
}

function statusLabel(status: SolveStatus): string {
  if (status === "solved") return "Solved";
  if (status === "solving") return "Solving";
  if (status === "no_solution") return "No Solution";
  if (status === "error") return "Backend Error";
  return "Idle";
}

export function ResultsPanel({
  status,
  solvedGrid,
  originalGrid,
  showComparison,
  onToggleComparison,
  solverMessage,
  variantCounts,
}: ResultsPanelProps) {
  return (
    <Card
      title="Results"
      subtitle="Solver output, comparison tools, and structured explanation area."
      action={
        <Button
          onClick={onToggleComparison}
          size="sm"
          variant="secondary"
        >
          {showComparison ? "Single View" : "Before vs After"}
        </Button>
      }
    >
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
        <div className="flex items-center justify-between gap-3">
          <p className={`text-sm font-bold uppercase tracking-wide ${statusTone(status)}`}>{statusLabel(status)}</p>
          <Sparkles className="h-4 w-4 text-slate-500" />
        </div>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{solverMessage}</p>
      </div>

      <AnimatePresence mode="wait">
        {solvedGrid ? (
          <motion.div
            key="solved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {showComparison && originalGrid ? (
              <div className="grid gap-3 lg:grid-cols-2">
                <SudokuGrid title="Before" gridOverride={originalGrid} interactive={false} faded />
                <SudokuGrid title="After (Solved)" gridOverride={solvedGrid} interactive={false} />
              </div>
            ) : (
              <SudokuGrid title="Solved Grid" gridOverride={solvedGrid} interactive={false} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-300"
          >
            Solve a puzzle to see the result grid and comparison mode.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
            <BarChart3 className="h-3.5 w-3.5" />
            Structured Explanation
          </div>
          {status === "solved" ? (
            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-200">
              <li>Classic Sudoku constraints satisfied by backend solver.</li>
              <li>Variant checks applied for all active constraint groups.</li>
              <li>Step-by-step explanation is not provided by backend yet. Placeholder ready for future solver traces.</li>
            </ul>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300">No backend step trace available yet. This panel is reserved for future logical solving steps.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
            <Layers2 className="h-3.5 w-3.5" />
            Active Variant Summary
          </div>
          <ul className="grid grid-cols-2 gap-1 text-xs text-slate-700 dark:text-slate-200">
            <li>Even marks: {variantCounts.even}</li>
            <li>Odd marks: {variantCounts.odd}</li>
            <li>Killer cages: {variantCounts.killer}</li>
            <li>Thermo paths: {variantCounts.thermo}</li>
            <li>Arrow constraints: {variantCounts.arrow}</li>
            <li>Kropki dots: {variantCounts.kropki}</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
