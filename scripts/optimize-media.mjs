#!/usr/bin/env node
/* Arkode — Capturas media optimizer.
 *
 * Prepares Odoo screenshots and GIFs for the changelog portal so uploads stay
 * light. Run it on a folder of raw captures, then upload the OUTPUT files to
 * Supabase Storage and put their public URLs on the Screenshot record.
 *
 *   node scripts/optimize-media.mjs ./media-inbox ./media-optimized
 *   npm run optimize:media -- ./media-inbox
 *
 * What it does, by file type:
 *   - Images (png/jpg/jpeg/webp/avif/tiff) -> resized WebP (max width 1600), q78.
 *   - GIFs                                  -> MP4 (h264) + WebM (vp9) + poster.jpg.
 *   - Videos (mp4/mov/webm/m4v/avi)         -> capped MP4 + WebM + poster.jpg.
 *
 * For a GIF/video, attach the .mp4 URL as the Screenshot `url` (kind:"video")
 * and the poster .jpg as `poster`. The portal autoplays it muted + looping and
 * only loads it while on screen. WebM is produced as an optional smaller source.
 *
 * Requirements:
 *   - sharp  (already in node_modules; if missing: npm i -D sharp)
 *   - ffmpeg on PATH for GIF/video  (macOS: brew install ffmpeg)
 */
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { extname, join, basename } from "node:path";
import { spawnSync } from "node:child_process";

const MAX_W = 1600;
const IMG_QUALITY = 78;

const [, , inDirArg = "./media-inbox", outDirArg = "./media-optimized"] = process.argv;
const inDir = inDirArg;
const outDir = outDirArg;

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".tiff"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".webm", ".m4v", ".avi"]);

function hasFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return r.status === 0;
}
function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: ["ignore", "ignore", "inherit"] });
  return r.status === 0;
}
function kb(bytes) {
  return (bytes / 1024).toFixed(0) + " KB";
}
function sizeOf(p) {
  try {
    return statSync(p).size;
  } catch {
    return 0;
  }
}

async function main() {
  if (!existsSync(inDir)) {
    console.error(`Input folder not found: ${inDir}`);
    console.error(`Usage: node scripts/optimize-media.mjs <inDir> [outDir]`);
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });

  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("sharp is not installed. Run: npm i -D sharp");
    process.exit(1);
  }

  const ffmpeg = hasFfmpeg();
  const files = readdirSync(inDir).filter((f) => statSync(join(inDir, f)).isFile());
  if (files.length === 0) {
    console.log(`No files in ${inDir}.`);
    return;
  }

  let inTotal = 0;
  let outTotal = 0;
  const rows = [];

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const stem = basename(file, ext);
    const src = join(inDir, file);
    const inSize = sizeOf(src);

    if (IMAGE_EXT.has(ext)) {
      const out = join(outDir, `${stem}.webp`);
      await sharp(src)
        .rotate()
        .resize({ width: MAX_W, withoutEnlargement: true })
        .webp({ quality: IMG_QUALITY })
        .toFile(out);
      const outSize = sizeOf(out);
      inTotal += inSize;
      outTotal += outSize;
      rows.push([file, "image", kb(inSize), `${stem}.webp`, kb(outSize)]);
      continue;
    }

    if (ext === ".gif" || VIDEO_EXT.has(ext)) {
      if (!ffmpeg) {
        rows.push([file, "skip", kb(inSize), "ffmpeg not found", "-"]);
        continue;
      }
      const scale = `scale='min(${MAX_W},iw)':-2`;
      const mp4 = join(outDir, `${stem}.mp4`);
      const webm = join(outDir, `${stem}.webm`);
      const poster = join(outDir, `${stem}.jpg`);
      run("ffmpeg", ["-y", "-i", src, "-vf", scale, "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "26", "-preset", "medium", "-movflags", "+faststart", mp4]);
      run("ffmpeg", ["-y", "-i", src, "-vf", scale, "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34", webm]);
      run("ffmpeg", ["-y", "-i", src, "-vf", scale, "-frames:v", "1", poster]);
      const outSize = sizeOf(mp4) + sizeOf(webm) + sizeOf(poster);
      inTotal += inSize;
      outTotal += outSize;
      rows.push([file, ext === ".gif" ? "gif→video" : "video", kb(inSize), `${stem}.mp4 (+webm,+jpg)`, kb(outSize)]);
      continue;
    }

    rows.push([file, "ignored", kb(inSize), "-", "-"]);
  }

  console.log(`\nArkode media optimizer  ·  ${inDir} → ${outDir}\n`);
  for (const [f, type, before, out, after] of rows) {
    console.log(`  ${type.padEnd(10)} ${f}  (${before})  →  ${out}  (${after})`);
  }
  if (inTotal > 0) {
    const saved = (100 * (1 - outTotal / inTotal)).toFixed(0);
    console.log(`\n  Total: ${kb(inTotal)} → ${kb(outTotal)}  (${saved}% lighter)`);
  }
  if (!ffmpeg) {
    console.log(`\n  Note: ffmpeg not found — GIFs/videos were skipped. Install it (e.g. brew install ffmpeg) to convert them.`);
  }
  console.log(`\n  Next: upload the files in ${outDir} to Supabase Storage and set`);
  console.log(`  the Screenshot url (and poster for videos) to their public URLs.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
