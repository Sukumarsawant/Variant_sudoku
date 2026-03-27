#include "thermo.h"

static vector<vector<pair<int,int>>> thermo;
static vector<vector<pair<int,int>>> thermo_filler(N, vector<pair<int,int>>(N, {-1,-1}));

void setThermo(vector<vector<pair<int,int>>> inputThermo) {
    thermo = inputThermo;
    for(int i = 0; i < (int)thermo.size(); ++i)
        for(int pos = 0; pos < (int)thermo[i].size(); ++pos) {
            auto [r,c] = thermo[i][pos];
            thermo_filler[r][c] = {i, pos};
        }
}

void resetThermo() {
    thermo.clear();
    for(auto& row : thermo_filler)
        fill(row.begin(), row.end(), make_pair(-1,-1));
}

bool thermoCheck(int r, int c, int val) {
    auto [id, pos] = thermo_filler[r][c];
    if(id == -1) return true;
    auto& seq = thermo[id];
    for(int i = 0; i < pos; ++i) {
        auto [cr,cc] = seq[i];
        if(grid[cr][cc] != 0 && grid[cr][cc] >= val) return false;
    }
    for(int i = pos+1; i < (int)seq.size(); ++i) {
        auto [cr,cc] = seq[i];
        if(grid[cr][cc] != 0 && grid[cr][cc] <= val) return false;
    }
    return true;
}
