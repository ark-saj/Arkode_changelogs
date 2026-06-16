"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Images, Lightbulb, Sparkles, Wand2 } from "lucide-react";

import { StatusBadge } from "@/components/changelog/status-badge";
import { WhereToFind } from "@/components/changelog/where-to-find";
import { Reactions } from "@/components/changelog/reactions";
import { ScreenshotGallery } from "@/components/changelog/screenshot-gallery";
import { BeforeAfterSlider } from "@/components/changelog/before-after-slider";
import { CategoryIcon } from "@/components/changelog/category-icon";
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

  // Sections present in this ticket — used for the in-card jump index.
  const sections = [
    { id: "what", label: "Qué cambió" },
    { id: "why", label: "Por qué" },
    { id: "where", label: "Dónde" },
    ...(ticket.beforeAfter ? [{ id: "before", label: "Antes/Después" }] : []),
    ...(ticket.screenshots.length > 0 ? [{ id: "shots", label: "Capturas" }] : []),
  ];
  // Only long tickets (with before/after or screenshots) need the navigation.
  const showIndex = Boolean(ticket.beforeAfter) || ticket.screenshots.length > 0;

  return (
    <div
      id={`t-${ticket.code}`}
      className={cn(
        "group scroll-mt-28 rounded-2xl glass glass-highlight transition-shadow hover:shadow-glass-lg",
        ticket.featured && "ring-1 ring-brand/30",
      )}
    >
      {/* Header — always visible, scannable */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={detailId}
        className="flex w-full items-start gap-4 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
              {ticket.featured && <Sparkles className="h-3 w-3 text-brand" />}
              {ticket.code}
            </span>
            <StatusBadge status={ticket.status} />
          </div>
          <h4 className="font-display text-base font-semibold leading-snug tracking-tight">
            {ticket.title}
          </h4>
          <p className="mt-1 font-description text-sm leading-relaxed text-muted-foreground">
            {ticket.summary}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180 text-brand",
          )}
        />
      </button>

      {/* Footer meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 pb-4 text-xs text-muted-foreground">
        {category && (
          <span className="inline-flex items-center gap-1.5">
            <CategoryIcon name={category.icon} className="h-3.5 w-3.5 text-brand" />
            {category.name}
          </span>
        )}
        {ticket.screenshots.length > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Images className="h-3.5 w-3.5" />
            {ticket.screenshots.length}{" "}
            {ticket.screenshots.length === 1 ? "captura" : "capturas"}
          </span>
        )}
        {!open && (
          <span className="ml-auto font-medium text-brand">Ver detalles</span>
        )}
      </div>

      {/* Expandable detail */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={detailId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-border/50 p-5">
              {showIndex && (
                <TicketIndex detailId={detailId} sections={sections} />
              )}

              <Section
                id={`${detailId}-what`}
                icon={<Wand2 className="h-4 w-4" />}
                title="¿Qué cambió?"
              >
                {ticket.whatChanged}
              </Section>
              <Section
                id={`${detailId}-why`}
                icon={<Lightbulb className="h-4 w-4" />}
                title="¿Por qué es útil?"
              >
                {ticket.whyUseful}
              </Section>

              <div id={`${detailId}-where`} className="scroll-mt-52">
                <SectionLabel>¿Dónde lo encuentro?</SectionLabel>
                <WhereToFind path={ticket.whereToFind} />
              </div>

              {ticket.beforeAfter && (
                <div id={`${detailId}-before`} className="scroll-mt-52">
                  <SectionLabel>Antes y después</SectionLabel>
                  <BeforeAfterSlider data={ticket.beforeAfter} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Arrastrá el control para comparar. {ticket.beforeAfter.beforeCaption} →{" "}
                    {ticket.beforeAfter.afterCaption}.
                  </p>
                </div>
              )}

              {ticket.screenshots.length > 0 && (
                <div id={`${detailId}-shots`} className="scroll-mt-52">
                  <SectionLabel>Capturas</SectionLabel>
                  <ScreenshotGallery screenshots={ticket.screenshots} />
                </div>
              )}

              <div className="border-t border-border/50 pt-4">
                <Reactions ticketCode={ticket.code} counts={ticket.reactions} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
      {children}
    </p>
  );
}

/** In-card jump index for long tickets — anchors to each section. */
function TicketIndex({
  detailId,
  sections,
}: {
  detailId: string;
  sections: { id: string; label: string }[];
}) {
  const go = (id: string) => {
    document
      .getElementById(`${detailId}-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <nav aria-label="Secciones de este cambio" className="flex flex-wrap gap-1.5">
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => go(s.id)}
          className="rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-brand"
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}

function Section({
  id,
  icon,
  title,
  children,
}: {
  id?: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="flex scroll-mt-52 gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 font-description text-sm leading-relaxed text-muted-foreground">
          {children}
        </p>
      </div>
    </div>
  );
}
