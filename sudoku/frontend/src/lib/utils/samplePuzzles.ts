import type { SolverRequest } from "../../types/sudoku";

export interface PuzzleSample {
  id: string;
  label: string;
  description: string;
  payload: SolverRequest;
}

export const puzzleSamples: PuzzleSample[] = [
  {
    id: "classic-baseline",
    label: "Classic Baseline",
    description: "A standard Sudoku puzzle to validate solver connectivity.",
    payload: {
      grid: [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
      ],
      variants: {},
    },
  },
  {
    id: "hybrid-even-thermo",
    label: "Hybrid Even/Odd + Thermo",
    description: "Demonstrates a mixed-variant payload for quick UI testing.",
    payload: {
      grid: [
        [0, 0, 0, 2, 0, 0, 0, 0, 8],
        [0, 0, 0, 0, 0, 6, 0, 0, 0],
        [0, 0, 8, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 9, 0, 0, 0, 0],
        [4, 0, 0, 0, 0, 0, 0, 0, 2],
        [0, 0, 0, 0, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 6, 0, 0],
        [0, 0, 0, 7, 0, 0, 0, 0, 0],
        [7, 0, 0, 0, 0, 1, 0, 0, 0],
      ],
      variants: {
        evenodd: {
          even: [
            [0, 3],
            [4, 0],
            [4, 8],
            [8, 0],
          ],
          odd: [
            [3, 4],
            [5, 4],
            [8, 5],
          ],
        },
        thermo: {
          thermos: [
            [
              [1, 1],
              [1, 2],
              [1, 3],
              [1, 4],
            ],
            [
              [6, 6],
              [5, 6],
              [4, 6],
              [3, 6],
            ],
          ],
        },
      },
    },
  },
];
