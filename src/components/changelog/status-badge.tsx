import { Badge } from "@/components/ui/badge";
import { STATUS_META } from "@/lib/changelog-meta";
import { cn } from "@/lib/utils";
import type { TicketStatus } from "@/lib/types";

export function StatusBadge({
  status,
  className,
}: {
  status: TicketStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <Badge className={cn("border", meta.badgeClass, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-[1px]", meta.dotClass)} />
      {meta.label}
    </Badge>
  );
}
