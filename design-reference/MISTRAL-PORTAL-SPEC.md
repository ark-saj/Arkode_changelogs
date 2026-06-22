# Mistral-Inspired Portal Rebuild — Spec v2 (the contract)

Read this AFTER `MOSAIC-IMPLEMENTATION-SPEC.md`. The Mosaic visual foundation (tokens, fonts,
pixel icons, generative canvas, primitives) is DONE and stays. This v2 changes the **architecture
and interaction model**: from a single-scroll editorial page into a real **portal/app** with the
structure and motion of the Mistral docs site (docs.mistral.ai), expressed in the Arkode Mosaic
palette (coral instead of Mistral orange, navy ink, warm canvas/bone).

## The thesis
This is a web app a client's team opens repeatedly, not a landing page they read once. It must feel
like software: a fixed app shell, persistent navigation, content that scrolls inside the shell,
instant filtering with animated reflow, ⌘K search, route/section transitions, and tactile hover.

## Reference: the Mistral patterns to adopt (described precisely)
1. **Top bar (fixed, full width, ~60px, canvas/85 + blur, hairline-on-scroll).** Left: Arkode
   wordmark + a tenant switcher chip with a caret (the client's name, e.g. "Conec-ta ▾"). Center
   (desktop): a thin row of section tabs, each a mono uppercase label preceded by a small square
   bullet; the active tab's square is coral-filled. Right: a **⌘K search field** (mono "BUSCAR ⌘K"),
   then ghost + a coral filled primary action (e.g. "Salir" ghost; settings gear if admin). On
   mobile the tabs collapse and a hamburger toggles the sidebar drawer.
2. **Left sidebar (persistent, sticky under the top bar, ~260px, hairline right border, own scroll).**
   Top: "⌂ INICIO" row with a hairline under it. Then mono uppercase **section labels** ("MÓDULOS",
   "TIPO DE CAMBIO") each over its own nav group. Nav items are the filters: each module (CRM,
   Ventas, Inventario, Compras, RRHH, Facturación) and each status (Nuevo, Mejora, Corrección,
   Optimización). Item = small pixel icon + label + count. **Active item** = coral left-border bar
   (4px) + bold + faint bone bg; the active bar is a shared-element that **slides** between items
   (Framer `layoutId`). Selecting items filters the content. A "Limpiar filtros" ghost at the bottom.
3. **Content region (the scroll area, max-width ~ 860–920px, centered with right TOC).** Opens with a
   **breadcrumb** (mono uppercase, e.g. "INICIO › NOVEDADES", trailing hairline that extends to the
   right edge). Then a compact **hero** (heavy display headline, gray sub, and the signature
   **fanned-card illustration**). Then **folder-tab sections**: DESTACADOS (highlight cards),
   then LÍNEA DE TIEMPO grouped by month/date, each release rendered with ticket cards.
4. **Right TOC (sticky, ~220px, desktop ≥1200px only).** Mono "EN ESTA PÁGINA" + a list of the
   release dates / sections. Active item = coral square marker + ink text (others muted).
   **Scroll-spy** drives the active state; clicking smooth-scrolls to the section.
5. **Folder-tab section header** (`SectionTab`): a mono uppercase label with a **coral fill**,
   `r-sm` top corners, sitting ON a 1px coral rule that spans the content width. The signature
   Mistral "file folder tab on a rule" element. Use for every section header.
6. **Pixel-logo card** (`PixelCard`): bordered (`--line`) rounded (`r-lg`) white card; **pixel icon
   top-left** (in a soft bone tile), a small **arrow-circle** (↗ inside a hairline circle) top-right,
   bold title, muted description, optional hairline divider + mono footer meta. Hover: lift (y −2px)
   + `--e2` + the arrow-circle nudges. Used for highlights and any "pick one" grid.
7. **Square bullets** (`SquareBullet`): coral filled square (not a dot) for list items; **coral
   numbered steps** (mono coral number) for ordered steps. Use in ticket detail (¿Qué cambió? etc.).
8. **Heavy display headlines**: hero headline Geist **700–800**, ink navy, very tight tracking
   (−0.05em). This gives the Mistral "near-black heavy" punch while staying on Arkode ink.
9. **Fanned-card hero illustration** (`FannedCards`): a stack of 3–4 rounded cards rotated/offset
   like a fanned hand (Mistral's fanned "M" cards), each in a different mosaic accent
   (coral / blue / ink / orange) with a centered pixel icon (mark/bolt/chartBar/cube) and `--e3`
   shadow. On mount they **fan out** (stagger, slight rotation + slide). Reduced-motion = static fan.

## Motion system (Framer Motion — already a dependency; respect `useReducedMotion` everywhere)
Create `src/components/motion/` with reusable variants + wrappers. All transitions use the Mosaic
ease `cubic-bezier(0.22,0.68,0,1)` and durations 120/200/320ms. The discipline rule still holds:
purposeful motion, not motion on everything.
- **PageTransition / section transitions**: wrap the content region; on filter/section change use
  `AnimatePresence` + `motion.div` (fade + 8px slide).
- **Layout reflow on filter**: wrap the timeline/highlight lists in `AnimatePresence` with `layout`
  on each card so filtering **reflows smoothly** (items animate in/out + reposition). This is the
  single most important "app feel" upgrade — filtering must not hard-cut.
- **Sidebar active indicator**: a `layoutId="nav-active"` coral bar that slides between active items.
- **Animated expand/collapse** (ticket card): `AnimatePresence` height auto + content fade/slide.
- **Stagger reveal**: containers use `staggerChildren` (~0.05s) for card grids and timeline entries
  entering the viewport (`whileInView`, `viewport={{ once: true }}`).
- **Hover affordances**: cards lift + shadow; arrow-circle translateX; sidebar items bg fade; nav
  tab square scale. Press = scale 0.98.
- **Count-up** KPIs (exists) + the generative `MosaicCanvas`.
- **Top bar**: scroll-progress coral line + hairline appears on scroll.
- **⌘K command palette** (`CommandPalette`): scale(0.97→1) + fade modal over a solid `ink/55`
  scrim (no decorative blur beyond the standard). Fuzzy-filters tickets by code/title/module;
  ↑/↓ to move, Enter to jump (smooth-scroll + briefly highlight the target card), Esc to close.
  Open with ⌘K / Ctrl-K and from the top-bar search field.

## Architecture (how state stays cohesive)
The whole interactive portal is ONE client component tree so filter/search/scroll state lives in one
place (no cross-layout plumbing):
- `src/app/[tenant]/page.tsx` (server): fetch data, render `<ChangelogPortal data={data}
  tenant={tenant} isAdmin={isAdmin} dataSource={...} />`.
- `src/app/[tenant]/layout.tsx` (server): keep the auth/membership guard ONLY; render `{children}`
  inside a `bg-canvas min-h-screen` wrapper. The portal owns its own top bar + footer now, so
  REMOVE `<SiteHeader>`/`<SiteFooter>` from the layout (the portal renders chrome). configuracion
  page gets a lightweight shared `<TopBar>` + back link.
- `src/components/portal/changelog-portal.tsx` (client, "use client"): the app shell. Owns ALL state
  (query, selectedCategories, selectedStatuses, command-palette open, active TOC section). Renders
  `<TopBar> + <Sidebar> + <main content> + <RightToc> + <CommandPalette>`. Reuses the existing
  feature components (Hero, KpiDashboard, Highlights, Timeline, TicketCard, etc.) inside the content
  region, preserving their data flow. The OLD `changelog-explorer.tsx` logic (filtering, featured
  extraction) moves here (or the portal imports a refactored explorer that exposes the content body).

## FILE OWNERSHIP (zero overlap)

### Phase A — Motion + Mistral primitives (serial, FIRST)
Create:
- `src/components/motion/variants.ts` (shared variants: fade, slideUp, staggerContainer, scaleIn,
  expandCollapse) + `src/components/motion/motion-safe.tsx` (a `<M>`/`<MList>` wrapper that no-ops
  transforms under reduced motion) + `src/components/motion/page-transition.tsx`.
- `src/components/mosaic/section-tab.tsx` (`SectionTab` folder tab), `square-bullet.tsx`
  (`SquareBullet` + `StepNumber`), `arrow-circle.tsx` (`ArrowCircle`), `pixel-card.tsx`
  (`PixelCard`), `fanned-cards.tsx` (`FannedCards`), `use-scroll-spy.ts`.
Do NOT edit feature components here. Report the exact prop APIs.

### Phase B — App shell (serial, after A)
Create `src/components/portal/`:
- `changelog-portal.tsx` (the shell + all state; absorbs explorer filtering logic),
- `top-bar.tsx` (`TopBar`: wordmark, tenant chip, section tabs, ⌘K trigger, actions),
- `sidebar.tsx` (`Sidebar`: filter nav with sliding coral active bar, counts, responsive drawer),
- `right-toc.tsx` (`RightToc`: scroll-spy TOC), `breadcrumb.tsx`, `command-palette.tsx`.
Rewrite `src/app/[tenant]/page.tsx` and `src/app/[tenant]/layout.tsx` to mount the portal (per
Architecture). Compose the EXISTING feature components inside the content region (don't restyle them
here — Phase C does). Wire ⌘K + scroll-spy + responsive drawer. Preserve all data/filter logic and
Spanish copy. High effort — this is the centerpiece.

### Phase C — Animate + Mistral-ify the leaves (parallel; disjoint files)
Each agent restyles + animates ONLY its files; preserve export names + prop signatures.
- **C1 hero**: `src/components/changelog/hero.tsx` — compact heavy headline + `FannedCards`
  illustration with fan-out motion (replaces the lone mosaic square; may keep a small MosaicCanvas).
- **C2 kpi**: `kpi-dashboard.tsx` — Mistral metric cards (pixel icon, count-up, hairline, mono),
  stagger-in.
- **C3 highlights**: `highlights.tsx` — `PixelCard` grid, stagger + hover lift + arrow nudge.
- **C4 ticket+reactions**: `ticket-card.tsx`, `reactions.tsx` — animated expand/collapse
  (AnimatePresence), `SquareBullet`/`StepNumber` in detail, arrow-circle, hover; reactions animate
  on toggle (scale pop). Keep localStorage + Spanish.
- **C5 timeline**: `timeline.tsx`, `changelog-entry.tsx` — section anchors with stable ids
  (`id="rel-<date>"`) for the TOC/scroll-spy, `SectionTab` per month/date, `layout`+stagger so
  filtered reflow animates. Coral rail node for latest.
- **C6 media+small**: `screenshot-gallery.tsx`, `before-after-slider.tsx`, `mock-screenshot.tsx`,
  `status-badge.tsx`, `category-icon.tsx`, `where-to-find.tsx`, `empty-state.tsx`, `search-bar.tsx`,
  `filter-bar.tsx` — Mistral polish + motion (gallery lightbox animated; where-to-find square-bullet
  breadcrumb). search-bar/filter-bar are now consumed by TopBar/Sidebar; keep their exports working
  (Sidebar may import filter logic; if a file becomes unused, leave it compiling, don't delete).

### Phase D — Pages, transitions, chrome (serial, after C)
- `src/app/[tenant]/configuracion/page.tsx`: wrap in the shared `<TopBar>` + back link, Mosaic form.
- `src/app/(auth)/login/page.tsx` + `(auth)/layout.tsx`: align with the new chrome; add a subtle
  entrance motion (fade/scale) to the card. Keep Supabase logic.
- `src/components/layout/site-header.tsx` / `site-footer.tsx`: repurpose `site-footer` as the
  portal/app footer (thin, hairline or ink). If `site-header` is now unused, leave it compiling.
- Add route transitions: a `template.tsx` (or wrap in PageTransition) under `[tenant]` for
  enter animation. Fix any dangling imports.

### Phase E — Verify (serial, last)
`npm run typecheck` && `npm run build` until green. Grep for dead imports. Report structured result.

## Hard rules (carry over from v1 + new)
- Mosaic palette only (coral is THE accent; blue/orange/crimson are illustration-only — the fanned
  cards and pixel icons may use them). Geist + Geist Mono. No glass, no dark mode, no per-tenant color.
- **Every motion is reduced-motion-safe** (Framer `useReducedMotion` → no transforms, instant).
- Preserve ALL data/types/logic/routes/auth and ALL Spanish copy. The data contract is frozen
  (`src/lib/types.ts`, `src/lib/data/*`, `format.ts`, `supabase/*`, `actions/*`, `middleware.ts`).
- Mobile: sidebar becomes a slide-in drawer (hamburger in top bar); right TOC hidden < 1200px;
  section tabs collapse. The content stays readable and fully usable on phones.

## Definition of done
Typecheck + build green. The portal reads as a Mistral-class app: fixed top bar, persistent
sidebar filter-nav with a sliding coral indicator, scrolling content with coral folder-tab sections,
right scroll-spy TOC, ⌘K command palette, fanned-card hero, pixel-logo cards, square bullets, and
smooth motion throughout (filter reflow, expand/collapse, stagger, hover, transitions) — all
reduced-motion-safe, all in the Arkode Mosaic palette, all Spanish copy intact.
