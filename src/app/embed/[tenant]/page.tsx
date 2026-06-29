import { notFound } from "next/navigation";

import { TicketCard } from "@/components/changelog/ticket-card";
import { readChangelogData } from "@/lib/data/changelog-read";
import { verifyEmbedToken } from "@/lib/auth/embed-token";
import { getServiceClient } from "@/lib/supabase/service";
import { formatLongDate, pluralize } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Public, read-only embed of a tenant's changelog (Fase 4 — Odoo PoC).
 *
 * Lives OUTSIDE the guarded `[tenant]` layout: there is no Supabase session
 * here. Authorization is the signed embed token in the URL, which names exactly
 * one tenant. Data is read via the service client scoped to that tenant — the
 * token is the only thing that authorizes showing this content in an iframe.
 *
 * Chrome-less by design (no top bar, sidebar, search, or theme toggle) so it
 * sits cleanly inside an Odoo Website/Portal page.
 */
export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { tenant: slug } = await params;
  const { token } = await searchParams;

  // The token must be valid AND name this exact tenant.
  if (verifyEmbedToken(token) !== slug) notFound();

  const data = await readChangelogData(getServiceClient(), slug);
  if (!data.tenant) notFound();

  const categoryByKey = new Map(data.categories.map((c) => [c.key, c]));
  const totalTickets = data.entries.reduce(
    (n, e) => n + e.tickets.length,
    0,
  );

  return (
    <div className="min-h-screen bg-canvas">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-mute">
            Centro de Novedades
          </span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {data.tenant.name}
          </h1>
          {totalTickets > 0 && (
            <p className="mt-1 text-sm text-mute">
              {pluralize(totalTickets, "novedad", "novedades")} ·{" "}
              {pluralize(data.entries.length, "publicación", "publicaciones")}
            </p>
          )}
          <div className="mt-5 h-px w-14 bg-coral" />
        </header>

        {data.entries.length === 0 ? (
          <p className="text-sm text-mute">Todavía no hay novedades publicadas.</p>
        ) : (
          <div className="space-y-12">
            {data.entries.map((entry, entryIndex) => (
              <section key={entry.id}>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-ink">
                    {entry.title ?? formatLongDate(entry.date)}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-mute">
                    {formatLongDate(entry.date)}
                  </p>
                  {entry.summary && (
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                      {entry.summary}
                    </p>
                  )}
                </div>
                <div className="space-y-4">
                  {entry.tickets.map((ticket, ticketIndex) => (
                    <TicketCard
                      key={ticket.code}
                      ticket={ticket}
                      category={categoryByKey.get(ticket.categoryKey)}
                      defaultOpen={entryIndex === 0 && ticketIndex === 0}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <footer className="mt-12 border-t border-line pt-5 text-[11px] text-faint">
          Novedades de {data.tenant.name} · Arkode Centro de Novedades
        </footer>
      </main>
    </div>
  );
}
