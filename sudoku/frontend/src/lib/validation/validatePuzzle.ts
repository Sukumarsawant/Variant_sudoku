import type { CellCoord, GridState, ValidationResult, VariantsState } from "../../types/sudoku";
import { areSameCell, coordKey, inBounds, isAdjacent } from "../utils/coords";

function pushUnique(list: string[], value: string): void {
  if (!list.includes(value)) list.push(value);
}

function scanGroupForConflicts(cells: CellCoord[], groups: Map<string, CellCoord[]>): void {
  for (const cell of cells) {
    const key = coordKey(cell);
    const existing = groups.get(key);
    if (existing) {
      existing.push(cell);
    } else {
      groups.set(key, [cell]);
    }
  }
}

export function computeGridConflicts(grid: GridState): Set<string> {
  const conflicts = new Set<string>();

  for (let row = 0; row < 9; row += 1) {
    const seen = new Map<number, number[]>();
    for (let col = 0; col < 9; col += 1) {
      const value = grid[row][col];
      if (value === 0) continue;
      const cols = seen.get(value) ?? [];
      cols.push(col);
      seen.set(value, cols);
    }

    for (const cols of seen.values()) {
      if (cols.length > 1) {
        cols.forEach((col) => conflicts.add(`${row}:${col}`));
      }
    }
  }

  for (let col = 0; col < 9; col += 1) {
    const seen = new Map<number, number[]>();
    for (let row = 0; row < 9; row += 1) {
      const value = grid[row][col];
      if (value === 0) continue;
      const rows = seen.get(value) ?? [];
      rows.push(row);
      seen.set(value, rows);
    }

    for (const rows of seen.values()) {
      if (rows.length > 1) {
        rows.forEach((row) => conflicts.add(`${row}:${col}`));
      }
    }
  }

  for (let boxRow = 0; boxRow < 3; boxRow += 1) {
    for (let boxCol = 0; boxCol < 3; boxCol += 1) {
      const seen = new Map<number, CellCoord[]>();

      for (let r = boxRow * 3; r < boxRow * 3 + 3; r += 1) {
        for (let c = boxCol * 3; c < boxCol * 3 + 3; c += 1) {
          const value = grid[r][c];
          if (value === 0) continue;
          const cells = seen.get(value) ?? [];
          cells.push({ row: r, col: c });
          seen.set(value, cells);
        }
      }

      for (const cells of seen.values()) {
        if (cells.length > 1) {
          cells.forEach((cell) => conflicts.add(coordKey(cell)));
        }
      }
    }
  }

  return conflicts;
}

function validateBounds(cells: CellCoord[], kind: string, errors: string[]): void {
  for (const cell of cells) {
    if (!inBounds(cell)) {
      pushUnique(errors, `${kind} contains out-of-bounds cell [${cell.row}, ${cell.col}].`);
    }
  }
}

export function validatePuzzle(grid: GridState, variants: VariantsState): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (grid.length !== 9 || grid.some((row) => row.length !== 9)) {
    errors.push("Grid must be exactly 9x9.");
  }

  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      const value = grid[r]?.[c];
      if (!Number.isInteger(value) || value < 0 || value > 9) {
        pushUnique(errors, `Grid has invalid value at r${r + 1}c${c + 1}. Allowed: 0-9.`);
      }
    }
  }

  const gridConflicts = computeGridConflicts(grid);
  if (gridConflicts.size > 0) {
    errors.push("Classic Sudoku duplicates detected in row, column, or 3x3 box.");
  }

  validateBounds(variants.evenodd.even, "Even marks", errors);
  validateBounds(variants.evenodd.odd, "Odd marks", errors);

  const evenMap = new Set(variants.evenodd.even.map(coordKey));
  for (const oddCell of variants.evenodd.odd) {
    if (evenMap.has(coordKey(oddCell))) {
      errors.push("A cell cannot be both even and odd.");
      break;
    }
  }

  const killerSeen = new Map<string, number>();
  variants.killer.cages.forEach((cage, index) => {
    if (cage.sum <= 0) {
      pushUnique(errors, `Killer cage ${index + 1} must have a positive sum.`);
    }
    if (cage.cells.length === 0) {
      pushUnique(errors, `Killer cage ${index + 1} has no cells.`);
    }

    validateBounds(cage.cells, `Killer cage ${index + 1}`, errors);

    const cageCellSet = new Set<string>();
    cage.cells.forEach((cell) => {
      const key = coordKey(cell);
      if (cageCellSet.has(key)) {
        pushUnique(warnings, `Killer cage ${index + 1} contains duplicate cells.`);
      }
      cageCellSet.add(key);

      const prev = killerSeen.get(key) ?? 0;
      killerSeen.set(key, prev + 1);
    });
  });

  for (const [key, count] of killerSeen.entries()) {
    if (count > 1) {
      pushUnique(warnings, `Killer overlap warning: cell ${key.replace(":", ",")} appears in multiple cages.`);
    }
  }

  variants.thermo.thermos.forEach((thermo, index) => {
    if (thermo.cells.length < 2) {
      pushUnique(errors, `Thermo path ${index + 1} must contain at least two cells.`);
    }
    validateBounds(thermo.cells, `Thermo path ${index + 1}`, errors);

    for (let i = 1; i < thermo.cells.length; i += 1) {
      if (!isAdjacent(thermo.cells[i - 1], thermo.cells[i])) {
        pushUnique(warnings, `Thermo ordering warning: path ${index + 1} has non-adjacent step ${i}.`);
      }
    }
  });

  variants.arrow.arrows.forEach((arrow, index) => {
    validateBounds([arrow.circle], `Arrow ${index + 1} circle`, errors);
    validateBounds(arrow.cells, `Arrow ${index + 1} body`, errors);

    if (arrow.cells.length === 0) {
      pushUnique(errors, `Arrow ${index + 1} requires at least one body cell.`);
    }

    if (arrow.cells.some((cell) => areSameCell(cell, arrow.circle))) {
      pushUnique(warnings, `Arrow ${index + 1} contains circle cell in body path.`);
    }
  });

  const dotPairs = new Set<string>();
  variants.kropki.dots.forEach((dot, index) => {
    validateBounds([dot.c1, dot.c2], `Kropki dot ${index + 1}`, errors);

    if (!isAdjacent(dot.c1, dot.c2)) {
      pushUnique(warnings, `Kropki warning: dot ${index + 1} connects non-adjacent cells.`);
    }

    const [a, b] = [coordKey(dot.c1), coordKey(dot.c2)].sort();
    const pairKey = `${a}|${b}`;

    if (dotPairs.has(pairKey)) {
      pushUnique(warnings, `Kropki warning: duplicate dot between ${a} and ${b}.`);
    }
    dotPairs.add(pairKey);
  });

  const variantOccupancy = new Map<string, string[]>();
  const markOccupancy = (cells: CellCoord[], tag: string): void => {
    for (const cell of cells) {
      const key = coordKey(cell);
      const entries = variantOccupancy.get(key) ?? [];
      entries.push(tag);
      variantOccupancy.set(key, entries);
    }
  };

  markOccupancy(variants.evenodd.even, "even");
  markOccupancy(variants.evenodd.odd, "odd");
  variants.killer.cages.forEach((cage) => markOccupancy(cage.cells, "killer"));
  variants.thermo.thermos.forEach((thermo) => markOccupancy(thermo.cells, "thermo"));
  variants.arrow.arrows.forEach((arrow) => {
    markOccupancy([arrow.circle], "arrow-circle");
    markOccupancy(arrow.cells, "arrow-body");
  });
  variants.kropki.dots.forEach((dot) => markOccupancy([dot.c1, dot.c2], "kropki"));

  for (const [key, tags] of variantOccupancy.entries()) {
    if (tags.length >= 4) {
      pushUnique(warnings, `Constraint overlap warning: cell ${key.replace(":", ",")} is used by ${tags.length} variant markers.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
