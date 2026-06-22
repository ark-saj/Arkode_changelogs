import { PixelIcon, type PixelIconName } from "@/components/mosaic/pixel-icon";

/**
 * Map stored category icon names (legacy Lucide names) to Mosaic pixel sprites.
 * Falls back to `cube` for any unknown name. Prop API is unchanged.
 */
const ICONS: Record<string, PixelIconName> = {
  UserRound: "user",
  ShoppingCart: "money",
  Boxes: "cube",
  Truck: "truck",
  Briefcase: "brief",
  ReceiptText: "doc",
  Factory: "factory",
  Database: "database",
};

export function CategoryIcon({
  name,
  className,
  unit = 4,
  weight = "fine",
  tint,
}: {
  name: string;
  className?: string;
  unit?: number;
  weight?: "inset" | "fine";
  /** Force a single color (e.g. ink) instead of the sprite's own palette. */
  tint?: string;
}) {
  const sprite = ICONS[name] ?? "cube";
  // Category/module icons read as feature marks, not dense inline glyphs, so they
  // use the airy fine (70%) weight by default. unit >= 4 keeps 70% legible.
  return (
    <PixelIcon name={sprite} unit={unit} weight={weight} tint={tint} className={className} />
  );
}
