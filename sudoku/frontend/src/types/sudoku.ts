export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type GridState = Digit[][];

export interface CellCoord {
  row: number;
  col: number;
}

export type CoordTuple = [number, number];

export interface EvenOddConstraint {
  even: CellCoord[];
  odd: CellCoord[];
}

export interface KillerCage {
  id: string;
  sum: number;
  cells: CellCoord[];
}

export interface ThermoPath {
  id: string;
  cells: CellCoord[];
}

export interface ArrowConstraint {
  id: string;
  circle: CellCoord;
  cells: CellCoord[];
}

export type KropkiDotType = "b" | "w";

export interface KropkiDot {
  id: string;
  c1: CellCoord;
  c2: CellCoord;
  type: KropkiDotType;
}

export interface VariantsState {
  evenodd: EvenOddConstraint;
  killer: { cages: KillerCage[] };
  thermo: { thermos: ThermoPath[] };
  arrow: { arrows: ArrowConstraint[] };
  kropki: { dots: KropkiDot[] };
}

export interface SolverRequest {
  grid: number[][];
  variants: {
    evenodd?: {
      even: CoordTuple[];
      odd: CoordTuple[];
    };
    killer?: {
      cages: Array<{ sum: number; cells: CoordTuple[] }>;
    };
    thermo?: {
      thermos: CoordTuple[][];
    };
    arrow?: {
      arrows: Array<{ circle: CoordTuple; cells: CoordTuple[] }>;
    };
    kropki?: {
      dots: Array<{ c1: CoordTuple; c2: CoordTuple; type: KropkiDotType }>;
    };
  };
}

export type SolverResponse =
  | { status: "solved"; grid: number[][]; steps?: string[] }
  | { status: "no_solution"; steps?: string[] }
  | { status: "error"; message: string };

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export type SolveStatus = "idle" | "solving" | "solved" | "no_solution" | "error";

export type BackendStatus = "checking" | "online" | "offline";

export type ThemeMode = "light" | "dark";

export type VariantTab = "evenodd" | "killer" | "thermo" | "arrow" | "kropki";
