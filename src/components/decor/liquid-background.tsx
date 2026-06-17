import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative "liquid glass" backdrop, matching the login aesthetic: glossy
 * iridescent (pearlescent) and chrome blobs with organic shapes, floating over a
 * soft brand glow. No grid. Fixed behind all content, never interactive, and
 * respects prefers-reduced-motion (animations disabled globally in CSS).
 *
 * Readability: blobs hug the edges so the central content column stays clear,
 * and the frosted cards blur whatever sits behind them.
 */

// Pearlescent soap-bubble sheen (white core + pink/cyan/violet iridescence).
const IRIDESCENT =
  "radial-gradient(130% 110% at 28% 22%, rgba(255,255,255,0.92), rgba(255,255,255,0) 42%)," +
  "conic-gradient(from 210deg at 50% 50%, #ffc9ee, #c9e9ff, #dcc9ff, #c9ffe6, #fff2c9, #ffc9ee)," +
  "radial-gradient(110% 110% at 55% 62%, #ffffff 0%, #f0e8ff 55%, #e6f0ff 100%)";

// Chrome metal with a kiss of the active tenant's brand color.
const CHROME =
  "radial-gradient(115% 115% at 32% 26%, rgba(255,255,255,0.95), rgba(255,255,255,0) 33%)," +
  "radial-gradient(80% 80% at 72% 80%, hsl(var(--brand) / 0.45), transparent 55%)," +
  "radial-gradient(120% 120% at 50% 42%, #dfe4ec 0%, #9097a8 40%, #2b3140 78%, #11141c 100%)";

function Blob({
  className,
  background,
  radius,
}: {
  className?: string;
  background: string;
  radius: string;
}) {
  return (
    <div
      className={className}
      style={
        {
          background,
          borderRadius: radius,
          boxShadow:
            "inset 0 6px 22px rgba(255,255,255,0.45), 0 40px 90px -25px rgba(10,12,20,0.7)",
        } as CSSProperties
      }
    />
  );
}

export function LiquidBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* soft brand glow — tenant identity, kept subtle */}
      <div
        className="absolute -left-32 -top-40 h-[42rem] w-[42rem] rounded-full opacity-50 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, hsl(var(--blob-1) / 0.45), transparent 70%)",
        }}
      />
      <div
        className="absolute -right-40 bottom-[-20%] h-[42rem] w-[42rem] rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 55% 45%, hsl(var(--blob-3) / 0.4), transparent 70%)",
        }}
      />

      {/* glossy iridescent + chrome blobs, hugging the edges */}
      <Blob
        className="absolute -left-28 -top-28 h-80 w-96 animate-float opacity-60"
        background={IRIDESCENT}
        radius="47% 53% 62% 38% / 55% 46% 54% 45%"
      />
      <Blob
        className="absolute -right-24 -top-20 h-72 w-80 animate-float-slow opacity-60"
        background={CHROME}
        radius="62% 38% 41% 59% / 49% 62% 38% 51%"
      />
      <Blob
        className="absolute right-[-5%] top-[42%] h-44 w-52 animate-float opacity-50"
        background={IRIDESCENT}
        radius="40% 60% 55% 45% / 58% 42% 58% 42%"
      />
      <Blob
        className="absolute -bottom-28 left-6 h-72 w-[22rem] animate-float-slow opacity-55"
        background={CHROME}
        radius="58% 42% 47% 53% / 42% 56% 44% 58%"
      />
      <Blob
        className="absolute -bottom-16 right-[18%] h-40 w-44 animate-float opacity-45"
        background={IRIDESCENT}
        radius="53% 47% 38% 62% / 46% 58% 42% 54%"
      />
    </div>
  );
}
