import type {
  ArrowConstraint,
  CellCoord,
  KropkiDot,
  SolverRequest,
  VariantsState,
} from "../../types/sudoku";

function toTuple(cell: CellCoord): [number, number] {
  return [cell.row, cell.col];
}

function cleanArrow(arrows: ArrowConstraint[]) {
  return arrows
    .filter((arrow) => arrow.cells.length > 0)
    .map((arrow) => ({ circle: toTuple(arrow.circle), cells: arrow.cells.map(toTuple) }));
}

function cleanDots(dots: KropkiDot[]) {
  return dots.map((dot) => ({ c1: toTuple(dot.c1), c2: toTuple(dot.c2), type: dot.type }));
}

export function buildSolverRequest(grid: number[][], variants: VariantsState): SolverRequest {
  const payload: SolverRequest = {
    grid,
    variants: {},
  };

  if (variants.evenodd.even.length || variants.evenodd.odd.length) {
    payload.variants.evenodd = {
      even: variants.evenodd.even.map(toTuple),
      odd: variants.evenodd.odd.map(toTuple),
    };
  }

  if (variants.killer.cages.length) {
    payload.variants.killer = {
      cages: variants.killer.cages.map((cage) => ({
        sum: cage.sum,
        cells: cage.cells.map(toTuple),
      })),
    };
  }

  if (variants.thermo.thermos.length) {
    payload.variants.thermo = {
      thermos: variants.thermo.thermos.map((thermo) => thermo.cells.map(toTuple)),
    };
  }

  if (variants.arrow.arrows.length) {
    payload.variants.arrow = {
      arrows: cleanArrow(variants.arrow.arrows),
    };
  }

  if (variants.kropki.dots.length) {
    payload.variants.kropki = {
      dots: cleanDots(variants.kropki.dots),
    };
  }

  return payload;
}
