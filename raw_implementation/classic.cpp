#include <bits/stdc++.h>
#define f first
#define s second
using namespace std;

const int n = 9;

vector<vector<int>> grid(n, vector<int>(n, 0));
 // Normal variant
 // RULES:
 // 1. IN row
 // 2. IN col
 // 3. IN Quad
bool isValid(int r, int c, int fill){
 // Row check
    if(count(grid[r].begin(),grid[r].end(),fill)) return false;
    
 // col check
    for(int i =0 ;i<n;++i) if(grid[i][c]==fill) return false;
 
 // Quad check
    pair<int,int> row = {r/3*3,r/3*3 + 2}; // [row.f,row.s]
    pair<int,int> col = {c/3*3,c/3*3 + 2}; // [col.f,col.s]
    for(int i = row.f; i<=row.s;++i){
        for(int j = col.f; j<=col.s; ++j){
            if(grid[i][j]==fill) return false;
        }
    }
    return true;
}
bool func() {
  for (int r = 0; r < n; ++r) {
    for (int c = 0; c < n; ++c) {
        if(grid[r][c] != 0)  continue;
        for(int fill = 1; fill<=9; ++fill){
            if(isValid(r,c,fill)) {
                grid[r][c] = fill;
                if(func()) return true;
                grid[r][c] = 0; // since goes through isValid
            }
        }
        return false;
    }
  }
  return true;
}

signed main() {
    for(int i = 0; i < n; ++i)
        for(int j = 0; j < n; ++j)
            cin >> grid[i][j];
    cout<<endl;
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