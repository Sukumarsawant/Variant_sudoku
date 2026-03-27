#include <bits/stdc++.h>
#define f first
#define s second
using namespace std;

const int n = 9;

vector<vector<int>> grid(n, vector<int>(n, 0));

// ----- Thermo ----------------------------------------
vector<vector<pair<int,int>>> thermo; // each thermo = ordered list of cells
vector<vector<pair<int,int>>> thermo_filler(n, vector<pair<int,int>>(n, {-1,-1}));

void setThermo(vector<vector<pair<int,int>>> inputThermo) {
    thermo = inputThermo;
    for(int i = 0; i < (int)thermo.size(); ++i){
        for(int pos = 0; pos < (int)thermo[i].size(); ++pos) {
            auto [r,c] = thermo[i][pos];
            thermo_filler[r][c] = {i, pos};
        }
    }
}

bool thermoCheck(int r, int c, int val) {
    auto [id, pos] = thermo_filler[r][c];
    if(id == -1) return true;

    auto seq = thermo[id];

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
// -------------------------------------------------------------

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

// bulb first, tip last
setThermo({
    {{0,0},{0,1},{0,2},{0,3}},  // thermo 1
    {{4,4},{5,4},{6,4}}         // thermo 2
});

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

    setThermo({{15, {{0,0},{0,1},{0,2}}}, {7, {{1,0},{2,0}}}});



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