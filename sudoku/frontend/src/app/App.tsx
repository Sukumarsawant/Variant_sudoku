import { motion } from "framer-motion";
import gsap from "gsap";
import {
  Layers3,
  MoonStar,
  OctagonAlert,
  Puzzle,
  Server,
  SunMedium,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Button } from "../components/ui/Button";
import ThemeChanger from "../components/ui/ThemeChanger";
import { StatusChip } from "../components/ui/StatusChip";
import { ToastHost } from "../components/ui/ToastHost";
import Shuffle from "../components/Shuffle";
import { Card } from "../components/ui/Card";
import { DiagnosticsPanel } from "../features/diagnostics/DiagnosticsPanel";
import { SudokuGrid } from "../features/grid/SudokuGrid";
import { ConstraintBuilder } from "../features/variants/ConstraintBuilder";
import { JsonPanel } from "../features/solver/JsonPanel";
import { ResultsPanel } from "../features/solver/ResultsPanel";
import { SolveControls } from "../features/solver/SolveControls";
import { checkBackendConnection, solvePuzzle } from "../lib/api/solverApi";
import { getVariantCounts } from "../lib/state/selectors";
import { useSudokuStore } from "../lib/state/sudokuStore";
import { buildSolverRequest } from "../lib/utils/payload";
import { parseJsonPayload, requestToInternal } from "../lib/utils/importExport";
import { puzzleSamples } from "../lib/utils/samplePuzzles";
import { validatePuzzle } from "../lib/validation/validatePuzzle";

function chipToneFromBackend(
  status: string,
): "neutral" | "success" | "warning" | "error" {
  if (status === "online") return "success";
  if (status === "offline") return "error";
  if (status === "checking") return "warning";
  return "neutral";
}

function chipToneFromSolve(
  status: string,
): "neutral" | "success" | "warning" | "error" | "info" {
  if (status === "solved") return "success";
  if (status === "no_solution") return "warning";
  if (status === "error") return "error";
  if (status === "solving") return "info";
  return "neutral";
}

export default function App() {
  const stageRef = useRef<HTMLDivElement | null>(null);

  const grid = useSudokuStore((state) => state.grid);
  const variants = useSudokuStore((state) => state.variants);
  const solveStatus = useSudokuStore((state) => state.solveStatus);
  const solvedGrid = useSudokuStore((state) => state.solvedGrid);
  const originalGridBeforeSolve = useSudokuStore(
    (state) => state.originalGridBeforeSolve,
  );
  const showComparison = useSudokuStore((state) => state.showComparison);
  const solverMessage = useSudokuStore((state) => state.solverMessage);
  const backendStatus = useSudokuStore((state) => state.backendStatus);
  const theme = useSudokuStore((state) => state.theme);

  const toggleTheme = useSudokuStore((state) => state.toggleTheme);
  const setBackendStatus = useSudokuStore((state) => state.setBackendStatus);
  const setSolveState = useSudokuStore((state) => state.setSolveState);
  const toggleComparison = useSudokuStore((state) => state.toggleComparison);

  const clearBoard = useSudokuStore((state) => state.clearBoard);
  const resetVariants = useSudokuStore((state) => state.resetVariants);
  const toggleGivenOnSelection = useSudokuStore(
    (state) => state.toggleGivenOnSelection,
  );
  const loadFromExternalPayload = useSudokuStore(
    (state) => state.loadFromExternalPayload,
  );
  const pushToast = useSudokuStore((state) => state.pushToast);

  const payload = useMemo(
    () => buildSolverRequest(grid, variants),
    [grid, variants],
  );
  const validation = useMemo(
    () => validatePuzzle(grid, variants),
    [grid, variants],
  );
  const variantCounts = useMemo(() => getVariantCounts(variants), [variants]);
  const totalConstraints =
    variantCounts.even +
    variantCounts.odd +
    variantCounts.killer +
    variantCounts.thermo +
    variantCounts.arrow +
    variantCounts.kropki;
  const diagnosticsCount =
    validation.errors.length + validation.warnings.length;

  useEffect(() => {
    let canceled = false;

    const check = async () => {
      setBackendStatus("checking");
      const online = await checkBackendConnection();
      if (!canceled) {
        setBackendStatus(online ? "online" : "offline");
      }
    };

    void check();
    const timer = window.setInterval(() => void check(), 12000);

    return () => {
      canceled = true;
      window.clearInterval(timer);
    };
  }, [setBackendStatus]);

  useLayoutEffect(() => {
    if (!stageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".reveal-card", {
        opacity: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out",
        force3D: false,
        clearProps: "opacity,transform,visibility",
      });
    }, stageRef);

    return () => ctx.revert();
  }, []);

  const handleSolve = async () => {
    const recheck = await checkBackendConnection();
    setBackendStatus(recheck ? "online" : "offline");

    if (!recheck) {
      pushToast({
        tone: "error",
        title: "Backend offline",
        detail:
          "Could not reach solver at /solve. Ensure C++ server is running on localhost:8080.",
      });
      return;
    }

    if (!validation.isValid) {
      pushToast({
        tone: "error",
        title: "Validation failed",
        detail: "Resolve diagnostics errors before solving.",
      });
      return;
    }

    setSolveState("solving");
    const response = await solvePuzzle(payload);
    setSolveState(response.status, response);

    if (response.status === "solved") {
      pushToast({
        tone: "success",
        title: "Puzzle solved",
        detail: "Solved grid received from backend.",
      });
    } else if (response.status === "no_solution") {
      pushToast({
        tone: "warning",
        title: "No solution",
        detail: "Solver did not find a valid assignment.",
      });
    } else {
      pushToast({
        tone: "error",
        title: "Solve failed",
        detail: response.message,
      });
    }
  };

  const handleValidate = () => {
    if (validation.isValid) {
      pushToast({
        tone: "success",
        title: "Validation passed",
        detail: "Input is ready for solver submission.",
      });
    } else {
      pushToast({
        tone: "error",
        title: "Validation errors",
        detail: `${validation.errors.length} issue(s) need attention.`,
      });
    }
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = puzzleSamples.find((entry) => entry.id === sampleId);
    if (!sample) return;

    const { grid: importedGrid, variants: importedVariants } =
      requestToInternal(sample.payload);
    loadFromExternalPayload(importedGrid, importedVariants, sample.label);
    pushToast({
      tone: "info",
      title: "Sample loaded",
      detail: sample.description,
    });
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      pushToast({
        tone: "success",
        title: "JSON copied",
        detail: "Payload copied to clipboard.",
      });
    } catch {
      pushToast({
        tone: "error",
        title: "Copy failed",
        detail: "Clipboard permission denied by browser.",
      });
    }
  };

  const handleImportJson = (rawText: string) => {
    try {
      const parsed = parseJsonPayload(rawText);
      const { grid: importedGrid, variants: importedVariants } =
        requestToInternal(parsed);
      loadFromExternalPayload(importedGrid, importedVariants, "JSON import");
      pushToast({
        tone: "success",
        title: "Puzzle imported",
        detail: "Grid and constraints loaded from JSON.",
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Import failed",
        detail:
          error instanceof Error
            ? error.message
            : "Malformed payload warning: JSON could not be parsed.",
      });
    }
  };

  const backendNote =
    backendStatus === "offline"
      ? "Connection failure: backend appears unavailable at http://localhost:8080/solve."
      : backendStatus === "checking"
        ? "Checking backend connection..."
        : undefined;

  return (
    <div
      ref={stageRef}
      className="min-h-screen bg-[radial-gradient(circle_at_9%_10%,#cffafe_0%,#eff6ff_35%,#fff7ed_68%,#f8fafc_100%)] px-3 py-4 font-sans text-slate-900 dark:bg-[radial-gradient(circle_at_12%_10%,#0c172a_0%,#0a1020_42%,#120f24_72%,#090b14_100%)] dark:text-slate-100 sm:px-6"
    >
      <ToastHost />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="reveal-card mb-6 px-6 py-8 text-center"
      >
        <div className="relative">
          {/* Gradient glow background */}
          <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 dark:opacity-20" />

          <Shuffle
            tag="h1"
            text="Variant Sudoku Solver"
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-slate-900 via-indigo-700 to-cyan-600 bg-clip-text text-transparent dark:from-white dark:via-indigo-300 dark:to-cyan-300"
            shuffleDirection="up"
            duration={0.55}
            animationMode="evenodd"
            shuffleTimes={2}
            ease="power3.out"
            stagger={0.03}
            threshold={0.1}
            triggerOnce={true}
            triggerOnHover
            respectReducedMotion={true}
            loop={false}
            loopDelay={0}
          />
        </div>

        <div className="mt-6 flex justify-center">
          <ThemeChanger />
        </div>
      </motion.header>

      <main className="mx-auto max-w-[1450px] space-y-4">
        <section className="reveal-card grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/*<div className="card-surface flex items-center gap-3 p-3">
            <div className="rounded-xl bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-200">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Backend
              </p>
              <p className="text-sm font-semibold capitalize">
                {backendStatus}
              </p>
            </div>
          </div>*/}

          {/* <div className="card-surface flex items-center gap-3 p-3">
            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
              <Layers3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Constraints
              </p>
              <p className="text-sm font-semibold">{totalConstraints}</p>
            </div>
          </div>*/}

          {/*<div className="card-surface flex items-center gap-3 p-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
              <OctagonAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Diagnostics
              </p>
              <p className="text-sm font-semibold">{diagnosticsCount}</p>
            </div>
          </div>*/}

          {/*<div className="card-surface flex items-center gap-3 p-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
              <Puzzle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Solver State
              </p>
              <p className="text-sm font-semibold capitalize">{solveStatus}</p>
            </div>
          </div>*/}
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.28fr_1fr]">
          <Card
            className="reveal-card"
            title="Puzzle Editor"
            subtitle="Edit a 9x9 grid with keyboard navigation, conflict highlighting, and variant badges."
          >
            <div className="space-y-4">
              <SolveControls
                solveStatus={solveStatus}
                canSolve={validation.isValid && backendStatus !== "offline"}
                onSolve={() => void handleSolve()}
                onValidate={handleValidate}
                onClearBoard={clearBoard}
                onResetVariants={resetVariants}
                onLoadSample={handleLoadSample}
                onToggleGiven={toggleGivenOnSelection}
              />
              <SudokuGrid title="Editor Grid" interactive />
            </div>
          </Card>

          <div className="reveal-card">
            <ConstraintBuilder />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="reveal-card space-y-4">
            <JsonPanel
              payload={payload}
              onCopy={() => void handleCopyJson()}
              onImport={handleImportJson}
            />
            <DiagnosticsPanel
              errors={validation.errors}
              warnings={validation.warnings}
              backendNote={backendNote}
            />
          </div>

          <div className="reveal-card">
            <ResultsPanel
              status={solveStatus}
              solvedGrid={solvedGrid}
              originalGrid={originalGridBeforeSolve}
              showComparison={showComparison}
              onToggleComparison={toggleComparison}
              solverMessage={solverMessage}
              variantCounts={variantCounts}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
