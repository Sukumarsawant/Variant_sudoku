import { AnimatePresence, motion } from "framer-motion";
import { ListChecks } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useSudokuStore } from "../../lib/state/sudokuStore";
import { coordLabel } from "../../lib/utils/coords";
import type { CellCoord, VariantTab } from "../../types/sudoku";

const tabs: Array<{ id: VariantTab; label: string }> = [
  { id: "evenodd", label: "Even/Odd" },
  { id: "killer", label: "Killer" },
  { id: "thermo", label: "Thermo" },
  { id: "arrow", label: "Arrow" },
  { id: "kropki", label: "Kropki" },
];

function cellsText(cells: CellCoord[]): string {
  return cells.map(coordLabel).join(", ");
}

export function ConstraintBuilder() {
  const selectedCells = useSudokuStore((state) => state.selectedCells);
  const activeCell = useSudokuStore((state) => state.activeCell);
  const variants = useSudokuStore((state) => state.variants);
  const activeTab = useSudokuStore((state) => state.activeVariantTab);
  const setActiveTab = useSudokuStore((state) => state.setActiveVariantTab);
  const pushToast = useSudokuStore((state) => state.pushToast);

  const killerDraftSum = useSudokuStore((state) => state.killerDraftSum);
  const setKillerDraftSum = useSudokuStore((state) => state.setKillerDraftSum);

  const arrowDraftCircle = useSudokuStore((state) => state.arrowDraftCircle);
  const setArrowDraftCircle = useSudokuStore((state) => state.setArrowDraftCircle);

  const kropkiDraftType = useSudokuStore((state) => state.kropkiDraftType);
  const setKropkiDraftType = useSudokuStore((state) => state.setKropkiDraftType);

  const assignSelectedToEvenOdd = useSudokuStore((state) => state.assignSelectedToEvenOdd);
  const removeEvenOddCell = useSudokuStore((state) => state.removeEvenOddCell);
  const clearEvenOdd = useSudokuStore((state) => state.clearEvenOdd);

  const addKillerCageFromSelection = useSudokuStore((state) => state.addKillerCageFromSelection);
  const removeKillerCage = useSudokuStore((state) => state.removeKillerCage);
  const clearKiller = useSudokuStore((state) => state.clearKiller);

  const addThermoFromSelection = useSudokuStore((state) => state.addThermoFromSelection);
  const removeThermo = useSudokuStore((state) => state.removeThermo);
  const clearThermo = useSudokuStore((state) => state.clearThermo);

  const addArrowFromSelection = useSudokuStore((state) => state.addArrowFromSelection);
  const removeArrow = useSudokuStore((state) => state.removeArrow);
  const clearArrow = useSudokuStore((state) => state.clearArrow);

  const addKropkiFromSelection = useSudokuStore((state) => state.addKropkiFromSelection);
  const removeKropkiDot = useSudokuStore((state) => state.removeKropkiDot);
  const clearKropki = useSudokuStore((state) => state.clearKropki);

  const requireSelection = (min: number, message: string): boolean => {
    if (selectedCells.length < min) {
      pushToast({
        tone: "warning",
        title: "Selection required",
        detail: message,
      });
      return false;
    }
    return true;
  };

  return (
    <Card
      title="Constraint Builder"
      subtitle="Select cells in the grid and apply rules to build hybrid puzzles."
      action={<span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-200">Selected: {selectedCells.length}</span>}
      className="h-full"
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={active ? "primary" : "secondary"}
              onClick={() => setActiveTab(tab.id)}
              className={active ? "ring-2 ring-cyan-300/40 dark:ring-cyan-700/40" : undefined}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold">Selection snapshot</div>
          <div className="text-[11px] opacity-80">Active: {activeCell ? coordLabel(activeCell) : "none"}</div>
        </div>
        <p className="mt-1 min-h-7 break-words text-[11px] opacity-90">
          {selectedCells.length > 0 ? cellsText(selectedCells) : "No cells selected."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {activeTab === "evenodd" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">Mark selected cells as even or odd. Existing opposite marks are removed automatically.</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="success"
                  onClick={() => {
                    if (!requireSelection(1, "Select at least one cell for Even/Odd.")) return;
                    assignSelectedToEvenOdd("even");
                  }}
                >
                  Mark Even
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="accent"
                  onClick={() => {
                    if (!requireSelection(1, "Select at least one cell for Even/Odd.")) return;
                    assignSelectedToEvenOdd("odd");
                  }}
                >
                  Mark Odd
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={clearEvenOdd}>
                  Reset Even/Odd
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-300/70 bg-emerald-50 p-2 dark:border-emerald-700 dark:bg-emerald-900/30">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-200">Even ({variants.evenodd.even.length})</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {variants.evenodd.even.map((cell) => (
                      <Button
                        key={`even_${coordLabel(cell)}`}
                        type="button"
                        size="sm"
                        variant="success"
                        className="!px-2 !py-1 text-[11px]"
                        onClick={() => removeEvenOddCell("even", cell)}
                      >
                        {coordLabel(cell)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-violet-300/70 bg-violet-50 p-2 dark:border-violet-700 dark:bg-violet-900/30">
                  <p className="text-xs font-bold text-violet-700 dark:text-violet-200">Odd ({variants.evenodd.odd.length})</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {variants.evenodd.odd.map((cell) => (
                      <Button
                        key={`odd_${coordLabel(cell)}`}
                        type="button"
                        size="sm"
                        variant="accent"
                        className="!px-2 !py-1 text-[11px]"
                        onClick={() => removeEvenOddCell("odd", cell)}
                      >
                        {coordLabel(cell)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "killer" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">Create cage groups from selected cells and assign cage sum values.</p>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold">Cage Sum</label>
                <input
                  type="number"
                  min={1}
                  value={killerDraftSum}
                  onChange={(event) => setKillerDraftSum(Number(event.target.value))}
                  className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (!requireSelection(1, "Select cells first, then create a cage.")) return;
                    addKillerCageFromSelection();
                  }}
                >
                  Create Cage
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={clearKiller}>
                  Reset Killer
                </Button>
              </div>

              <div className="space-y-2">
                {variants.killer.cages.map((cage, index) => (
                  <div key={cage.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/60">
                    <div>
                      <p className="text-xs font-semibold">Cage {index + 1}: sum {cage.sum}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">{cellsText(cage.cells)}</p>
                    </div>
                    <Button type="button" size="sm" variant="danger" onClick={() => removeKillerCage(cage.id)} aria-label="Delete cage">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "thermo" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">Build ordered thermo paths from bulb to tip by selecting cells in sequence.</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="accent"
                  onClick={() => {
                    if (!requireSelection(2, "Select at least 2 ordered cells for a thermo path.")) return;
                    addThermoFromSelection();
                  }}
                >
                  Create Thermo Path
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={clearThermo}>
                  Reset Thermo
                </Button>
              </div>

              <div className="space-y-2">
                {variants.thermo.thermos.map((thermo, index) => (
                  <div key={thermo.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/60">
                    <div>
                      <p className="text-xs font-semibold">Thermo {index + 1}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">{cellsText(thermo.cells)}</p>
                    </div>
                    <Button type="button" size="sm" variant="danger" onClick={() => removeThermo(thermo.id)} aria-label="Delete thermo">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "arrow" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">Pick one active cell as arrow circle, then select body path cells and create arrow.</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    if (!activeCell) {
                      pushToast({ tone: "warning", title: "No active cell", detail: "Focus a grid cell first, then set it as circle." });
                      return;
                    }
                    setArrowDraftCircle(activeCell);
                  }}
                >
                  Set Active Cell as Circle
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="accent"
                  onClick={() => {
                    if (!arrowDraftCircle) {
                      pushToast({ tone: "warning", title: "Arrow circle required", detail: "Set a circle cell before adding arrow body." });
                      return;
                    }
                    if (!requireSelection(1, "Select at least one body cell for the arrow.")) return;
                    addArrowFromSelection();
                  }}
                >
                  Create Arrow
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={clearArrow}>
                  Reset Arrow
                </Button>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800/70">
                <span className="font-semibold">Draft circle:</span>{" "}
                {arrowDraftCircle ? coordLabel(arrowDraftCircle) : "not set"}
              </div>

              <div className="space-y-2">
                {variants.arrow.arrows.map((arrow, index) => (
                  <div key={arrow.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/60">
                    <div>
                      <p className="text-xs font-semibold">Arrow {index + 1}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">Circle: {coordLabel(arrow.circle)}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">Body: {cellsText(arrow.cells)}</p>
                    </div>
                    <Button type="button" size="sm" variant="danger" onClick={() => removeArrow(arrow.id)} aria-label="Delete arrow">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "kropki" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">Select exactly two adjacent cells and choose black or white dot type.</p>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold">Dot</label>
                <Button
                  type="button"
                  size="sm"
                  variant={kropkiDraftType === "b" ? "accent" : "secondary"}
                  onClick={() => setKropkiDraftType("b")}
                >
                  Black
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={kropkiDraftType === "w" ? "accent" : "secondary"}
                  onClick={() => setKropkiDraftType("w")}
                >
                  White
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    if (selectedCells.length !== 2) {
                      pushToast({ tone: "warning", title: "Two cells required", detail: "Select exactly two cells for a Kropki dot." });
                      return;
                    }
                    addKropkiFromSelection();
                  }}
                >
                  Create Dot
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={clearKropki}>
                  Reset Kropki
                </Button>
              </div>

              <div className="space-y-2">
                {variants.kropki.dots.map((dot, index) => (
                  <div key={dot.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/60">
                    <div>
                      <p className="text-xs font-semibold">Dot {index + 1} ({dot.type === "b" ? "Black" : "White"})</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">{coordLabel(dot.c1)} ↔ {coordLabel(dot.c2)}</p>
                    </div>
                    <Button type="button" size="sm" variant="danger" onClick={() => removeKropkiDot(dot.id)} aria-label="Delete kropki dot">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
        <div className="mb-1 flex items-center gap-1 font-semibold">
          <ListChecks className="h-3.5 w-3.5" />
          Quick guide
        </div>
        <p>1) Select one or more cells on the grid. 2) Choose a variant tab. 3) Apply or create the constraint item. All actions are reversible from each list row.</p>
      </div>
    </Card>
  );
}
