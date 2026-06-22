"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/* Renders real uploaded media (image or video) for a Capturas slot.
   - Static images go through next/image: responsive, lazy, served as WebP/AVIF.
   - Videos (the converted GIFs) autoplay muted + loop ("start running"), but are
     gated by an IntersectionObserver so they only load and play while on screen.
     This keeps a page with many clips light on bandwidth and CPU. */

const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

export function isVideoUrl(url: string): boolean {
  return VIDEO_RE.test(url);
}

export function MediaFrame({
  url,
  kind,
  poster,
  alt = "",
  className,
}: {
  url: string;
  kind?: "image" | "video";
  poster?: string;
  alt?: string;
  className?: string;
}) {
  const isVideo = kind === "video" || (kind !== "image" && isVideoUrl(url));

  if (isVideo) {
    return (
      <VideoFrame url={url} poster={poster} className={className} />
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-[16/10] overflow-hidden bg-bone",
        className,
      )}
    >
      <Image
        src={url}
        alt={alt}
        fill
        loading="lazy"
        quality={78}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}

function VideoFrame({
  url,
  poster,
  className,
}: {
  url: string;
  poster?: string;
  className?: string;
}) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  // Only attach the source (start downloading) once the clip scrolls into view.
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(true);
          const v = videoRef.current;
          if (!v) continue;
          // Pause offscreen to save CPU; resume when back in view.
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative aspect-[16/10] overflow-hidden bg-ink",
        className,
      )}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        poster={poster}
      >
        {active ? <source src={url} /> : null}
      </video>
    </div>
  );
}
