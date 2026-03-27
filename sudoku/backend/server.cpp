#include "common.h"
#include "solver.h"
#include "evenodd.h"
#include "killer.h"
#include "thermo.h"
#include "arrow.h"
#include "kropki.h"
#include <nlohmann/json.hpp>
#include <httplib.h>

using json = nlohmann::json;

vector<vector<int>> grid(N, vector<int>(N, 0));

void resetAll() {
    for(int i = 0; i < N; ++i)
        for(int j = 0; j < N; ++j)
            grid[i][j] = 0;
    resetEvenOdd();
    resetKiller();
    resetThermo();
    resetArrow();
    resetKropki();
}

json runSolver(const json& input) {
    resetAll();

    // Load grid
    for(int i = 0; i < N; ++i)
        for(int j = 0; j < N; ++j)
            grid[i][j] = input["grid"][i][j];

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
            dot.type = d["type"].get<string>()[0];
            dots.push_back(dot);
        }
        setKropki(dots);
    }

    json output;
    if(solve()) {
        output["status"] = "solved";
        output["grid"]   = grid;
    } else {
        output["status"] = "no_solution";
    }
    return output;
}

int main() {
    httplib::Server svr;

    // CORS for React frontend
    svr.set_pre_routing_handler([](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin",  "*");
        res.set_header("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        return httplib::Server::HandlerResponse::Unhandled;
    });

    svr.Options("/solve", [](const httplib::Request&, httplib::Response& res) {
        res.status = 204;
    });

    svr.Post("/solve", [](const httplib::Request& req, httplib::Response& res) {
        try {
            json input  = json::parse(req.body);
            json output = runSolver(input);
            res.set_content(output.dump(2), "application/json");
        } catch(const exception& e) {
            json err;
            err["status"]  = "error";
            err["message"] = e.what();
            res.status = 400;
            res.set_content(err.dump(), "application/json");
        }
    });

    cout << "Sudoku solver running on http://localhost:8080\n";
    svr.listen("0.0.0.0", 8080);
    return 0;
}