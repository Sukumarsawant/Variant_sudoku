import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { buildCellVariantTags } from "../../lib/state/selectors";
import { useSudokuStore } from "../../lib/state/sudokuStore";
import type { CellCoord, Digit, GridState } from "../../types/sudoku";
import { computeGridConflicts } from "../../lib/validation/validatePuzzle";
import { coordKey } from "../../lib/utils/coords";

interface SudokuGridProps {
  title: string;
  gridOverride?: GridState | null;
  interactive?: boolean;
  faded?: boolean;
}

function clampCoord(value: number): number {
  return Math.max(0, Math.min(8, value));
}

export function SudokuGrid({ title, gridOverride = null, interactive = true, faded = false }: SudokuGridProps) {
  const grid = useSudokuStore((state) => (gridOverride ? gridOverride : state.grid));
  const givenMask = useSudokuStore((state) => state.givenMask);
  const variants = useSudokuStore((state) => state.variants);
  const selectedCells = useSudokuStore((state) => state.selectedCells);
  const activeCell = useSudokuStore((state) => state.activeCell);
  const setCellValue = useSudokuStore((state) => state.setCellValue);
  const setActiveCell = useSudokuStore((state) => state.setActiveCell);
  const selectSingleCell = useSudokuStore((state) => state.selectSingleCell);
  const toggleSelectedCell = useSudokuStore((state) => state.toggleSelectedCell);
  const selectRectangleTo = useSudokuStore((state) => state.selectRectangleTo);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const selectedSet = useMemo(() => new Set(selectedCells.map(coordKey)), [selectedCells]);
  const tagMap = useMemo(() => buildCellVariantTags(variants), [variants]);
  const conflicts = useMemo(() => computeGridConflicts(grid), [grid]);

  useEffect(() => {
    if (!interactive || !activeCell) return;
    const refIndex = activeCell.row * 9 + activeCell.col;
    inputRefs.current[refIndex]?.focus();
    inputRefs.current[refIndex]?.select();
  }, [activeCell, interactive]);

  const moveActiveCell = (cell: CellCoord, rowDelta: number, colDelta: number) => {
    const next = {
      row: clampCoord(cell.row + rowDelta),
      col: clampCoord(cell.col + colDelta),
    };
    setActiveCell(next);
    selectSingleCell(next);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    cell: CellCoord,
    cellValue: Digit,
  ) => {
    if (!interactive) return;

    const { key } = event;

    if (key === "ArrowUp") {
      event.preventDefault();
      moveActiveCell(cell, -1, 0);
      return;
    }
    if (key === "ArrowDown") {
      event.preventDefault();
      moveActiveCell(cell, 1, 0);
      return;
    }
    if (key === "ArrowLeft") {
      event.preventDefault();
      moveActiveCell(cell, 0, -1);
      return;
    }
    if (key === "ArrowRight") {
      event.preventDefault();
      moveActiveCell(cell, 0, 1);
      return;
    }

    if (key === "Backspace" || key === "Delete") {
      event.preventDefault();
      setCellValue(cell, 0);
      return;
    }

    if (key === "Tab") {
      event.preventDefault();
      const colDelta = event.shiftKey ? -1 : 1;
      const nextCol = clampCoord(cell.col + colDelta);
      const nextRow =
        event.shiftKey && cell.col === 0
          ? clampCoord(cell.row - 1)
          : !event.shiftKey && cell.col === 8
            ? clampCoord(cell.row + 1)
            : cell.row;
      const nextCell = { row: nextRow, col: nextCol };
      setActiveCell(nextCell);
      selectSingleCell(nextCell);
      return;
    }

    if (key === "Enter") {
      event.preventDefault();
      const nextCell = { row: clampCoord(cell.row + 1), col: cell.col };
      setActiveCell(nextCell);
      selectSingleCell(nextCell);
      return;
    }

    if (/^[0-9]$/.test(key)) {
      event.preventDefault();
      setCellValue(cell, Number(key) as Digit);
      if (cellValue !== 0) {
        moveActiveCell(cell, 0, 1);
      }
      return;
    }

    if (key === " ") {
      event.preventDefault();
      toggleSelectedCell(cell);
      return;
    }
  };

  const handleSelect = (event: MouseEvent<HTMLInputElement>, cell: CellCoord) => {
    if (!interactive) return;

    if (event.shiftKey) {
      selectRectangleTo(cell);
      return;
    }

    if (event.metaKey || event.ctrlKey) {
      toggleSelectedCell(cell);
      return;
    }

    selectSingleCell(cell);
  };

  return (
    <div className={clsx("space-y-3", faded && "opacity-70")}> 
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-300">Click to select. Shift for box select, Ctrl/Cmd for multi-select.</p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-9 gap-[2px] rounded-xl border border-slate-300 bg-slate-300 p-[2px] shadow-inner dark:border-slate-700 dark:bg-slate-700"
      >
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const cell = { row: rowIndex, col: colIndex };
            const key = coordKey(cell);
            const tags = tagMap.get(key) ?? [];
            const selected = selectedSet.has(key);
            const conflict = conflicts.has(key);
            const given = givenMask[rowIndex]?.[colIndex] ?? false;
            const boxEdgeTop = rowIndex % 3 === 0;
            const boxEdgeLeft = colIndex % 3 === 0;
            const boxEdgeBottom = rowIndex === 8;
            const boxEdgeRight = colIndex === 8;

            return (
              <div
                key={key}
                className={clsx(
                  "relative",
                  boxEdgeTop && "border-t-2 border-t-slate-900 dark:border-t-slate-100",
                  boxEdgeLeft && "border-l-2 border-l-slate-900 dark:border-l-slate-100",
                  boxEdgeRight && "border-r-2 border-r-slate-900 dark:border-r-slate-100",
                  boxEdgeBottom && "border-b-2 border-b-slate-900 dark:border-b-slate-100",
                )}
              >
                <input
                  ref={(ref) => {
                    inputRefs.current[rowIndex * 9 + colIndex] = ref;
                  }}
                  aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}`}
                  value={value === 0 ? "" : value}
                  readOnly={!interactive || given}
                  inputMode="numeric"
                  onClick={(event) => handleSelect(event, cell)}
                  onFocus={() => interactive && setActiveCell(cell)}
                  onKeyDown={(event) => handleKeyDown(event, cell, value)}
                  onChange={(event) => {
                    const next = event.target.value.replace(/[^0-9]/g, "").slice(-1);
                    setCellValue(cell, (next === "" ? 0 : Number(next)) as Digit);
                  }}
                  className={clsx(
                    "h-11 w-full bg-white text-center font-display text-lg font-semibold text-slate-800 outline-none transition-all sm:h-12 dark:bg-slate-900 dark:text-slate-100",
                    selected && "bg-cyan-100 ring-1 ring-cyan-400 dark:bg-cyan-900/40 dark:ring-cyan-500",
                    conflict && "bg-rose-100 text-rose-700 ring-1 ring-rose-400 dark:bg-rose-900/50 dark:text-rose-100 dark:ring-rose-600",
                    given && "bg-slate-100 font-black text-slate-900 dark:bg-slate-800 dark:text-slate-100",
                    !interactive && "cursor-default",
                  )}
                />

                {tags.length > 0 && (
                  <div className="pointer-events-none absolute right-0.5 top-0.5 flex max-w-[80%] flex-wrap justify-end gap-0.5">
                    {tags.slice(0, 3).map((tag) => (
                      <span key={`${key}_${tag}`} className="rounded bg-slate-900/80 px-1 text-[9px] font-bold text-white dark:bg-slate-100/90 dark:text-slate-900">
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="rounded bg-slate-600/80 px-1 text-[9px] font-bold text-white">+{tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          }),
        )}
      </motion.div>
    </div>
  );
}
