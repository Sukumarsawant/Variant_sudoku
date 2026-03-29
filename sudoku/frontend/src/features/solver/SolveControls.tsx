import { Button } from "../../components/ui/Button";
import { puzzleSamples } from "../../lib/utils/samplePuzzles";
import type { SolveStatus } from "../../types/sudoku";

interface SolveControlsProps {
  solveStatus: SolveStatus;
  canSolve: boolean;
  onSolve: () => void;
  onValidate: () => void;
  onClearBoard: () => void;
  onResetVariants: () => void;
  onLoadSample: (sampleId: string) => void;
  onToggleGiven: () => void;
}

export function SolveControls({
  solveStatus,
  canSolve,
  onSolve,
  onValidate,
  onClearBoard,
  onResetVariants,
  onLoadSample,
  onToggleGiven,
}: SolveControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={onSolve}
        disabled={!canSolve || solveStatus === "solving"}
        variant="primary"
      >
        {solveStatus === "solving" ? "Solving Puzzle..." : "Solve Puzzle"}
      </Button>
      

      <Button onClick={onValidate} variant="success">
        Validate Grid
      </Button>

      <Button onClick={onToggleGiven} variant="accent">
        Mark Selected as Given
      </Button>

      <Button onClick={onClearBoard} variant="danger">
        Clear Grid
      </Button>

      <Button onClick={onResetVariants} variant="secondary">
        Reset Constraints
      </Button>

      <select
        className="h-[42px] rounded-full border border-slate-300 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-md focus:border-cyan-500 focus:ring-2 focus:ring-cyan-300/40 dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-cyan-600/35"
        defaultValue=""
        onChange={(event) => {
          const sampleId = event.target.value;
          if (!sampleId) return;
          onLoadSample(sampleId);
          event.target.value = "";
        }}
      >
        <option value="" disabled>
          Load sample...
        </option>
        {puzzleSamples.map((sample) => (
          <option key={sample.id} value={sample.id}>
            {sample.label}
          </option>
        ))}
      </select>
    </div>
  );
}
