import { create } from "zustand";
import type {
  ArrowConstraint,
  BackendStatus,
  CellCoord,
  Digit,
  GridState,
  KropkiDot,
  KropkiDotType,
  SolveStatus,
  SolverResponse,
  ThemeMode,
  VariantTab,
  VariantsState,
} from "../../types/sudoku";
import { areSameCell, coordKey, parseCoordKey, uniqueCells } from "../utils/coords";
import { cloneGrid, cloneMask, createEmptyGrid, createEmptyMask } from "../utils/grid";

export interface ToastMessage {
  id: string;
  title: string;
  detail?: string;
  tone: "info" | "success" | "warning" | "error";
}

const defaultVariants: VariantsState = {
  evenodd: { even: [], odd: [] },
  killer: { cages: [] },
  thermo: { thermos: [] },
  arrow: { arrows: [] },
  kropki: { dots: [] },
};

function deepCloneVariants(variants: VariantsState): VariantsState {
  return {
    evenodd: {
      even: variants.evenodd.even.map((cell) => ({ ...cell })),
      odd: variants.evenodd.odd.map((cell) => ({ ...cell })),
    },
    killer: {
      cages: variants.killer.cages.map((cage) => ({
        id: cage.id,
        sum: cage.sum,
        cells: cage.cells.map((cell) => ({ ...cell })),
      })),
    },
    thermo: {
      thermos: variants.thermo.thermos.map((thermo) => ({
        id: thermo.id,
        cells: thermo.cells.map((cell) => ({ ...cell })),
      })),
    },
    arrow: {
      arrows: variants.arrow.arrows.map((arrow) => ({
        id: arrow.id,
        circle: { ...arrow.circle },
        cells: arrow.cells.map((cell) => ({ ...cell })),
      })),
    },
    kropki: {
      dots: variants.kropki.dots.map((dot) => ({
        id: dot.id,
        c1: { ...dot.c1 },
        c2: { ...dot.c2 },
        type: dot.type,
      })),
    },
  };
}

function inferTheme(): ThemeMode {
  const persisted = localStorage.getItem("sudoku-theme");
  if (persisted === "light" || persisted === "dark") {
    return persisted;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeMode): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("sudoku-theme", theme);
}

function randomId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

export interface SudokuStore {
  grid: GridState;
  givenMask: boolean[][];
  variants: VariantsState;
  selectedCells: CellCoord[];
  activeCell: CellCoord | null;
  activeVariantTab: VariantTab;
  killerDraftSum: number;
  arrowDraftCircle: CellCoord | null;
  kropkiDraftType: KropkiDotType;
  solveStatus: SolveStatus;
  backendStatus: BackendStatus;
  solverMessage: string;
  solvedGrid: GridState | null;
  originalGridBeforeSolve: GridState | null;
  showComparison: boolean;
  theme: ThemeMode;
  toasts: ToastMessage[];

  setCellValue: (cell: CellCoord, value: Digit) => void;
  setActiveCell: (cell: CellCoord | null) => void;
  selectSingleCell: (cell: CellCoord) => void;
  toggleSelectedCell: (cell: CellCoord) => void;
  selectRectangleTo: (cell: CellCoord) => void;
  clearSelection: () => void;

  toggleGivenOnSelection: () => void;

  setActiveVariantTab: (tab: VariantTab) => void;
  setKillerDraftSum: (sum: number) => void;
  setArrowDraftCircle: (circle: CellCoord | null) => void;
  setKropkiDraftType: (dotType: KropkiDotType) => void;

  assignSelectedToEvenOdd: (kind: "even" | "odd") => void;
  removeEvenOddCell: (kind: "even" | "odd", cell: CellCoord) => void;
  clearEvenOdd: () => void;

  addKillerCageFromSelection: () => void;
  removeKillerCage: (id: string) => void;
  clearKiller: () => void;

  addThermoFromSelection: () => void;
  removeThermo: (id: string) => void;
  clearThermo: () => void;

  addArrowFromSelection: () => void;
  removeArrow: (id: string) => void;
  clearArrow: () => void;

  addKropkiFromSelection: () => void;
  removeKropkiDot: (id: string) => void;
  clearKropki: () => void;

  resetVariants: () => void;
  clearBoard: () => void;
  loadFromExternalPayload: (grid: GridState, variants: VariantsState, sourceTag?: string) => void;

  setBackendStatus: (status: BackendStatus) => void;
  setSolveState: (status: SolveStatus, response?: SolverResponse) => void;
  toggleComparison: () => void;

  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
}

export const useSudokuStore = create<SudokuStore>((set, get) => {
  const initialTheme = inferTheme();
  applyTheme(initialTheme);

  return {
    grid: createEmptyGrid(),
    givenMask: createEmptyMask(),
    variants: deepCloneVariants(defaultVariants),
    selectedCells: [],
    activeCell: null,
    activeVariantTab: "evenodd",
    killerDraftSum: 10,
    arrowDraftCircle: null,
    kropkiDraftType: "b",
    solveStatus: "idle",
    backendStatus: "checking",
    solverMessage: "Ready",
    solvedGrid: null,
    originalGridBeforeSolve: null,
    showComparison: false,
    theme: initialTheme,
    toasts: [],

    setCellValue: (cell, value) =>
      set((state) => {
        if (state.givenMask[cell.row][cell.col]) {
          return state;
        }

        const nextGrid = cloneGrid(state.grid);
        nextGrid[cell.row][cell.col] = value;

        return {
          ...state,
          grid: nextGrid,
          solveStatus: state.solveStatus === "solving" ? "solving" : "idle",
          solvedGrid: null,
          solverMessage: "Input updated",
        };
      }),

    setActiveCell: (cell) => set({ activeCell: cell }),

    selectSingleCell: (cell) =>
      set({
        selectedCells: [cell],
        activeCell: cell,
      }),

    toggleSelectedCell: (cell) =>
      set((state) => {
        const key = coordKey(cell);
        const map = new Map(state.selectedCells.map((entry) => [coordKey(entry), entry]));
        if (map.has(key)) {
          map.delete(key);
        } else {
          map.set(key, cell);
        }

        return {
          selectedCells: Array.from(map.values()),
          activeCell: cell,
        };
      }),

    selectRectangleTo: (cell) =>
      set((state) => {
        if (!state.activeCell) {
          return {
            selectedCells: [cell],
            activeCell: cell,
          };
        }

        const minRow = Math.min(state.activeCell.row, cell.row);
        const maxRow = Math.max(state.activeCell.row, cell.row);
        const minCol = Math.min(state.activeCell.col, cell.col);
        const maxCol = Math.max(state.activeCell.col, cell.col);

        const cells: CellCoord[] = [];
        for (let row = minRow; row <= maxRow; row += 1) {
          for (let col = minCol; col <= maxCol; col += 1) {
            cells.push({ row, col });
          }
        }

        return { selectedCells: cells };
      }),

    clearSelection: () => set({ selectedCells: [] }),

    toggleGivenOnSelection: () =>
      set((state) => {
        if (state.selectedCells.length === 0) {
          return state;
        }

        const nextMask = cloneMask(state.givenMask);
        for (const cell of state.selectedCells) {
          nextMask[cell.row][cell.col] = !nextMask[cell.row][cell.col];
        }

        return { givenMask: nextMask };
      }),

    setActiveVariantTab: (tab) => set({ activeVariantTab: tab }),
    setKillerDraftSum: (sum) => set({ killerDraftSum: Math.max(1, Math.floor(sum) || 1) }),
    setArrowDraftCircle: (circle) => set({ arrowDraftCircle: circle }),
    setKropkiDraftType: (dotType) => set({ kropkiDraftType: dotType }),

    assignSelectedToEvenOdd: (kind) =>
      set((state) => {
        if (state.selectedCells.length === 0) return state;

        const incoming = uniqueCells(state.selectedCells);
        const keySet = new Set(incoming.map(coordKey));

        const keepEven =
          kind === "even"
            ? [...state.variants.evenodd.even, ...incoming]
            : state.variants.evenodd.even.filter((cell) => !keySet.has(coordKey(cell)));

        const keepOdd =
          kind === "odd"
            ? [...state.variants.evenodd.odd, ...incoming]
            : state.variants.evenodd.odd.filter((cell) => !keySet.has(coordKey(cell)));

        return {
          variants: {
            ...state.variants,
            evenodd: {
              even: uniqueCells(keepEven),
              odd: uniqueCells(keepOdd),
            },
          },
        };
      }),

    removeEvenOddCell: (kind, target) =>
      set((state) => ({
        variants: {
          ...state.variants,
          evenodd: {
            ...state.variants.evenodd,
            [kind]: state.variants.evenodd[kind].filter((cell) => !areSameCell(cell, target)),
          },
        },
      })),

    clearEvenOdd: () =>
      set((state) => ({
        variants: {
          ...state.variants,
          evenodd: { even: [], odd: [] },
        },
      })),

    addKillerCageFromSelection: () =>
      set((state) => {
        const cells = uniqueCells(state.selectedCells);
        if (cells.length === 0) return state;

        return {
          variants: {
            ...state.variants,
            killer: {
              cages: [
                ...state.variants.killer.cages,
                {
                  id: randomId("cage"),
                  sum: Math.max(1, state.killerDraftSum),
                  cells,
                },
              ],
            },
          },
        };
      }),

    removeKillerCage: (id) =>
      set((state) => ({
        variants: {
          ...state.variants,
          killer: {
            cages: state.variants.killer.cages.filter((cage) => cage.id !== id),
          },
        },
      })),

    clearKiller: () =>
      set((state) => ({
        variants: {
          ...state.variants,
          killer: { cages: [] },
        },
      })),

    addThermoFromSelection: () =>
      set((state) => {
        const cells = uniqueCells(state.selectedCells);
        if (cells.length === 0) return state;

        return {
          variants: {
            ...state.variants,
            thermo: {
              thermos: [...state.variants.thermo.thermos, { id: randomId("thermo"), cells }],
            },
          },
        };
      }),

    removeThermo: (id) =>
      set((state) => ({
        variants: {
          ...state.variants,
          thermo: {
            thermos: state.variants.thermo.thermos.filter((thermo) => thermo.id !== id),
          },
        },
      })),

    clearThermo: () =>
      set((state) => ({
        variants: {
          ...state.variants,
          thermo: { thermos: [] },
        },
      })),

    addArrowFromSelection: () =>
      set((state) => {
        const circle = state.arrowDraftCircle;
        if (!circle) return state;

        const body = state.selectedCells.filter((cell) => !areSameCell(cell, circle));

        if (body.length === 0) {
          return state;
        }

        const nextArrow: ArrowConstraint = {
          id: randomId("arrow"),
          circle,
          cells: uniqueCells(body),
        };

        return {
          variants: {
            ...state.variants,
            arrow: {
              arrows: [...state.variants.arrow.arrows, nextArrow],
            },
          },
        };
      }),

    removeArrow: (id) =>
      set((state) => ({
        variants: {
          ...state.variants,
          arrow: { arrows: state.variants.arrow.arrows.filter((arrow) => arrow.id !== id) },
        },
      })),

    clearArrow: () =>
      set((state) => ({
        variants: {
          ...state.variants,
          arrow: { arrows: [] },
        },
        arrowDraftCircle: null,
      })),

    addKropkiFromSelection: () =>
      set((state) => {
        if (state.selectedCells.length !== 2) {
          return state;
        }

        const [c1, c2] = state.selectedCells;
        const nextDot: KropkiDot = {
          id: randomId("dot"),
          c1,
          c2,
          type: state.kropkiDraftType,
        };

        return {
          variants: {
            ...state.variants,
            kropki: {
              dots: [...state.variants.kropki.dots, nextDot],
            },
          },
        };
      }),

    removeKropkiDot: (id) =>
      set((state) => ({
        variants: {
          ...state.variants,
          kropki: {
            dots: state.variants.kropki.dots.filter((dot) => dot.id !== id),
          },
        },
      })),

    clearKropki: () =>
      set((state) => ({
        variants: {
          ...state.variants,
          kropki: { dots: [] },
        },
      })),

    resetVariants: () =>
      set({
        variants: deepCloneVariants(defaultVariants),
        arrowDraftCircle: null,
        selectedCells: [],
      }),

    clearBoard: () =>
      set({
        grid: createEmptyGrid(),
        givenMask: createEmptyMask(),
        selectedCells: [],
        activeCell: null,
        solvedGrid: null,
        originalGridBeforeSolve: null,
        solveStatus: "idle",
        solverMessage: "Board cleared",
      }),

    loadFromExternalPayload: (grid, variants, sourceTag) =>
      set({
        grid: cloneGrid(grid),
        givenMask: grid.map((row) => row.map((value) => value !== 0)),
        variants: deepCloneVariants(variants),
        selectedCells: [],
        activeCell: null,
        solvedGrid: null,
        originalGridBeforeSolve: null,
        solveStatus: "idle",
        solverMessage: sourceTag ? `Loaded from ${sourceTag}` : "Loaded payload",
      }),

    setBackendStatus: (status) => set({ backendStatus: status }),

    setSolveState: (status, response) =>
      set((state) => {
        if (!response) {
          return { solveStatus: status };
        }

        if (response.status === "solved") {
          return {
            solveStatus: "solved",
            solvedGrid: response.grid as GridState,
            originalGridBeforeSolve: cloneGrid(state.grid),
            solverMessage: "Puzzle solved successfully",
          };
        }

        if (response.status === "no_solution") {
          return {
            solveStatus: "no_solution",
            solvedGrid: null,
            originalGridBeforeSolve: cloneGrid(state.grid),
            solverMessage: "No solution found for this configuration",
          };
        }

        return {
          solveStatus: "error",
          solvedGrid: null,
          solverMessage: response.message,
        };
      }),

    toggleComparison: () => set((state) => ({ showComparison: !state.showComparison })),

    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
    },

    toggleTheme: () => {
      const nextTheme: ThemeMode = get().theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      set({ theme: nextTheme });
    },

    pushToast: (toast) =>
      set((state) => ({
        toasts: [...state.toasts, { ...toast, id: randomId("toast") }],
      })),

    dismissToast: (id) =>
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      })),
  };
});

export function getSelectedCellSet(selectedCells: CellCoord[]): Set<string> {
  return new Set(selectedCells.map(coordKey));
}

export function parseCellList(keys: string[]): CellCoord[] {
  return keys.map(parseCoordKey);
}
