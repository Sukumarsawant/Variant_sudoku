import type { Digit, GridState } from "../../types/sudoku";

export function createEmptyGrid(): GridState {
  return Array.from({ length: 9 }, () => Array<Digit>(9).fill(0));
}

export function createEmptyMask(): boolean[][] {
  return Array.from({ length: 9 }, () => Array<boolean>(9).fill(false));
}

export function cloneGrid(grid: GridState): GridState {
  return grid.map((row) => [...row] as Digit[]);
}

export function cloneMask(mask: boolean[][]): boolean[][] {
  return mask.map((row) => [...row]);
}

export function toDigit(value: string): Digit {
  if (value.trim() === "") return 0;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0;
  if (parsed < 0 || parsed > 9) return 0;
  return parsed as Digit;
}

export function isDigit(value: number): value is Digit {
  return Number.isInteger(value) && value >= 0 && value <= 9;
}
