import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/changelog/media-frame";
import { PixelIcon } from "@/components/mosaic/pixel-icon";
import type { Screenshot } from "@/lib/types";

type Variant = NonNullable<Screenshot["variant"]>;

/**
 * A Capturas slot. When a real `url` is set (Odoo screenshot or converted clip)
 * it is rendered and optimized by MediaFrame. Otherwise we show a calm, premium
 * "captura pendiente" frame: warm bone surface, one muted pixel mark, the caption.
 * Honest and quiet, it stays out of the way until the real image is uploaded.
 */
export function MockScreenshot({
  url,
  kind,
  poster,
  alt,
  className,
}: {
  /** Visual style hint for legacy data; unused by the pending frame. */
  variant?: Variant;
  /** Deterministic seed for legacy data; unused by the pending frame. */
  seed?: number;
  url?: string;
  kind?: "image" | "video";
  poster?: string;
  alt?: string;
  className?: string;
}) {
  if (url) {
    return (
      <MediaFrame
        url={url}
        kind={kind}
        poster={poster}
        alt={alt}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex aspect-[16/10] flex-col items-center justify-center gap-3 bg-bone px-6 text-center",
        className,
      )}
    >
      <PixelIcon name="squares" unit={5} tint="#A1A7BB" />
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
        Captura pendiente
      </span>
      {alt && (
        <span className="max-w-[26ch] font-sans text-[12.5px] leading-snug text-mute">
          {alt}
        </span>
      )}
    </div>
  );
}
