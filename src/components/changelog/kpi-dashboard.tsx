"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Sparkles,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { formatLongDate } from "@/lib/format";
import type { ChangelogStats } from "@/lib/types";

/** Animate an integer from 0 to `value` on mount. */
function useCountUp(value: number, duration = 900) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

function KpiCard({
  icon: Icon,
  value,
  label,
  index,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  index: number;
}) {
  const display = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="rounded-3xl glass glass-highlight p-5"
    >
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-display text-3xl font-bold tabular-nums tracking-tight">
        {display}
      </p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

export function KpiDashboard({ stats }: { stats: ChangelogStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        icon={Sparkles}
        value={stats.newFeatures}
        label="Nuevas funcionalidades"
        index={0}
      />
      <KpiCard
        icon={TrendingUp}
        value={stats.improvements}
        label="Mejoras implementadas"
        index={1}
      />
      <KpiCard
        icon={Wrench}
        value={stats.fixes}
        label="Correcciones"
        index={2}
      />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.24 }}
        className="rounded-3xl glass glass-highlight p-5"
      >
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand">
          <CalendarClock className="h-5 w-5" />
        </span>
        <p className="mt-4 font-display text-lg font-bold leading-tight tracking-tight">
          {stats.lastUpdate ? formatLongDate(stats.lastUpdate) : "—"}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">Última actualización</p>
      </motion.div>
    </div>
  );
}
