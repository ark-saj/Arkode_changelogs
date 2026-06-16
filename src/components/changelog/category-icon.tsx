import {
  Boxes,
  Briefcase,
  type LucideIcon,
  ReceiptText,
  ShoppingCart,
  Truck,
  UserRound,
  Sparkles,
} from "lucide-react";

/** Map category icon names (stored as strings) to Lucide components. */
const ICONS: Record<string, LucideIcon> = {
  UserRound,
  ShoppingCart,
  Boxes,
  Truck,
  Briefcase,
  ReceiptText,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} />;
}
