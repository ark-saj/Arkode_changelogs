import { cn } from "@/lib/utils";

/**
 * Decorative "liquid glass" backdrop: soft, blurred, slowly-floating orbs in the
 * brand colors. Purely ornamental — fixed behind all content, never interactive,
 * and respects prefers-reduced-motion (animations disabled globally in CSS).
 */
export function LiquidBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />

      {/* floating orbs */}
      <div
        className="absolute -left-24 top-[-10%] h-[36rem] w-[36rem] animate-float rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, hsl(var(--blob-1) / 0.55), transparent 70%)",
        }}
      />
      <div
        className="absolute right-[-12%] top-[8%] h-[30rem] w-[30rem] animate-float-slow rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, hsl(var(--blob-2) / 0.5), transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-15%] left-1/3 h-[34rem] w-[34rem] animate-float rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--blob-3) / 0.45), transparent 70%)",
        }}
      />

      {/* fine grid texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
