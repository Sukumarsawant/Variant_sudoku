#include "common.h"
#include "solver.h"
#include "evenodd.h"
#include "killer.h"
#include "thermo.h"
#include "arrow.h"
#include "kropki.h"
#include <nlohmann/json.hpp>

using json = nlohmann::json;

vector<vector<int>> grid(N, vector<int>(N, 0));

void printGrid() {
    for(int i = 0; i < N; ++i) {
        for(int j = 0; j < N; ++j)
            cout << grid[i][j] << " ";
        cout << "\n";
    }
}

int main() {
    // Read entire stdin as JSON
    json input;
    cin >> input;

    // ── Load grid ─────────────────────────────────────
    for(int i = 0; i < N; ++i)
        for(int j = 0; j < N; ++j)
            grid[i][j] = input["grid"][i][j];

    // ── Activate variants from JSON ───────────────────
    auto& variants = input["variants"];

    // Even/Odd
    if(variants.contains("evenodd")) {
        vector<pair<int,int>> even, odd;
        for(auto& c : variants["evenodd"]["even"])
            even.push_back({c[0], c[1]});
        for(auto& c : variants["evenodd"]["odd"])
            odd.push_back({c[0], c[1]});
        setEvenOdd(even, odd);
    }

    // Killer
    if(variants.contains("killer")) {
        vector<pair<int,vector<pair<int,int>>>> cages;
        for(auto& cage : variants["killer"]["cages"]) {
            int sum = cage["sum"];
            vector<pair<int,int>> cells;
            for(auto& cell : cage["cells"])
                cells.push_back({cell[0], cell[1]});
            cages.push_back({sum, cells});
        }
        setKiller(cages);
    }

    // Thermo
    if(variants.contains("thermo")) {
        vector<vector<pair<int,int>>> thermos;
        for(auto& t : variants["thermo"]["thermos"]) {
            vector<pair<int,int>> seq;
            for(auto& cell : t)
                seq.push_back({cell[0], cell[1]});
            thermos.push_back(seq);
        }
        setThermo(thermos);
    }

    // Arrow
    if(variants.contains("arrow")) {
        vector<Arrow> arrows;
        for(auto& a : variants["arrow"]["arrows"]) {
            Arrow arr;
            arr.circle = {a["circle"][0], a["circle"][1]};
            for(auto& cell : a["cells"])
                arr.cells.push_back({cell[0], cell[1]});
            arrows.push_back(arr);
        }
        setArrow(arrows);
    }

    // Kropki
    if(variants.contains("kropki")) {
        vector<Dot> dots;
        for(auto& d : variants["kropki"]["dots"]) {
            Dot dot;
            dot.c1   = {d["c1"][0], d["c1"][1]};
            dot.c2   = {d["c2"][0], d["c2"][1]};
            dot.type = d["type"].get<string>()[0]; // 'b' or 'w'
            dots.push_back(dot);
        }
        setKropki(dots);
    }
    // ─────────────────────────────────────────────────

    // Solve and output JSON
    json output;
    if(solve()) {
        output["status"] = "solved";
        output["grid"] = grid;
    } else {
        output["status"] = "no_solution";
    }

    cout << output.dump(2) << "\n";
    return 0;
}