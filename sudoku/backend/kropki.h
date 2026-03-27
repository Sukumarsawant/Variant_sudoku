#pragma once
#include "common.h"

struct Dot {
    pair<int,int> c1, c2;
    char type;
};

void setKropki(vector<Dot> inputDots);
void resetKropki();
bool kropkiCheck(int r, int c, int val);
