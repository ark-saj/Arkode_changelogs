# Mosaic Redesign — Implementation Spec (the contract)

This is the single source of truth for the complete visual redesign of the `arkode-changelogs`
Next.js app. Every build agent MUST read this file plus the raw design source in this folder
(`arkode-tokens.css`, `mosaic.css`, `pixel-option3.js`, `mosaic-canvas.js`, `grain.svg`).

## What we are building

A premium client-facing **changelog / "Novedades del Sistema"** portal. Arkode consultants write
changelogs for the Odoo implementations they run; each client's staff opens the portal to see
what changed, why it helps, and where to find it. Goal: drive adoption. The current build nailed
the content but the design is wrong: it uses glassmorphism + iridescent "liquid glass" blobs +
dark-mode-default. We are replacing that entirely with the **Arkode Mosaic design system**.

## Two locked product decisions (do not re-litigate)

1. **Light Mosaic only.** Warm light canvas (`#FAF8F3`) is THE product look. Navy "ink" sections
   (`#001C43`) with a grain overlay provide contrast and drama. **Remove dark mode entirely**:
   no `next-themes`, no `ThemeProvider`, no theme toggle, no `.dark` styles, default `<html>` light.
2. **Fixed Arkode coral everywhere.** Every client portal uses the same fixed Arkode Mosaic palette.
   Coral `#FF6C5D` is the single functional accent. **Remove all per-tenant color theming**
   (`--brand`, `--brand-soft`, `--blob-*`, `style={tenant.vars}` color injection). Tenant identity
   is still per-client: **name, tagline, logo** vary; **color never does.**

## Hard rules (non-negotiable, apply to every file)

- **No glassmorphism.** Delete `.glass`, `.glass-strong`, `.glass-panel`, `.glass-highlight`,
  `backdrop-blur` decoration, the `glass` button variant, iridescent/chrome/pearlescent blobs,
  `LiquidBackground`. The Mosaic look is opaque surfaces, hairline borders, structural grid.
- **No dark mode.** See decision 1.
- **Two fonts only: Geist + Geist Mono.** Drop Inter and Newsreader. Load via `next/font/google`
  (`Geist`, `Geist_Mono`). Headings: Geist 600, `letter-spacing:-0.045em`, `line-height:0.98`.
  Body: Geist 400, `line-height:1.45`. Mono eyebrows/labels/codes/metrics: Geist Mono, uppercase,
  `letter-spacing:0.12em–0.16em`.
- **One coral per view.** Coral is the ONE functional accent (primary CTA, the single key gesture,
  active state). If coral is on the button, it's not also on the headline. Everything else is
  ink / text-soft / mute / lines. Status badges are the one categorical exception (see below) and
  must be styled as muted mono tints so they read as a legend, not competing accents.
- **Mosaic accent palette (`orange #FF8A3D`, `crimson #C5362A`, `blue #2A6FDB`) is illustration-only**
  — used inside the generative mosaic canvas, pixel icons, and status-badge tints. Never as UI chrome.
- **Editorial structure.** Mono eyebrow (`00 · LABEL`) → conclusion headline → supporting body.
  Sections separated by 1px `--line` hairlines. Generous whitespace. 6-col mental grid, `--maxw 1180–1280px`.
- **Motion = restraint.** Reveal-on-scroll (fade+translateY 20px), count-up on KPIs, the generative
  mosaic canvas, hover lifts (`translateY(-1px)`). All reduced-motion-safe. No bounce, no parallax-on-
  everything, no scroll-jacking. One motion moment per viewport.
- **Spanish copy is preserved verbatim.** This is a Mexico-market product. Do not translate,
  do not rewrite copy. Only change structure/style/markup.
- **Preserve all data, types, logic, routing, auth.** See "Do not touch" below.

## Token mapping (exact values in `design-reference/arkode-tokens.css`)

The app currently uses HSL-triplet CSS vars consumed as `hsl(var(--x))`. Replace the token layer
with the Mosaic tokens. Define them in `globals.css` `:root` as hex (and keep a small set of
Tailwind-friendly names). Foundation agent: mirror `arkode-tokens.css` exactly.

| Role | Token | Value |
|---|---|---|
| Page background | `--canvas` | `#FAF8F3` |
| Warm surface | `--bone` / `--bone-2` | `#F4ECDE` / `#EFE6D6` |
| Dark surface + primary text | `--ink` | `#001C43` |
| Text soft / muted / faint | `--ink-soft` / `--mute` / `--faint` | `#33405E` / `#6B7390` / `#9AA1B6` |
| Lines | `--line` / `--line-2` / `--hair` | `#E4DECF` / `#D7CFBC` / `rgba(0,28,67,0.09)` |
| Accent (THE coral) | `--coral` / `--coral-deep` | `#FF6C5D` / `#E8503F` |
| Mosaic accents (illustration only) | `--orange`/`--crimson`/`--blue`/`--green` | `#FF8A3D`/`#C5362A`/`#2A6FDB`/`#1F8A5B` |
| Radius | `--r-sm`/`--r-md`/`--r-lg` | `6px`/`9px`/`14px` |
| Elevation | `--e1`/`--e2`/`--e3` | per tokens file |
| Motion | `--ease`/`--dur-*` | `cubic-bezier(0.22,0.68,0,1)` / 120·200·320ms |
| Spacing | `--space-1..24` | 4px base scale |

**Status colors** (changelog `TicketStatus`), styled as muted mono badge tints (bg = color @ ~12%,
text = the color), like the showcase `.badge`:

| Status | ES label | Color | Token |
|---|---|---|---|
| `new` | Nuevo | coral-deep `#E8503F` | the brand tint — new features are the star |
| `improvement` | Mejora | blue `#2A6FDB` | |
| `fix` | Corrección | crimson `#C5362A` | |
| `optimization` | Optimización | orange `#FF8A3D` | |

## Shared Mosaic primitives to CREATE (React ports of the vanilla engines)

Create under `src/components/mosaic/`. These are imported across the app.

- `pixel-icon.tsx` — `<PixelIcon name unit={5} tint?/>`. Port `pixel-option3.js`: same SPRITES map,
  render the pixel sprite via a single `box-shadow` string on an absolutely-positioned inner span
  inside a sized wrapper. Pure, SSR-safe (compute box-shadow in render, no DOM hydration script).
  Export the sprite-name union type. Use for interface/industry/data icons throughout.
- `mosaic-canvas.tsx` — `<MosaicCanvas cols={3} rows={3} className/>`. Port `mosaic-canvas.js`:
  animated generative grid of coral/orange/navy/bone cells on a `<canvas>`, `requestAnimationFrame`
  in `useEffect`, IntersectionObserver pause when offscreen, `prefers-reduced-motion` → static.
- `reveal.tsx` — `<Reveal delay?>` wrapper + `useReveal` hook. Port `mosaic-reveal.js`: adds `.in`
  when scrolled into view (IntersectionObserver, threshold 0.08), fail-safe timeout, reduced-motion
  shows immediately. CSS: hidden = `opacity:0;translateY(20px)`, `.in` = visible, `.7s var(--ease)`.
- `count-up.tsx` — `<CountUp to suffix? prefix?/>`. Port the `countUp` fn from `motion.js`: cubic
  ease-out count from 0 to `to` over ~1.1s when revealed. Used by KPI dashboard.
- `eyebrow.tsx` — `<Eyebrow num? children/>` → mono uppercase label `00 · Foundations`, coral-deep `num`.
- `section.tsx` — `<Section tone="canvas"|"bone"|"ink"/>`. `ink` tone gets the grain overlay
  (`::after` with `grain.svg`, `mix-blend-mode:overlay`, opacity 0.5) and light text.
- `grain.svg` → copy `design-reference/grain.svg` to `public/grain.svg`; ink sections reference it.

Keep these vanilla-faithful to the originals so the look matches the showcase exactly.

## Mosaic component patterns to reuse (from the showcase HTML)

- **Nav**: fixed, 60px, `rgba(250,248,243,0.85)` + `backdrop-filter:blur(12px)` bar (this blur is the
  ONE allowed blur — a sticky nav over content, not decorative), hairline appears on scroll, Arkode
  wordmark left + mono tag, coral scroll-progress line at top (`.progress`).
- **Hero**: huge Geist 600 headline (`clamp(44px,8vw,116px)`, `-0.05em`), mono klabel above, sub
  paragraph, then a `hero-meta` 4-cell hairline grid (mono `k` label + value). One coral word or the
  generative mosaic as the single gesture.
- **Section head**: `eyebrow` → `h2` (`clamp(30px,4.4vw,58px)`) → muted `p`.
- **Cards**: white `#fff` fill, `1px solid --line`, `--r-lg` (14px), `--e1` shadow, hover → `--e2` +
  `translateY(-1px)`. NOT glass.
- **Badges**: mono, `--r-sm`, tinted bg (see status table). **Metrics**: bordered cell, big Geist 600
  number + mono label. **List rows**: hover bg `--bone`.
- **Data viz**: bar pairs (`mine`=coral, `them`=line-2), mosaic-canvas cards, line-draw, donut sweep,
  data-mosaic (cells lighting to encode a %). Use where the changelog shows counts/metrics.
- **Sub-head divider**: `.sub-h` mono label with a trailing hairline rule.
- **Footer**: ink + grain, Arkode wordmark, mono fine print.

## FILE OWNERSHIP (zero overlap — each file is written by exactly one agent/phase)

### Phase: Foundation · tokens  (1 agent, serial, FIRST)
- `src/app/globals.css` — full rewrite to Mosaic tokens + base type + Mosaic utility classes
  (`.eyebrow`, `.sec`, `.sec.bone`, `.sec.ink`+grain, `.sub-h`, `.reveal`/`.in`, `.btn*`, `.badge*`,
  `.card`, `.hairline`, nav, progress, footer). Remove ALL glass/dark/blob CSS.
- `tailwind.config.ts` — colors → Mosaic hex tokens; fonts → Geist + Geist Mono only; radii 6/9/14;
  shadows e1/e2/e3; keep `fade-up`, add reveal/`float` only if used by mosaic; remove glass shadows,
  `brand`/`blob`/`status` HSL color families (replace `status` with the Mosaic status hexes), remove
  the dark `ark.*` duplication (canonicalize on Mosaic tokens).
- `src/app/layout.tsx` — fonts: `Geist` + `Geist_Mono` only (drop Inter/Newsreader). Remove
  `ThemeProvider`. `<html lang="es">` (no `class` theme). Set body bg canvas, base font.
- `src/lib/branding.ts` — strip per-tenant color vars. Keep `BrandTheme` as `{key,name,tagline,logo?}`.
  `brandStyle()` returns `{}` (or remove usages). Keep `getBrand`/`getActiveBrand`. Themes keep
  name/tagline/logo only.
- `src/lib/changelog-meta.ts` — `STATUS_META` → Mosaic status colors/labels (table above), as token
  refs or hex. `REACTION_META` unchanged in meaning (Spanish labels kept).
- Copy `design-reference/grain.svg` → `public/grain.svg`.

### Phase: Foundation · primitives  (1 agent, serial, SECOND — after tokens)
- CREATE `src/components/mosaic/pixel-icon.tsx`, `mosaic-canvas.tsx`, `reveal.tsx`, `count-up.tsx`,
  `eyebrow.tsx`, `section.tsx` (per "primitives" above).
- REWRITE `src/components/ui/button.tsx` (variants: `coral` [primary], `dark`, `ghost`/outline with
  `--line-2` border; remove `glass`), `card.tsx` (Mosaic card, no glass), `badge.tsx` (mono tinted),
  `input.tsx` (canvas bg, `--line-2` border, coral focus ring `0 0 0 3px rgba(255,108,93,0.14)`),
  `dialog.tsx` (opaque `#fff` panel, `--e3`, hairline; remove glass-strong).
- DELETE/replace `src/components/decor/liquid-background.tsx` → either delete and remove imports, or
  replace with a minimal Mosaic backdrop component `src/components/decor/mosaic-backdrop.tsx` that
  renders nothing heavy (the Mosaic look needs no decorative background; prefer a no-op/remove).
  Coordinate: this agent removes the component and any import is fixed by whoever owns the importer.

### Phase: Components  (parallel; each group = 1 agent; disjoint files)
Preserve every component's **prop signature / export name** exactly (the orchestrator depends on them).
Restyle markup + classes to Mosaic. Keep Spanish copy.
- **G1 — Hero + KPIs**: `src/components/changelog/hero.tsx`, `kpi-dashboard.tsx`. Hero = Mosaic hero
  (big Geist headline, mono klabel, hero-meta hairline grid, generative `MosaicCanvas` as the gesture).
  KPIs = bordered metric cells with `CountUp` + `PixelIcon`.
- **G2 — Controls + small bits**: `search-bar.tsx`, `filter-bar.tsx`, `status-badge.tsx`,
  `category-icon.tsx`, `where-to-find.tsx`, `empty-state.tsx`. status-badge uses STATUS_META tints +
  mono. category-icon may map category→`PixelIcon` name (or keep Lucide but restyle; prefer PixelIcon).
  filter chips: active = coral, inactive = `--line-2` ghost. where-to-find = mono breadcrumb with
  `PixelIcon arrowR` separators.
- **G3 — Timeline**: `timeline.tsx`, `changelog-entry.tsx`. Vertical hairline rail (1px `--line`),
  date node (mono date, coral dot for latest), entry title Geist 600, summary muted, ticket cards listed.
- **G4 — Ticket card + reactions**: `ticket-card.tsx`, `reactions.tsx`. Expandable Mosaic card: header
  row (mono code + status badge + Geist title + summary) → expanded detail (¿Qué cambió? / ¿Por qué es
  útil? / ¿Dónde lo encuentro? as mono sub-h labels). reactions = ghost pill buttons, coral when active.
- **G5 — Media**: `highlights.tsx`, `screenshot-gallery.tsx`, `before-after-slider.tsx`,
  `mock-screenshot.tsx`. highlights = 3-col Mosaic cards. gallery lightbox = opaque `#fff` dialog +
  `--e3`. before/after slider keep interaction, restyle handle coral. mock-screenshot = redraw the
  deterministic Odoo mockups in Mosaic palette (canvas/ink/line, coral accent), no glass.
- **G6 — Shell + orchestrator**: `src/components/layout/site-header.tsx`, `site-footer.tsx`,
  `src/components/changelog/changelog-explorer.tsx`, and DELETE `theme-toggle.tsx`. site-header =
  Mosaic nav (wordmark + mono tenant tag + scroll progress; NO theme toggle; keep settings/logout if
  present, restyle as ghost). site-footer = ink+grain or hairline footer with data-source note.
  explorer = compose the sections with Mosaic `Section` tones (alternate canvas/bone), section heads
  with `Eyebrow`; preserve all search/filter/featured logic and state exactly. Keep `logout-button.tsx`
  styling minimal (this agent may restyle it too).

### Phase: Pages & wiring  (1 agent, serial, after Components)
- `src/app/[tenant]/layout.tsx` — remove per-tenant color `style` injection; keep tenant
  name/tagline/logo; apply Mosaic shell (header/footer), canvas bg. No ThemeProvider.
- `src/app/[tenant]/page.tsx` — ensure it renders the redesigned explorer; minimal changes.
- `src/app/[tenant]/configuracion/page.tsx` — restyle logo uploader form to Mosaic (fields/buttons).
- `src/app/(auth)/layout.tsx` + `login/page.tsx` — restyle login: light canvas (NOT near-black),
  Arkode wordmark, Mosaic card form, coral primary button. Keep Supabase auth logic intact.
- `src/app/page.tsx` (root redirect) — logic unchanged.
- DELETE `src/components/layout/theme-provider.tsx` and remove all `next-themes` usage/import.
- Remove `next-themes` from `package.json` deps only if trivially safe; otherwise leave the dep and
  just stop importing it (do NOT break install).
- Fix any broken imports left by removed components (LiquidBackground, theme toggle/provider).

### Phase: Typecheck & build  (1 agent, serial, last)
- Run `npm run typecheck` then `npm run build`. Fix every error until both pass. Do not change data,
  types, or copy to make build pass — fix the styling/markup. Report files changed + pass/fail.

## Do NOT touch (logic — preserve exactly)
`src/lib/types.ts`, `src/lib/data/*` (repository, mock-repository, supabase-repository, mock-data,
compute-stats, tenant-context), `src/lib/format.ts`, `src/lib/supabase/*`, `src/lib/actions/*`,
`src/middleware.ts`, `src/lib/utils.ts`. Supabase schema/migrations. The data contract is frozen.

## Definition of done
`npm run typecheck` and `npm run build` pass. No glass/dark/blob/Inter/Newsreader/next-themes remnants.
Every screen reads as the Arkode Mosaic system: warm canvas, navy ink+grain sections, Geist + Geist
Mono, hairline editorial structure, one coral accent per view, pixel icons, generative mosaic. Spanish
copy intact. Data model and routes unchanged.
