# Variant Sudoku Solver

A full-stack Sudoku solver that supports classic Sudoku plus multiple variants:

- Even/Odd
- Killer
- Thermo
- Arrow
- Kropki

The project includes:

- A C++ backend solver (CLI + HTTP server)
- A React frontend for puzzle entry, constraint marking, and solve visualization
- Raw prototype implementations for each variant before modularization

## Core Solving Idea

The common solving logic is backtracking on top of classic Sudoku rules, then extended with variant-specific rules.

### High-level flow

1. Take the given puzzle input and keep pre-filled cells fixed.
2. Find the next empty cell.
3. Try values `1..9` one by one.
4. For each candidate value:
	 - Check classic Sudoku validity (row, column, 3x3 box).
	 - Check active variant constraints (Even/Odd, Killer, Thermo, Arrow, Kropki).
5. If valid, place the value and recurse to the next empty cell.
6. If recursion fails, undo the value (backtrack) and try the next candidate.
7. The first complete assignment that passes all checks is returned as the solution.

In short: classic rules are always enforced, and each variant adds extra checks to the same search path.

### Why this works

Backtracking explores a search tree of candidate assignments. Invalid branches are pruned early by `isValid(...)` and variant checks, which keeps the solver correct and efficient for typical 9x9 puzzles.

## Code Architecture

## 1) Common solver path

- `isValid(r, c, fill)` in `backend/solver.cpp`
	- Runs classic checks first (row/column/box)
	- Then runs every active variant check function
- `solve()` in `backend/solver.cpp`
	- Recursive DFS + backtracking over empty cells (`0` means empty)

## 2) Variant extensions

Each variant is implemented as:

- `setVariant(...)` to load constraints from input
- `resetVariant()` to clear state between solves
- `variantCheck(r, c, val)` to validate candidate placement

Files:

- `backend/evenodd.cpp`, `backend/evenodd.h`
- `backend/killer.cpp`, `backend/killer.h`
- `backend/thermo.cpp`, `backend/thermo.h`
- `backend/arrow.cpp`, `backend/arrow.h`
- `backend/kropki.cpp`, `backend/kropki.h`

This keeps classic solving central while variants are "plug-in" rules layered on top.

## 3) Executables

- `backend/main.cpp`: CLI JSON input/output solver
- `backend/server.cpp`: HTTP API server (`POST /solve`) for frontend

## 4) Raw implementations

Initial/prototype variant-specific logic is available in:

- `raw_implementation/classic.cpp`
- `raw_implementation/evenOdd.cpp`
- `raw_implementation/killer.cpp`
- `raw_implementation/thermo.cpp`
- `raw_implementation/arrow.cpp`
- `raw_implementation/kropki.cpp`

Then the production code was split into modular `.h + .cpp` units for CMake builds.

## Repository Layout

```text
.
├─ raw_implementation/
├─ sudoku/
│  ├─ backend/
│  │  ├─ common.h
│  │  ├─ solver.cpp / solver.h
│  │  ├─ <variant>.cpp / <variant>.h
│  │  ├─ main.cpp
│  │  ├─ server.cpp
│  │  └─ CmakeLists.txt
│  └─ frontend/
│     ├─ src/App.js
│     ├─ src/app.css
│     └─ package.json
└─ readme.md
```

## Build and Run

## Backend (C++)

From `sudoku/backend`:

```bash
cmake -S . -B build
cmake --build build
```

Run server:

```bash
./build/sudoku_server
```

Server listens on `http://localhost:8080`.

## Frontend (React)

From `sudoku/frontend`:

```bash
npm install
npm start
```

Frontend runs on `http://localhost:3000` and calls backend `POST /solve`.

## API Contract

Endpoint: `POST /solve`

Request shape:

```json
{
	"grid": [[0,0,0,0,0,0,0,0,0], ... 9 rows total ...],
	"variants": {
		"evenodd": {"even": [[r,c]], "odd": [[r,c]]},
		"killer": {"cages": [{"sum": 10, "cells": [[r,c],[r,c]]}]},
		"thermo": {"thermos": [[[r,c],[r,c],[r,c]]]},
		"arrow": {"arrows": [{"circle": [r,c], "cells": [[r,c],[r,c]]}]},
		"kropki": {"dots": [{"c1": [r,c], "c2": [r,c], "type": "b"}]}
	}
}
```

Response:

```json
{
	"status": "solved",
	"grid": [[...solved 9x9...]]
}
```

Or:

```json
{"status": "no_solution"}
```

## Frontend Notes

- Supports manual cell entry (`1-9`)
- Supports import of 81-digit text (`0` = empty cell)
- Supports visual marking/creation of all variant constraints
- Sends constraints + grid to backend and renders solution


