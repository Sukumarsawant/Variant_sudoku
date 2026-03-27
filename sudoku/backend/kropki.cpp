#include "kropki.h"

static vector<Dot> dots;
static vector<vector<vector<int>>> kropki_filler(N, vector<vector<int>>(N));

void setKropki(vector<Dot> inputDots) {
    dots = inputDots;
    for(int i = 0; i < (int)dots.size(); ++i) {
        auto [r1,c1] = dots[i].c1;
        auto [r2,c2] = dots[i].c2;
        kropki_filler[r1][c1].push_back(i);
        kropki_filler[r2][c2].push_back(i);
    }
}

void resetKropki() {
    dots.clear();
    for(auto& row : kropki_filler)
        for(auto& cell : row)
            cell.clear();
}

bool kropkiCheck(int r, int c, int val) {
    for(int id : kropki_filler[r][c]) {
        Dot& dot = dots[id];
        auto [nr,nc] = (dot.c1 == make_pair(r,c)) ? dot.c2 : dot.c1;
        int nval = grid[nr][nc];
        if(nval == 0) continue;
        if(dot.type == 'b') {
            if(val != 2*nval && nval != 2*val) return false;
        } else {
            if(abs(val - nval) != 1) return false;
        }
    }
    return true;
}
