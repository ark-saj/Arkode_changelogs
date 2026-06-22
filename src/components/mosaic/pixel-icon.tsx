import * as React from "react";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — pixel-art sprite engine (React port of pixel-option3.js).
   Each painted cell is rendered as one rounded square sized to the weight's
   fill ratio and centered in its grid cell, leaving a crisp pixel gap. Pure +
   SSR-safe: geometry is computed in render, no post-mount DOM script.

   Two weights (per Arkode usage rules):
     inset (86% fill) — small & dense UI; legible at unit <= 3 (buttons, chips, rows)
     fine  (70% fill) — premium default for feature/standalone icons (unit >= 4)
   Omit `weight` and the engine auto-picks by `unit`. */

const PAL: Record<string, string> = {
  n: "#001C43", // navy
  c: "#FF6C5D", // coral
  o: "#FF8A3D", // warm orange (mosaic accent)
  r: "#C5362A", // crimson
  b: "#F4ECDE", // bone
  w: "#FFFFFF",
  y: "#F2B705", // gold
  s: "#2A6FDB", // blue
  g: "#1F8A5B", // green
};

// '.' or ' ' = transparent. Each other char keys into PAL.
const SPRITES = {
  arrowR: [".......", "....n..", ".....n.", "nnnnnnn", ".....n.", "....n..", "......."],
  arrowL: [".......", "..n....", ".n.....", "nnnnnnn", ".n.....", "..n....", "......."],
  arrowDownFull: ["...n...", "...n...", "...n...", "nnnnnnn", ".nnnnn.", "..nnn..", "...n..."],
  bolt: ["....c", "...cc", "..cc.", ".cc..", "ccc..", ".cccc", "..ccc", "..cc.", ".cc..", ".c...", "c...."],
  chartBar: [".....c.", ".....c.", ".n...c.", ".n.n.c.", ".n.n.c.", "nnnnnnn", "......."],
  chartLine: ["......c", ".....c.", "..c.c..", ".c.c...", "c......", ".......", "nnnnnnn"],
  chartPie: ["..ncc..", ".nnccc.", "nnncccc", "nnncccc", "nnnnnnn", ".nnnnn.", "..nnn.."],
  trendUp: ["....ccc", ".....cc", "....c.c", "...c...", "..c....", ".c.....", "c......"],
  trendDown: ["r......", ".r.....", "..r....", "...r...", "....r.r", ".....rr", "....rrr"],
  dot: [".......", "..ccc..", ".ccccc.", ".ccccc.", ".ccccc.", "..ccc..", "......."],
  doc: ["nnnnn.", "n...nn", "n....n", "n.nn.n", "n....n", "n.nn.n", "nnnnnn"],
  database: [".nnnnn.", "n.....n", ".nnnnn.", "n.....n", ".nnnnn.", "n.....n", ".nnnnn."],
  calendar: [".n...n.", "nnnnnnn", "n.....n", "n.c...n", "n.....n", "n.....n", "nnnnnnn"],
  clock: ["..nnn..", ".n...n.", "n..n..n", "n..nnnn", "n.....n", ".n...n.", "..nnn.."],
  mail: ["nnnnnnn", "nn...nn", "n.n.n.n", "n..n..n", "n.....n", "n.....n", "nnnnnnn"],
  shield: [".nnnnn.", "n.....n", "n.....n", "n..c..n", ".n...n.", "..n.n..", "...n..."],
  user: ["..nnn..", ".n...n.", ".n...n.", "..nnn..", ".nnnnn.", "nnnnnnn", "nn...nn"],
  search: [".nnn...", "n...n..", "n...n..", "n...n..", ".nnn...", "...nn..", "....nn."],
  money: ["...c...", "..cccc.", ".c.c...", "..ccc..", "...c.c.", ".cccc..", "...c..."],
  factory: ["n......", "n..n..n", "n.nn.nn", "nnnnnnn", "n.n.n.n", "n.n.n.n", "nnnnnnn"],
  truck: [".......", "nnnnn..", "nnnnnnn", "nnnnnnn", "nnnnnnn", ".n...n.", "......."],
  cloud: [".......", "...nn..", "..nnnn.", ".nnnnnn", "nnnnnnn", ".nnnnn.", "......."],
  code: ["..n.n..", ".n...n.", "n.....n", ".n...n.", "..n.n..", ".......", "......."],
  layers: ["...n...", "..nnn..", ".nnnnn.", "..nnn..", ".nnnnn.", "..nnn..", "...n..."],
  bell: ["...n...", "..nnn..", ".nnnnn.", ".nnnnn.", "nnnnnnn", ".......", "...n..."],
  gear: [
    "..n...n..",
    "..nn.nn..",
    "nnnnnnnnn",
    ".nn...nn.",
    "nn.....nn",
    ".nn...nn.",
    "nnnnnnnnn",
    "..nn.nn..",
    "..n...n..",
  ],
  chat: ["nnnnnnn", "n.....n", "n.....n", "n.....n", "nnnnnnn", "..nn...", ".nn...."],
  globe: ["..sss..", ".s.s.s.", "s..s..s", "sssssss", "s..s..s", ".s.s.s.", "..sss.."],
  bot: ["...n...", ".nnnnn.", "nnnnnnn", "n.n.n.n", "nnnnnnn", "n.nnn.n", ".nnnnn."],
  brief: ["..ooo..", "..o.o..", "ooooooo", "o.....o", "o..o..o", "o.....o", "ooooooo"],
  plus: ["...c...", "...c...", "...c...", "ccccccc", "...c...", "...c...", "...c..."],
  check: ["......g", ".....gg", "....gg.", "...gg..", "g.gg...", "ggg....", ".g....."],
  plug: [".n...n.", ".n...n.", "nnnnnnn", "nnnnnnn", ".nnnnn.", "...n...", "...n..."],
  squares: ["cc.oo", "cc.oo", ".....", "nn.cc", "nn.cc"],
  mark: [".nnnnncc", "nn...ncc", "n.....n.", "n.....n.", "n.....n.", "nn...nn.", ".nnnnn.."],
  cube: [".ooooo.", "oo.o.oo", "ooooooo", "o..o..o", "o..o..o", "o..o..o", "ooooooo"],
  target: ["..nnn..", ".n...n.", "n.....n", "n..c..n", "n.....n", ".n...n.", "..nnn.."],
} as const;

export type PixelIconName = keyof typeof SPRITES;
export type PixelWeight = "inset" | "fine";

const WEIGHTS: Record<PixelWeight, { fill: number; rad: number }> = {
  inset: { fill: 0.86, rad: 0.14 },
  fine: { fill: 0.7, rad: 0.22 },
};

function weightFor(unit: number, explicit?: PixelWeight): PixelWeight {
  if (explicit && WEIGHTS[explicit]) return explicit;
  return unit <= 3 ? "inset" : "fine";
}

function dims(matrix: readonly string[]): { cols: number; rows: number } {
  let cols = 0;
  for (let i = 0; i < matrix.length; i++) cols = Math.max(cols, matrix[i].length);
  return { cols, rows: matrix.length };
}

export interface PixelIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: PixelIconName;
  unit?: number;
  tint?: string;
  /** Override the auto weight (inset 86% for small/dense, fine 70% for feature). */
  weight?: PixelWeight;
}

export function PixelIcon({
  name,
  unit = 5,
  tint,
  weight,
  className,
  style,
  ...props
}: PixelIconProps) {
  const matrix = SPRITES[name];
  const d = dims(matrix);
  const w = WEIGHTS[weightFor(unit, weight)];
  const size = Math.max(1, unit * w.fill);
  const off = (unit - size) / 2;
  const rad = (size / 2) * w.rad;

  const cells: React.ReactNode[] = [];
  for (let y = 0; y < matrix.length; y++) {
    const row = matrix[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === " " || ch === ".") continue;
      const col = tint || PAL[ch] || "#001C43";
      cells.push(
        <i
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            display: "block",
            left: x * unit + off,
            top: y * unit + off,
            width: size,
            height: size,
            background: col,
            borderRadius: rad || undefined,
          }}
        />,
      );
    }
  }

  return (
    <span
      aria-hidden
      className={cn("relative inline-block align-middle", className)}
      style={{ width: d.cols * unit, height: d.rows * unit, ...style }}
      {...props}
    >
      {cells}
    </span>
  );
}

export { SPRITES, PAL, WEIGHTS };
