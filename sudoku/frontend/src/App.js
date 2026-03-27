import { useState, useCallback } from "react";
import "./app.css";

const API = "http://localhost:8080/solve";

const VARIANTS = ["classic", "evenodd", "killer", "thermo", "arrow", "kropki"];

const VARIANT_LABELS = {
  classic:  "Classic",
  evenodd:  "Even / Odd",
  killer:   "Killer",
  thermo:   "Thermo",
  arrow:    "Arrow",
  kropki:   "Kropki",
};

const emptyGrid = () => Array(9).fill(null).map(() => Array(9).fill(""));

// ── Helpers ───────────────────────────────────────────
function cellKey(r, c) { return `${r},${c}`; }
function parseCell(r, c) { return [parseInt(r), parseInt(c)]; }

export default function App() {
  const [grid, setGrid]               = useState(emptyGrid());
  const [solvedGrid, setSolvedGrid]   = useState(null);
  const [activeVariants, setActive]   = useState(new Set(["classic"]));
  const [status, setStatus]           = useState("idle"); // idle | solving | solved | error | no_solution
  const [errorMsg, setErrorMsg]       = useState("");

  // Even/Odd
  const [evenCells, setEvenCells]     = useState(new Set());
  const [oddCells, setOddCells]       = useState(new Set());
  const [eoMode, setEoMode]           = useState("even"); // "even" | "odd"

  // Killer
  const [cages, setCages]             = useState([]); // [{sum, cells:[key,...]}]
  const [currentCage, setCurrentCage] = useState([]);
  const [cageSum, setCageSum]         = useState("");

  // Thermo
  const [thermos, setThermos]         = useState([]); // [[key,...]]
  const [currentThermo, setCurrentThermo] = useState([]);

  // Arrow
  const [arrows, setArrows]           = useState([]); // [{circle:key, cells:[key,...]}]
  const [arrowCircle, setArrowCircle] = useState(null);
  const [arrowCells, setArrowCells]   = useState([]);

  // Kropki
  const [dots, setDots]               = useState([]); // [{c1:key,c2:key,type:'b'|'w'}]
  const [dotFirst, setDotFirst]       = useState(null);
  const [dotType, setDotType]         = useState("b");

  // Grid import
  const [importText, setImportText]   = useState("");

  // ── Grid input ───────────────────────────────────────
  const handleCell = (r, c, val) => {
    if (val !== "" && (!/^[1-9]$/.test(val))) return;
    const g = grid.map(row => [...row]);
    g[r][c] = val;
    setGrid(g);
    setSolvedGrid(null);
  };

  // ── Import grid from text ──────────────────────────
  const importGrid = () => {
    try {
      const text = importText.trim().replace(/\s+/g, "");
      if (text.length !== 81) {
        setErrorMsg(`Invalid grid: expected 81 digits, got ${text.length}`);
        setStatus("error");
        return;
      }
      if (!/^[0-9]{81}$/.test(text)) {
        setErrorMsg("Invalid grid: only digits 0-9 allowed (0 = empty)");
        setStatus("error");
        return;
      }
      const newGrid = Array(9).fill(null).map(() => Array(9).fill(""));
      for (let i = 0; i < 81; i++) {
        const digit = text[i];
        if (digit !== "0") {
          newGrid[Math.floor(i / 9)][i % 9] = digit;
        }
      }
      setGrid(newGrid);
      setSolvedGrid(null);
      setImportText("");
      setStatus("idle");
      setErrorMsg("");
    } catch (e) {
      setErrorMsg(`Import error: ${e.message}`);
      setStatus("error");
    }
  };

  // ── Variant toggle ───────────────────────────────────
  const toggleVariant = (v) => {
    setActive(prev => {
      const next = new Set(prev);
      if (v === "classic") return next; // always on
      next.has(v) ? next.delete(v) : next.add(v);
      return next;
    });
  };

  // ── Cell click for constraint building ───────────────
  const handleCellClick = (r, c) => {
    const key = cellKey(r, c);

    if (activeVariants.has("evenodd")) {
      if (eoMode === "even") {
        setEvenCells(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });
        setOddCells(p => { const n = new Set(p); n.delete(key); return n; });
      } else {
        setOddCells(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });
        setEvenCells(p => { const n = new Set(p); n.delete(key); return n; });
      }
    }

    if (activeVariants.has("killer")) {
      setCurrentCage(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
    }

    if (activeVariants.has("thermo")) {
      setCurrentThermo(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
    }

    if (activeVariants.has("arrow")) {
      if (!arrowCircle) {
        setArrowCircle(key);
      } else if (key === arrowCircle) {
        setArrowCircle(null);
        setArrowCells([]);
      } else {
        setArrowCells(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
      }
    }

    if (activeVariants.has("kropki")) {
      if (!dotFirst) {
        setDotFirst(key);
      } else if (key !== dotFirst) {
        setDots(p => [...p, { c1: dotFirst, c2: key, type: dotType }]);
        setDotFirst(null);
      }
    }
  };

  // ── Constraint commit helpers ─────────────────────────
  const commitCage = () => {
    if (!cageSum || currentCage.length === 0) return;
    setCages(p => [...p, { sum: parseInt(cageSum), cells: currentCage }]);
    setCurrentCage([]);
    setCageSum("");
  };

  const commitThermo = () => {
    if (currentThermo.length < 2) return;
    setThermos(p => [...p, currentThermo]);
    setCurrentThermo([]);
  };

  const commitArrow = () => {
    if (!arrowCircle || arrowCells.length === 0) return;
    setArrows(p => [...p, { circle: arrowCircle, cells: arrowCells }]);
    setArrowCircle(null);
    setArrowCells([]);
  };

  // ── Reset ────────────────────────────────────────────
  const resetAll = () => {
    setGrid(emptyGrid());
    setSolvedGrid(null);
    setStatus("idle");
    setEvenCells(new Set());
    setOddCells(new Set());
    setCages([]); setCurrentCage([]); setCageSum("");
    setThermos([]); setCurrentThermo([]);
    setArrows([]); setArrowCircle(null); setArrowCells([]);
    setDots([]); setDotFirst(null);
  };

  // ── Solve ────────────────────────────────────────────
  const solve = useCallback(async () => {
    setStatus("solving");
    setErrorMsg("");

    // Build numeric grid
    const numGrid = grid.map(row => row.map(v => v === "" ? 0 : parseInt(v)));

    // Build variants payload
    const variants = {};

    if (activeVariants.has("evenodd")) {
      variants.evenodd = {
        even: [...evenCells].map(k => parseCell(...k.split(","))),
        odd:  [...oddCells].map(k => parseCell(...k.split(","))),
      };
    }

    if (activeVariants.has("killer")) {
      variants.killer = {
        cages: cages.map(cg => ({
          sum: cg.sum,
          cells: cg.cells.map(k => parseCell(...k.split(","))),
        })),
      };
    }

    if (activeVariants.has("thermo")) {
      variants.thermo = {
        thermos: thermos.map(t => t.map(k => parseCell(...k.split(",")))),
      };
    }

    if (activeVariants.has("arrow")) {
      variants.arrow = {
        arrows: arrows.map(a => ({
          circle: parseCell(...a.circle.split(",")),
          cells:  a.cells.map(k => parseCell(...k.split(","))),
        })),
      };
    }

    if (activeVariants.has("kropki")) {
      variants.kropki = {
        dots: dots.map(d => ({
          c1:   parseCell(...d.c1.split(",")),
          c2:   parseCell(...d.c2.split(",")),
          type: d.type,
        })),
      };
    }

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grid: numGrid, variants }),
      });
      const data = await res.json();
      if (data.status === "solved") {
        setSolvedGrid(data.grid);
        setStatus("solved");
      } else if (data.status === "no_solution") {
        setStatus("no_solution");
      } else {
        setErrorMsg(data.message || "Unknown error");
        setStatus("error");
      }
    } catch (e) {
      setErrorMsg("Could not reach solver. Is the server running?");
      setStatus("error");
    }
  }, [grid, activeVariants, evenCells, oddCells, cages, thermos, arrows, dots]);

  // ── Cell styling helpers ──────────────────────────────
  const getCellMark = (r, c) => {
    const key = cellKey(r, c);
    if (evenCells.has(key)) return "even";
    if (oddCells.has(key))  return "odd";
    if (currentCage.includes(key)) return "cage-active";
    if (cages.some(cg => cg.cells.includes(key))) return "cage";
    if (currentThermo.includes(key)) return "thermo-active";
    if (thermos.some(t => t.includes(key))) return "thermo";
    if (key === arrowCircle) return "arrow-circle";
    if (arrowCells.includes(key)) return "arrow-cell";
    if (arrows.some(a => a.circle === key)) return "arrow-circle";
    if (arrows.some(a => a.cells.includes(key))) return "arrow-cell";
    if (dotFirst === key) return "dot-first";
    if (dots.some(d => d.c1 === key || d.c2 === key)) return "dot";
    return "";
  };

  const displayGrid = solvedGrid || grid;

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">SUDOKU<span className="title-accent">.</span></h1>
        <p className="subtitle">Variant Solver Engine</p>
      </header>

      <main className="main">
        {/* ── Variant Selector ── */}
        <section className="panel variant-panel">
          <h2 className="panel-title">Variants</h2>
          <div className="variant-grid">
            {VARIANTS.map(v => (
              <button
                key={v}
                className={`variant-btn ${activeVariants.has(v) ? "active" : ""} ${v === "classic" ? "locked" : ""}`}
                onClick={() => toggleVariant(v)}
              >
                {VARIANT_LABELS[v]}
              </button>
            ))}
          </div>

          {/* ── Grid Import ── */}
          <div style={{marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)"}}>
            <h3 style={{fontSize: "0.95rem", marginBottom: "8px", color: "var(--primary-light)", textTransform: "uppercase", letterSpacing: "0.5px"}}>Import Grid</h3>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Paste 81 digits (0=empty)&#10;e.g. 530070000..."
              style={{
                width: "100%",
                height: "80px",
                padding: "10px",
                border: "2px solid var(--border)",
                borderRadius: "8px",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontFamily: '"DM Mono", monospace',
                fontSize: "0.8rem",
                resize: "vertical",
                marginBottom: "8px"
              }}
            />
            <button
              onClick={importGrid}
              style={{
                width: "100%",
                padding: "10px",
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.85rem",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => e.target.style.background = "var(--primary-dark)"}
              onMouseLeave={e => e.target.style.background = "var(--primary)"}
            >
              Import
            </button>
          </div>
        </section>

        {/* ── Grid ── */}
        <section className="grid-section">
          <div className="sudoku-grid">
            {displayGrid.map((row, r) =>
              row.map((val, c) => {
                const mark = getCellMark(r, c);
                const isSolved = solvedGrid && grid[r][c] === "";
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`cell ${mark} ${isSolved ? "solved-cell" : ""} box-${Math.floor(r/3)}-${Math.floor(c/3)}`}
                    onClick={() => handleCellClick(r, c)}
                  >
                    <input
                      type="text"
                      maxLength={1}
                      value={solvedGrid ? (solvedGrid[r][c] || "") : val}
                      onChange={e => handleCell(r, c, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      readOnly={!!solvedGrid}
                      className="cell-input"
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* ── Status ── */}
          <div className={`status-bar status-${status}`}>
            {status === "idle"        && "Enter puzzle and select variants"}
            {status === "solving"     && "⟳ Solving..."}
            {status === "solved"      && "✓ Solved!"}
            {status === "no_solution" && "✗ No solution found"}
            {status === "error"       && `✗ ${errorMsg}`}
          </div>

          {/* ── Actions ── */}
          <div className="actions">
            <button className="btn btn-solve" onClick={solve} disabled={status === "solving"}>
              {status === "solving" ? "Solving..." : "Solve"}
            </button>
            <button className="btn btn-reset" onClick={resetAll}>Reset</button>
          </div>
        </section>

        {/* ── Constraint Controls ── */}
        <section className="panel constraint-panel">
          <h2 className="panel-title">Constraints</h2>

          {activeVariants.has("evenodd") && (
            <div className="constraint-block">
              <h3>Even / Odd</h3>
              <p className="hint">Click cells to mark them. Toggle mode below.</p>
              <div className="btn-row">
                <button className={`mode-btn ${eoMode === "even" ? "active" : ""}`} onClick={() => setEoMode("even")}>Even ■</button>
                <button className={`mode-btn ${eoMode === "odd" ? "active" : ""}`}  onClick={() => setEoMode("odd")}>Odd ●</button>
              </div>
              <p className="hint">Even: {evenCells.size} cells · Odd: {oddCells.size} cells</p>
            </div>
          )}

          {activeVariants.has("killer") && (
            <div className="constraint-block">
              <h3>Killer Cages</h3>
              <p className="hint">Click cells to select a cage, enter sum, then commit.</p>
              <div className="input-row">
                <input
                  type="number"
                  placeholder="Cage sum"
                  value={cageSum}
                  onChange={e => setCageSum(e.target.value)}
                  className="constraint-input"
                />
                <button className="mode-btn active" onClick={commitCage}>
                  Add Cage ({currentCage.length} cells)
                </button>
                    <input
                      type="text"
                      maxLength={1}
                      value={solvedGrid ? (solvedGrid[r][c] || "") : val}
                      onChange={e => handleCell(r, c, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      readOnly={!!solvedGrid}
                      className="cell-input"
                    />
                    {mark === "even" && <span className="cell-indicator even-indicator">E</span>}
                    {mark === "odd" && <span className="cell-indicator odd-indicator">O</span>}
                  </div>
                Add Thermo ({currentThermo.length} cells)
              </button>
              <p className="hint">{thermos.length} thermo(s) added</p>
            </div>
          )}

          {activeVariants.has("arrow") && (
            <div className="constraint-block">
              <h3>Arrows</h3>
              <p className="hint">First click = circle, subsequent clicks = arrow path.</p>
              <button className="mode-btn active" onClick={commitArrow}>
                Add Arrow ({arrowCells.length} path cells)
              </button>
              <p className="hint">{arrows.length} arrow(s) added</p>
            </div>
          )}

          {activeVariants.has("kropki") && (
            <div className="constraint-block">
              <h3>Kropki Dots</h3>
              <p className="hint">Click two adjacent cells to place a dot between them.</p>
              <div className="btn-row">
                <button className={`mode-btn ${dotType === "b" ? "active" : ""}`} onClick={() => setDotType("b")}>● Black (×2)</button>
                <button className={`mode-btn ${dotType === "w" ? "active" : ""}`} onClick={() => setDotType("w")}>○ White (consec.)</button>
              </div>
              <p className="hint">{dots.length} dot(s) placed{dotFirst ? " · Select second cell" : ""}</p>
            </div>
          )}

          {activeVariants.size === 1 && (
            <p className="hint muted">Activate a variant above to see constraint controls.</p>
          )}
        </section>
      </main>
    </div>
  );
}
