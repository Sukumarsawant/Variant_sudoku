#pragma once
#include "common.h"

struct Arrow {
    pair<int,int> circle;
    vector<pair<int,int>> cells;
};

void setArrow(vector<Arrow> inputArrows);
void resetArrow();
bool arrowCheck(int r, int c, int val);
