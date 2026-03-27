#include <bits/stdc++.h>
#define f first
#define s second
using namespace std;

const int n = 9;

vector<vector<int>> grid(n, vector<int>(n, 0));

// ── Kropki ────────────────────────────────────────────
struct Dot {
    pair<int,int> c1, c2;  // two cells
    char type;             // 'b' = black, 'w' = white
};

vector<Dot> dots;

// each cell stores list of dot indices it belongs to
vector<vector<vector<int>>> kropki_filler(n, vector<vector<int>>(n));

void setKropki(vector<Dot> inputDots) {
    dots = inputDots;
    for(int i = 0; i < (int)dots.size(); ++i) {
        auto [r1,c1] = dots[i].c1;
        auto [r2,c2] = dots[i].c2;
        kropki_filler[r1][c1].push_back(i);
        kropki_filler[r2][c2].push_back(i);
    }
}

bool kropkiCheck(int r, int c, int val) {
    for(int id : kropki_filler[r][c]) {
        Dot& dot = dots[id];

        // find neighbour
        auto [nr,nc] = (dot.c1 == make_pair(r,c)) ? dot.c2 : dot.c1;
        int nval = grid[nr][nc];

        if(nval == 0) continue; // neighbour not filled yet, skip

        if(dot.type == 'b') {
            // one must be double the other
            if(val != 2*nval && nval != 2*val) return false;
        } else {
            // must be consecutive
            if(abs(val - nval) != 1) return false;
        }
    }
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