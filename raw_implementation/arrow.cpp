#include <bits/stdc++.h>
#define f first
#define s second
using namespace std;

const int n = 9;

vector<vector<int>> grid(n, vector<int>(n, 0));

// ── Arrow ─────────────────────────────────────────────
struct Arrow {
    pair<int,int> circle;           // the circle cell
    vector<pair<int,int>> cells;    // arrow cells (can repeat values)
};

vector<Arrow> arrows;

// -1 = not on any arrow
// for circle cells: store {arrowIndex, -1}
// for arrow cells:  store {arrowIndex, position}
vector<vector<pair<int,int>>> arrow_filler(n, vector<pair<int,int>>(n, {-1,-1}));

void setArrow(vector<Arrow> inputArrows) {
    arrows = inputArrows;
    for(int i = 0; i < (int)arrows.size(); ++i) {
        auto [cr,cc] = arrows[i].circle;
        arrow_filler[cr][cc] = {i, -1}; // -1 marks it as circle

        for(int pos = 0; pos < (int)arrows[i].cells.size(); ++pos) {
            auto [r,c] = arrows[i].cells[pos];
            arrow_filler[r][c] = {i, pos};
        }
    }
}

bool arrowCheck(int r, int c, int val) {
    auto [id, pos] = arrow_filler[r][c];
    if(id == -1) return true; // not part of any arrow

    Arrow& arr = arrows[id];
    auto [cr,cc] = arr.circle;
    int circleVal = (r==cr && c==cc) ? val : grid[cr][cc];

    // sum up arrow cells
    int currSum = 0, filled = 0;
    for(auto [ar,ac] : arr.cells) {
        int v = (ar==r && ac==c) ? val : grid[ar][ac];
        if(v != 0) { currSum += v; filled++; }
    }

    // if circle not filled yet, just check sum doesnt exceed 9
    if(circleVal == 0) return currSum < 9;

    // circle is filled check constraints
    if(currSum > circleVal) return false; // already exceeded
    if(filled == (int)arr.cells.size() && currSum != circleVal) return false; // all filled, wrong sum

    return true;
}
// ─────────────────────────────────────────────────────

bool isValid(int r, int c, int fill){
    // Row check
    if(count(grid[r].begin(),grid[r].end(),fill)) return false;
    // Col check
    for(int i = 0; i < n; ++i) if(grid[i][c]==fill) return false;
    // Quad check
    pair<int,int> row = {r/3*3, r/3*3+2};
    pair<int,int> col = {c/3*3, c/3*3+2};
    for(int i = row.f; i <= row.s; ++i)
        for(int j = col.f; j <= col.s; ++j)
            if(grid[i][j]==fill) return false;

    return true;
}

bool func() {
    for(int r = 0; r < n; ++r)
        for(int c = 0; c < n; ++c) {
            if(grid[r][c] != 0) continue;
            for(int fill = 1; fill <= 9; ++fill)
                if(isValid(r, c, fill)) {
                    grid[r][c] = fill;
                    if(func()) return true;
                    grid[r][c] = 0;
                }
            return false;
        }
    return true;
}

signed main() {
    for(int i = 0; i < n; ++i)
        for(int j = 0; j < n; ++j)
            cin >> grid[i][j];

    cout << endl;
    if(func()) {
        for(int i = 0; i < n; ++i) {
            for(int j = 0; j < n; ++j)
                cout << grid[i][j] << " ";
            cout << "\n";
        }
    } else {
        cout << "No solution\n";
    }
}