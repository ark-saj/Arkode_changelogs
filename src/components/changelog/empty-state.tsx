import { SearchX } from "lucide-react";

export function EmptyState({
  title = "Sin resultados",
  description = "Probá ajustando la búsqueda o quitando algunos filtros.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl glass px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand">
        <SearchX className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
