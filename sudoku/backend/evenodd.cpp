#include "evenodd.h"

static vector<vector<int>> cellType(N, vector<int>(N, 0));

void setEvenOdd(vector<pair<int,int>> evenCells,
                vector<pair<int,int>> oddCells) {
    for(auto [r,c] : evenCells) cellType[r][c] = 2;
    for(auto [r,c] : oddCells)  cellType[r][c] = 1;
}

void resetEvenOdd() {
    for(auto& row : cellType) fill(row.begin(), row.end(), 0);
}

bool evenOddCheck(int r, int c, int val) {
    if(cellType[r][c] == 2 && val % 2 != 0) return false;
    if(cellType[r][c] == 1 && val % 2 == 0) return false;
    return true;
}
