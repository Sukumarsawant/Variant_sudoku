#include "killer.h"

static vector<pair<int,vector<pair<int,int>>>> cage;
static vector<vector<int>> cage_filler(N, vector<int>(N, -1));

void setKiller(vector<pair<int,vector<pair<int,int>>>> inputCage) {
    cage = inputCage;
    for(int i = 0; i < (int)cage.size(); ++i)
        for(auto [r,c] : cage[i].s)
            cage_filler[r][c] = i;
}

void resetKiller() {
    cage.clear();
    for(auto& row : cage_filler) fill(row.begin(), row.end(), -1);
}

bool killerCheck(int r, int c, int val) {
    int id = cage_filler[r][c];
    if(id == -1) return true;
    auto& temp = cage[id];
    for(auto [cr,cc] : temp.s)
        if(grid[cr][cc] == val) return false;
    int filled = 0, currSum = 0;
    for(auto [cr,cc] : temp.s) {
        int v = (cr==r && cc==c) ? val : grid[cr][cc];
        if(v != 0) { currSum += v; filled++; }
    }
    if(currSum > temp.f) return false;
    if(filled == (int)temp.s.size() && currSum != temp.f) return false;
    return true;
}
