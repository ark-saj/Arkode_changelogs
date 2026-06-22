"use client";

import { Reveal } from "@/components/mosaic/reveal";
import { MosaicCanvas } from "@/components/mosaic/mosaic-canvas";
import { FannedCards } from "@/components/mosaic/fanned-cards";

export function Hero() {
  return (
    <section className="relative pt-14 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <Reveal>
            <h1 className="text-balance font-sans font-bold tracking-[-0.05em] leading-[0.96] text-ink text-[clamp(34px,6vw,72px)]">
              Novedades del <span className="text-coral-deep">Sistema</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-lg leading-[1.45] text-mute">
              Mantente al día con las mejoras que se implementan para facilitar
              tu trabajo.
            </p>
          </Reveal>
        </div>

        <Reveal delay={160} className="hidden lg:block">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <div className="aspect-square w-2/3 overflow-hidden rounded-lg14 border border-line opacity-40 shadow-e1">
                <MosaicCanvas cols={4} rows={4} swap={900} />
              </div>
            </div>
            <FannedCards />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
