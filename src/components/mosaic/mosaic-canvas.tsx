"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* Arkode Mosaic — generative mosaic canvas (React port of mosaic-canvas.js).
   Animated grid of coral/orange/navy/bone cells. rAF loop in useEffect,
   IntersectionObserver pauses offscreen, prefers-reduced-motion = static. */

const COLORS = [
  "#FF6C5D",
  "#FF8A3D",
  "#E8503F",
  "#C5362A",
  "#FF6C5D",
  "#FF8A3D",
  "#001C43",
  "#F4ECDE",
  "#FF6C5D",
  "#E8503F",
];

function lerp(a: string, b: string, k: number): string {
  const ar = parseInt(a.slice(1, 3), 16),
    ag = parseInt(a.slice(3, 5), 16),
    ab = parseInt(a.slice(5, 7), 16),
    br = parseInt(b.slice(1, 3), 16),
    bg = parseInt(b.slice(3, 5), 16),
    bb = parseInt(b.slice(5, 7), 16);
  return `rgb(${Math.round(ar + (br - ar) * k)},${Math.round(
    ag + (bg - ag) * k,
  )},${Math.round(ab + (bb - ab) * k)})`;
}

function pick(): string {
  return COLORS[(Math.random() * COLORS.length) | 0];
}

interface Cell {
  from: string;
  to: string;
  t: number;
}

export interface MosaicCanvasProps
  extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  cols?: number;
  rows?: number;
  swap?: number;
}

export function MosaicCanvas({
  cols = 3,
  rows = 3,
  swap = 1100,
  className,
  ...props
}: MosaicCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion:reduce)",
    ).matches;

    let W = 0,
      H = 0,
      cw = 0,
      ch = 0,
      dpr = 1;
    let cells: Cell[] = [];
    let raf: number | null = null;
    let last = 0;
    let nextSwap = 0;

    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      W = r.width || canvas.width;
      H = r.height || canvas.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cw = W / cols;
      ch = H / rows;
    }
    function init() {
      cells = [];
      for (let i = 0; i < cols * rows; i++)
        cells.push({ from: pick(), to: pick(), t: 1 });
    }
    function draw() {
      if (!ctx) return;
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const c = cells[y * cols + x];
          const x0 = Math.round(x * cw),
            x1 = Math.round((x + 1) * cw),
            y0 = Math.round(y * ch),
            y1 = Math.round((y + 1) * ch);
          ctx.fillStyle = c.t >= 1 ? c.to : lerp(c.from, c.to, c.t);
          ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        }
    }
    function frame(ts: number) {
      if (!last) last = ts;
      const dt = ts - last;
      last = ts;
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].t < 1) cells[i].t = Math.min(1, cells[i].t + dt / 520);
      }
      if (ts > nextSwap) {
        nextSwap = ts + swap;
        const idx = (Math.random() * cells.length) | 0;
        cells[idx].from = cells[idx].to;
        cells[idx].to = pick();
        cells[idx].t = 0;
      }
      draw();
      raf = requestAnimationFrame(frame);
    }

    resize();
    init();
    draw();

    const onResize = () => {
      resize();
      draw();
    };
    window.addEventListener("resize", onResize);

    let ob: IntersectionObserver | null = null;
    if (!reduce) {
      ob = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (e.isIntersecting) {
              if (!raf) {
                last = 0;
                raf = requestAnimationFrame(frame);
              }
            } else if (raf) {
              cancelAnimationFrame(raf);
              raf = null;
            }
          });
        },
        { threshold: 0.01 },
      );
      ob.observe(canvas);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (ob) ob.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cols, rows, swap]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("block h-full w-full", className)}
      {...props}
    />
  );
}
