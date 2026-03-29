import type {
  ArrowConstraint,
  CellCoord,
  GridState,
  KillerCage,
  SolverRequest,
  VariantsState,
} from "../../types/sudoku";
import { createEmptyGrid } from "./grid";

function randomId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function fromTuple(tuple: [number, number]): CellCoord {
  return { row: tuple[0], col: tuple[1] };
}

export function requestToInternal(payload: SolverRequest): { grid: GridState; variants: VariantsState } {
  const safeGrid = createEmptyGrid();
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      safeGrid[r][c] = (payload.grid?.[r]?.[c] ?? 0) as GridState[number][number];
    }
  }

  const cages: KillerCage[] = (payload.variants.killer?.cages ?? []).map((cage) => ({
    id: randomId("cage"),
    sum: cage.sum,
    cells: cage.cells.map(fromTuple),
  }));

  const arrows: ArrowConstraint[] = (payload.variants.arrow?.arrows ?? []).map((arrow) => ({
    id: randomId("arrow"),
    circle: fromTuple(arrow.circle),
    cells: arrow.cells.map(fromTuple),
  }));

  return {
    grid: safeGrid,
    variants: {
      evenodd: {
        even: (payload.variants.evenodd?.even ?? []).map(fromTuple),
        odd: (payload.variants.evenodd?.odd ?? []).map(fromTuple),
      },
      killer: { cages },
      thermo: {
        thermos: (payload.variants.thermo?.thermos ?? []).map((thermo) => ({
          id: randomId("thermo"),
          cells: thermo.map(fromTuple),
        })),
      },
      arrow: { arrows },
      kropki: {
        dots: (payload.variants.kropki?.dots ?? []).map((dot) => ({
          id: randomId("dot"),
          c1: fromTuple(dot.c1),
          c2: fromTuple(dot.c2),
          type: dot.type,
        })),
      },
    },
  };
}

export function parseJsonPayload(rawText: string): SolverRequest {
  const parsed = JSON.parse(rawText) as SolverRequest;

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Imported JSON is not an object.");
  }
  if (!Array.isArray(parsed.grid)) {
    throw new Error("Imported JSON must include a grid array.");
  }
  if (!parsed.variants || typeof parsed.variants !== "object") {
    throw new Error("Imported JSON must include a variants object.");
  }

  return parsed;
}
