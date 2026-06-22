"use client";

import { CountUp } from "@/components/mosaic/count-up";
import { PixelIcon, type PixelIconName } from "@/components/mosaic/pixel-icon";
import { MDiv } from "@/components/motion/motion-safe";
import { slideUp, staggerContainer } from "@/components/motion/variants";
import { formatLongDate } from "@/lib/format";
import type { ChangelogStats } from "@/lib/types";

function MetricCell({
  icon,
  children,
  value,
  label,
}: {
  icon: PixelIconName;
  children?: React.ReactNode;
  value?: number;
  label: string;
}) {
  return (
    <MDiv
      variants={slideUp}
      className="border-b border-r border-line p-6 last:border-r-0"
    >
      <PixelIcon name={icon} unit={4} className="text-ink" />
      {value !== undefined ? (
        <p className="mt-5 font-sans text-4xl font-semibold tabular-nums tracking-[-0.04em] text-ink">
          <CountUp to={value} />
        </p>
      ) : (
        children
      )}
      <div className="mt-3 h-px w-6 bg-coral" />
      <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute">
        {label}
      </p>
    </MDiv>
  );
}

export function KpiDashboard({ stats }: { stats: ChangelogStats }) {
  return (
    <MDiv
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="grid grid-cols-2 border-l border-t border-line lg:grid-cols-4"
    >
      <MetricCell
        icon="chartBar"
        value={stats.newFeatures}
        label="Nuevas funcionalidades"
      />
      <MetricCell
        icon="plus"
        value={stats.improvements}
        label="Mejoras implementadas"
      />
      <MetricCell icon="bolt" value={stats.fixes} label="Correcciones" />
      <MetricCell icon="clock" label="Última actualización">
        <p className="mt-5 font-sans text-lg font-semibold leading-tight tracking-[-0.02em] text-ink">
          {stats.lastUpdate ? formatLongDate(stats.lastUpdate) : "—"}
        </p>
      </MetricCell>
    </MDiv>
  );
}
