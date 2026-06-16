/** Spanish-language formatting helpers. UI copy lives close to where it is used. */

const LONG_DATE = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const SHORT_DATE = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
});

/** Parse a YYYY-MM-DD string as a local date (avoids UTC off-by-one). */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** "12 de junio de 2026" */
export function formatLongDate(iso: string): string {
  return LONG_DATE.format(parseISODate(iso));
}

/** "12 jun" */
export function formatShortDate(iso: string): string {
  return SHORT_DATE.format(parseISODate(iso)).replace(".", "");
}

/** Pluralize a count with a Spanish noun: pluralize(1,"mejora","mejoras") */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "hace 3 días" style relative label, capped for readability. */
export function relativeLabel(iso: string, now = new Date()): string {
  const date = parseISODate(iso);
  const days = Math.round((now.getTime() - date.getTime()) / 86_400_000);
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`;
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`;
  return formatLongDate(iso);
}
