"use client";

import { PixelIcon } from "@/components/mosaic/pixel-icon";
import { MDiv } from "@/components/motion/motion-safe";
import { scaleIn } from "@/components/motion/variants";

export function EmptyState({
  title = "Sin resultados",
  description = "Probá ajustando la búsqueda o quitando algunos filtros.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <MDiv
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center rounded-lg14 border border-line bg-canvas px-6 py-16 text-center shadow-e1"
    >
      <div className="grid h-14 w-14 place-items-center rounded-md9 border border-line-2 bg-bone">
        <PixelIcon name="search" unit={4} tint="#6B7390" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-ink">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-mute">{description}</p>
    </MDiv>
  );
}
