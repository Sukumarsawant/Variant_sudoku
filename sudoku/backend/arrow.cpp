#include "arrow.h"

static vector<Arrow> arrows;
static vector<vector<pair<int,int>>> arrow_filler(N, vector<pair<int,int>>(N, {-1,-1}));

void setArrow(vector<Arrow> inputArrows) {
    arrows = inputArrows;
    for(int i = 0; i < (int)arrows.size(); ++i) {
        auto [cr,cc] = arrows[i].circle;
        arrow_filler[cr][cc] = {i, -1};
        for(int pos = 0; pos < (int)arrows[i].cells.size(); ++pos) {
            auto [r,c] = arrows[i].cells[pos];
            arrow_filler[r][c] = {i, pos};
        }
    }
}

void resetArrow() {
    arrows.clear();
    for(auto& row : arrow_filler)
        fill(row.begin(), row.end(), make_pair(-1,-1));
}

bool arrowCheck(int r, int c, int val) {
    auto [id, pos] = arrow_filler[r][c];
    if(id == -1) return true;
    Arrow& arr = arrows[id];
    auto [cr,cc] = arr.circle;
    int circleVal = (r==cr && c==cc) ? val : grid[cr][cc];
    int currSum = 0, filled = 0;
    for(auto [ar,ac] : arr.cells) {
        int v = (ar==r && ac==c) ? val : grid[ar][ac];
        if(v != 0) { currSum += v; filled++; }
    }
    if(circleVal == 0) return currSum <= 9;
    if(currSum > circleVal) return false;
    if(filled == (int)arr.cells.size() && currSum != circleVal) return false;
    return true;
}
