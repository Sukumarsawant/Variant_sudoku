#include <bits/stdc++.h>
#define f first
#define s second
using namespace std;

const int n = 9;

vector<vector<int>> grid(n, vector<int>(n, 0));

// ----- Even/Odd ----------------------------------------
// 0 = no constraint, 1 = odd, 2 = even
vector<vector<int>> cellType(n, vector<int>(n, 0));
//setter 
void setEvenOdd(vector<pair<int,int>> evenCells,
                vector<pair<int,int>> oddCells) {
    for(auto [r,c] : evenCells) cellType[r][c] = 2;
    for(auto [r,c] : oddCells)  cellType[r][c] = 1;
}

bool evenOddCheck(int r, int c, int val) {
    if(cellType[r][c] == 2 && val % 2 != 0) return false;
    if(cellType[r][c] == 1 && val % 2 == 0) return false;
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

    // Variant checks
    if(!evenOddCheck(r, c, fill)) return false;

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

    // Even/Odd setup hardcoded for now
    setEvenOdd({{0,2},{1,4}},   // even cells
               {{0,0},{2,3}});  // odd cells

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