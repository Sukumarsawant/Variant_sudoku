#include "Solver.h"
#include "evenodd.h"
#include "killer.h"
#include "thermo.h"
#include "arrow.h"
#include "kropki.h"

bool isValid(int r, int c, int fill) {
    // ── Classic checks (always run) ───────────────────
    // Row
    if(count(grid[r].begin(),grid[r].end(),fill)) return false;
    // Col
    for(int i = 0; i < N; ++i) if(grid[i][c]==fill) return false;
    // Quad
    int br = r/3*3, bc = c/3*3;
    for(int i = br; i < br+3; ++i)
        for(int j = bc; j < bc+3; ++j)
            if(grid[i][j]==fill) return false;

    // ── Variant checks (only active if setter was called) ─
    if(!evenOddCheck(r, c, fill)) return false;
    if(!killerCheck(r, c, fill))  return false;
    if(!thermoCheck(r, c, fill))  return false;
    if(!arrowCheck(r, c, fill))   return false;
    if(!kropkiCheck(r, c, fill))  return false;

    return true;
}

bool solve() {
    for(int r = 0; r < N; ++r)
        for(int c = 0; c < N; ++c) {
            if(grid[r][c] != 0) continue;
            for(int fill = 1; fill <= 9; ++fill)
                if(isValid(r, c, fill)) {
                    grid[r][c] = fill;
                    if(solve()) return true;
                    grid[r][c] = 0;
                }
            return false;
        }
    return true;
}