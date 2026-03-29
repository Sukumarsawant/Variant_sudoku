import type { CellCoord } from "../../types/sudoku";

export function coordKey(cell: CellCoord): string {
  return `${cell.row}:${cell.col}`;
}

export function parseCoordKey(key: string): CellCoord {
  const [row, col] = key.split(":").map(Number);
  return { row, col };
}

export function inBounds(cell: CellCoord): boolean {
  return cell.row >= 0 && cell.row < 9 && cell.col >= 0 && cell.col < 9;
}

export function areSameCell(a: CellCoord, b: CellCoord): boolean {
  return a.row === b.row && a.col === b.col;
}

export function isAdjacent(a: CellCoord, b: CellCoord): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

export function coordLabel(cell: CellCoord): string {
  return `r${cell.row + 1}c${cell.col + 1}`;
}

export function uniqueCells(cells: CellCoord[]): CellCoord[] {
  const seen = new Set<string>();
  const result: CellCoord[] = [];

  for (const cell of cells) {
    const key = coordKey(cell);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(cell);
    }
  }

  return result;
}
