#include <bits/stdc++.h>
#define f first
#define s second
using namespace std;

const int n = 9;

vector<vector<int>> grid(n, vector<int>(n, 0));

// ----- Killer ----------------------------------------
vector<pair<int,vector<pair<int,int>>>>cage;
vector<vector<int>> cage_filler(n, vector<int>(n, -1));
//setter
void setKiller(vector<pair<int,vector<pair<int,int>>>> inputCage) {
    cage = inputCage;
    for(int i =0 ; i< cage.size();++i){
        for(auto [r,c] : cage[i].s)
            cage_filler[r][c] = i;
        // for(int j =0; j<cage[i].s.size();++j){
        //     int i1 = cage[i].s[j].f;
        //     int i2 = cage[i].s[j].s;
        // }
    }
}

bool killerCheck(int r, int c, int val) {
    int id = cage_filler[r][c];
    if(id == -1) return true; // cell not in any cage

    auto temp = cage[id];

    // no repeats within cage
    for(auto [cr, cc] : temp.s)
        if(grid[cr][cc] == val) return false;

    // check sum
    int filled = 0, currSum = 0;
    for(auto [cr, cc] : temp.s) {
        int v = (cr == r && cc == c) ? val : grid[cr][cc];
        if(v != 0) { currSum += v; filled++; }
    }

    if(currSum > temp.f) return false; // exceeded already
    if(filled == (int)temp.s.size() && currSum != temp.f) return false; // wrong sum

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
    if(!killerCheck(r, c, fill)) return false;

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

    setKiller({{15, {{0,0},{0,1},{0,2}}}, {7, {{1,0},{2,0}}}});



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