"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";

import { StatusBadge } from "@/components/changelog/status-badge";
import { WhereToFind } from "@/components/changelog/where-to-find";
import { Reactions } from "@/components/changelog/reactions";
import { ScreenshotGallery } from "@/components/changelog/screenshot-gallery";
import { BeforeAfterSlider } from "@/components/changelog/before-after-slider";
import { CategoryIcon } from "@/components/changelog/category-icon";
import { PixelIcon } from "@/components/mosaic/pixel-icon";
import { ArrowCircle } from "@/components/mosaic/arrow-circle";
import { MDiv } from "@/components/motion/motion-safe";
import { expandCollapse } from "@/components/motion/variants";
import type { Category, Ticket } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TicketCard({
  ticket,
  category,
  defaultOpen = false,
}: {
  ticket: Ticket;
  category?: Category;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const detailId = `ticket-${ticket.code}-details`;

  return (
    <div
      id={`t-${ticket.code}`}
      className="group scroll-mt-28 overflow-hidden rounded-lg14 border border-line bg-white shadow-e1 transition-[box-shadow,transform] duration-200 ease-ark hover:-translate-y-0.5 hover:shadow-e2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* Header — always visible, scannable. The status badge is the one accent. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={detailId}
        className="flex w-full items-start gap-4 p-6 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-mute">
              {ticket.code}
            </span>
            <StatusBadge status={ticket.status} />
          </div>
          <h4 className="font-sans text-base font-semibold leading-snug tracking-[-0.02em] text-ink">
            {ticket.title}
          </h4>
          <p className="mt-1.5 font-sans text-sm leading-relaxed text-mute">
            {ticket.summary}
          </p>
        </div>

        <span
          className={cn(
            "mt-1 shrink-0 transition-transform duration-300",
            open && "rotate-180",
          )}
          aria-hidden
        >
          <PixelIcon name="arrowDownFull" unit={2.5} weight="fine" />
        </span>
      </button>

      {/* Footer meta row — quiet mono, neutral icons */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 pb-5 font-mono text-[11px] uppercase tracking-[0.1em] text-mute">
        {category && (
          <span className="inline-flex items-center gap-1.5">
            <CategoryIcon name={category.icon} unit={3} />
            {category.name}
          </span>
        )}
        {ticket.screenshots.length > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <PixelIcon name="doc" unit={2.5} weight="fine" aria-hidden />
            {ticket.screenshots.length}{" "}
            {ticket.screenshots.length === 1 ? "captura" : "capturas"}
          </span>
        )}
        {!open && (
          <span className="ml-auto inline-flex items-center gap-2 font-medium text-ink-soft">
            Ver detalles
            <ArrowCircle size={22} />
          </span>
        )}
      </div>

      {/* Expandable detail */}
      <AnimatePresence initial={false}>
        {open && (
          <MDiv
            id={detailId}
            variants={expandCollapse}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="space-y-7 border-t border-line p-6">
              <DetailSection id={`${detailId}-what`} label="¿Qué cambió?">
                {ticket.whatChanged}
              </DetailSection>
              <DetailSection id={`${detailId}-why`} label="¿Por qué es útil?">
                {ticket.whyUseful}
              </DetailSection>

              <div id={`${detailId}-where`} className="scroll-mt-52">
                <SubHead>¿Dónde lo encuentro?</SubHead>
                <WhereToFind path={ticket.whereToFind} className="mt-3" />
              </div>

              {ticket.beforeAfter && (
                <div id={`${detailId}-before`} className="scroll-mt-52">
                  <SubHead>Antes y después</SubHead>
                  <div className="mt-3">
                    <BeforeAfterSlider data={ticket.beforeAfter} />
                  </div>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-mute">
                    Arrastrá el control para comparar. {ticket.beforeAfter.beforeCaption} →{" "}
                    {ticket.beforeAfter.afterCaption}.
                  </p>
                </div>
              )}

              {ticket.screenshots.length > 0 && (
                <div id={`${detailId}-shots`} className="scroll-mt-52">
                  <SubHead>Capturas</SubHead>
                  <div className="mt-3">
                    <ScreenshotGallery screenshots={ticket.screenshots} />
                  </div>
                </div>
              )}

              <div className="border-t border-line pt-5">
                <Reactions ticketCode={ticket.code} counts={ticket.reactions} />
              </div>
            </div>
          </MDiv>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Mono sub-head divider: label + trailing hairline rule (.sub-h from globals). */
function SubHead({ children }: { children: React.ReactNode }) {
  return <p className="sub-h">{children}</p>;
}

function DetailSection({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-52">
      <SubHead>{label}</SubHead>
      <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
        {children}
      </p>
    </div>
  );
}
