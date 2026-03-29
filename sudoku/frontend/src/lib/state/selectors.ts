import type { CellCoord, VariantsState } from "../../types/sudoku";
import { coordKey } from "../utils/coords";

export interface VariantCounts {
  even: number;
  odd: number;
  killer: number;
  thermo: number;
  arrow: number;
  kropki: number;
}

export function getVariantCounts(variants: VariantsState): VariantCounts {
  return {
    even: variants.evenodd.even.length,
    odd: variants.evenodd.odd.length,
    killer: variants.killer.cages.length,
    thermo: variants.thermo.thermos.length,
    arrow: variants.arrow.arrows.length,
    kropki: variants.kropki.dots.length,
  };
}

export function buildCellVariantTags(variants: VariantsState): Map<string, string[]> {
  const map = new Map<string, string[]>();

  const add = (cell: CellCoord, tag: string) => {
    const key = coordKey(cell);
    const tags = map.get(key) ?? [];
    if (!tags.includes(tag)) {
      tags.push(tag);
      map.set(key, tags);
    }
  };

  variants.evenodd.even.forEach((cell) => add(cell, "E"));
  variants.evenodd.odd.forEach((cell) => add(cell, "O"));
  variants.killer.cages.forEach((cage) => cage.cells.forEach((cell) => add(cell, "K")));
  variants.thermo.thermos.forEach((thermo) => thermo.cells.forEach((cell) => add(cell, "T")));
  variants.arrow.arrows.forEach((arrow) => {
    add(arrow.circle, "A");
    arrow.cells.forEach((cell) => add(cell, "a"));
  });
  variants.kropki.dots.forEach((dot) => {
    add(dot.c1, dot.type === "b" ? "B" : "W");
    add(dot.c2, dot.type === "b" ? "B" : "W");
  });

  return map;
}
