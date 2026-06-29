# Plan de Desarrollo — Centro de Novedades (Changelog Visual)

> Documento vivo. Define hacia dónde evoluciona el producto a partir del feedback
> de Rodrigo (llamada del 2026-06-16) y del estado actual del código.

---

## 1. Dónde estamos hoy

El producto actual es un **Centro de Novedades visual de UNA empresa, de solo
lectura, configurado por variable de entorno**. Sólido como base, pero acotado:

| Eje | Estado actual |
| --- | --- |
| **Tenancy** | 1 empresa por deploy (`NEXT_PUBLIC_BRAND`) |
| **Datos** | Solo lectura — `ChangelogRepository.getChangelog()` y nada más |
| **Acceso** | Web pública, sin autenticación |
| **Backend** | Mock por defecto; Supabase opcional (RLS público de solo lectura) |
| **Branding** | Color por CSS variables; sin logo por empresa |

Stack: Next.js 15 (App Router) + React 19 + TypeScript strict + Tailwind +
Framer Motion + lucide-react. Capa de datos desacoplada vía repository pattern
(`mock-repository` / `supabase-repository`, elegidos por una fábrica).

---

## 2. Hacia dónde vamos (visión de Rodrigo)

La llamada marcó tres cambios estructurales respecto del estado actual:

| Eje | Hoy | Objetivo |
| --- | --- | --- |
| **Tenancy** | 1 empresa por deploy | N empresas (3 → 50), cada una su portal |
| **Escritura** | Read-only | Agentes que **crean/editan** changelogs |
| **Acceso** | Web pública, sin login | Login por empresa + interfaz de agentes (MCP/CLI/API) |

Cita clave: *"el agente tiene que saber a qué portal va… identifico cuál es
Conecta, me conecto, y sobre esa base creo mi change log."* Esto es
**multi-tenancy con ruteo explícito**, y es el corazón de la v2.

Requisitos adicionales mencionados:

- **Agnóstico de agente**: debe funcionar igual con Claude, Codex, Hermes, etc.
  La lógica vive en un servicio común; MCP/CLI/API son adaptadores finos.
- **Screenshots documentados**: el agente toma/deposita capturas atadas al cambio.
- **Regla de oro del copy**: describir el beneficio para el usuario, nunca la
  implementación técnica.

---

## 3. Principio arquitectónico

**Una sola capa de dominio, tres consumidores.**

```
                 ┌─────────────────────────────┐
   Web (humanos) │                             │
   MCP (agentes) ├──►  ChangelogService  ──►  Repository  ──► Supabase local
   CLI (agentes) │     (tenant-aware,          │
   API (agentes) │      lectura + escritura)   │
                 └─────────────────────────────┘
```

Hoy el `ChangelogRepository` solo lee. La movida es **agregar el lado de
escritura y la dimensión `tenant` al contrato**, y que MCP/CLI/API sean
adaptadores sobre el mismo `ChangelogService`. Si la lógica vive en el servicio
(no duplicada en cada adaptador), da igual qué agente entre.

### 3.1 Frontera de seguridad de escritura (importante)

RLS protege la **lectura y el login humano** (JWT con claim de `tenant`). Pero
las **escrituras de agentes** entran por la API con un **token de servicio**, y
el service role de Supabase **bypassa RLS por diseño**. Conclusión:

- El **verdadero límite de aislamiento para la escritura es `ChangelogService`**:
  `tenantId` es obligatorio y se valida en cada operación. **No** se confía en
  RLS para esto.
- Tokens **por tenant** (no un service token global) para acotar el blast radius.
- Es un **invariante testeado**, no una convención (ver §8, Prácticas de ingeniería).

---

## 4. Decisión de backend

**Supabase local (Docker)** como store escribible durante toda la construcción.

Por qué:

- Reutiliza lo que ya existe (`schema.sql`, `supabase-repository.ts`).
- Da **auth real** (login de empresa) y **RLS real** para la **lectura**
  (aislamiento entre tenants en queries humanas) desde el día uno, sin tocar
  datos de ningún cliente. *La escritura de agentes se protege en el servicio,
  no con RLS — ver §3.1.*
- Cuando llegue el dato real de un cliente, se **migran credenciales, no
  arquitectura**.

> **Sin datos reales todavía** (decisión explícita). Trabajamos con seed/tenants
> ficticios. Esto es una ventaja: diseñamos y probamos el contrato de escritura,
> el ruteo multi-tenant y la interfaz de agentes sin riesgo en producción.

### 4.1 Decisiones cerradas (2026-06-16)

- **Ruteo por path `/[tenant]/...`** (no subdominio). Es el ruteo explícito que
  el agente puede setear (*"identifico Conecta, me conecto"*), simplifica
  auth/cookies y funciona igual con RLS por claim. El subdominio queda como
  mejora futura si el negocio lo pide.
- Esto implica que la home —hoy `export const dynamic = "force-static"` +
  `getActiveBrand()` a nivel de módulo (env `NEXT_PUBLIC_BRAND`)— pasa a
  **render dinámico por tenant**: el branding deja de venir de la env y sale del
  `Tenant`.

---

## 5. Fases

### Fase 0 — Pulido visual `[prioridad: miércoles]`

Quejas concretas de Rodrigo. Bajo esfuerzo, alto impacto.

- [ ] **Emojis → iconos.** `reactions.tsx` usa emojis (👍❤️💡 vía `REACTION_META`).
      Reemplazar por iconos `lucide` (ThumbsUp, Heart, Lightbulb) para coherencia.
- [ ] **Navegación dentro del ticket largo.** `ticket-card.tsx` es un acordeón que
      expande in-place; en tickets largos cuesta orientarse. Agregar índice/anclas
      internas o secciones colapsables.
- [ ] **Logo por empresa** en el header (no solo color), **leyéndolo del objeto
      brand-config** que ya existe (no de otra env var), para que F1 solo cambie
      la *fuente* (config → tenant) y no haya retrabajo.

**Hecho cuando:** no quedan emojis en la UI, un ticket largo es navegable, y el
header muestra el logo de la marca activa.

### Fase 0.5 — Cimientos: Supabase local + tenancy en el schema

- [ ] Levantar Supabase local (Docker) y conectar la app vía `.env.local`.
- [ ] **Migraciones versionadas** (Supabase migrations): reemplazar el
      `schema.sql` actual (que hace `drop table ... cascade`) por migraciones
      incrementales. Cada cambio de schema = una migración.
- [ ] Agregar tabla `tenants` (id, nombre, branding, logo).
- [ ] Agregar `tenant_id` a `changelogs` y `tickets` (FK a `tenants`).
- [ ] RLS por tenant (un tenant nunca ve data de otro).
- [ ] Seed con 2–3 tenants ficticios (p. ej. Conecta, Everban) para probar
      aislamiento.
- [ ] **Test de aislamiento de tenant** (gate no negociable): el tenant A no
      puede leer la data del tenant B.

**Hecho cuando:** la app lee de Supabase local, la data está particionada por
tenant con RLS activa, y el test de aislamiento de lectura pasa en verde.

### Fase 1 — Multi-tenancy + Login de empresa `[prioridad: próximo lunes]`

- [ ] `Tenant` como entidad de primera clase en el dominio (reemplaza
      `NEXT_PUBLIC_BRAND` como fuente del branding).
- [ ] **Ruteo por path `/[tenant]/...`** (decisión §4.1): reemplaza
      `force-static` + `getActiveBrand()` por render dinámico por tenant; el
      branding y el logo salen del tenant.
- [ ] Login de empresa (Supabase Auth local) que ata el usuario a su tenant.
- [ ] El portal filtra y muestra únicamente los changelogs del tenant del usuario.
- [ ] **Test:** un usuario logueado del tenant A no accede al portal ni a los
      changelogs del tenant B.

**Hecho cuando:** un usuario logueado de la empresa A ve solo el portal y los
changelogs de A, con su branding y logo.

### Fase 2 — Capa de escritura + interfaz de agentes

- [x] Extender el contrato del repositorio: `createEntry`, `upsertTicket`,
      `attachScreenshot` — `tenantId` siempre obligatorio.
- [x] `ChangelogService` tenant-aware que centraliza la lógica de escritura.
- [x] **Validación de input (Zod)** en el borde de `ChangelogService`: los
      agentes son input no confiable.
- [x] **Idempotencia** de escrituras por clave natural `(tenantId + ticket code)`
      para que los reintentos de agentes no dupliquen.
- [x] **API HTTP** tenant-scoped, autenticada por **token por tenant** (no un
      service token global; ver §3.1). Base de todo lo demás. (`/api/v1/*`)
- [x] **MCP server** que envuelve la API: tools `list_tenants`, `select_tenant`,
      `create_changelog`, `upsert_ticket`. Acá vive el ruteo "primero identifico el
      portal, después escribo". (`mcp/changelog-server.mjs`)
- [x] **CLI** como tercer adaptador sobre el mismo servicio.
      (`scripts/changelog-cli.mjs`)
- [x] **Skill** que redacta changelogs respetando la regla de oro del copy.
      (`.claude/skills/changelog-writer/SKILL.md`)
- [x] **Tests de aislamiento de escritura:** un token del tenant A no puede
      crear/editar en el tenant B. (`tests/write-isolation.test.ts`)

**Hecho cuando:** un agente puede, vía MCP/CLI/API, seleccionar un tenant y crear
un changelog que aparece en el portal correcto — y solo en ese — con el test de
aislamiento de escritura en verde.

### Fase 3 — Screenshots documentados

- [x] Ingesta de capturas atadas al ticket (subida manual o depositadas por agente).
      Vía agente: `attach_screenshot` (MCP) / `attach-screenshot` (CLI) /
      `POST /api/v1/screenshots` con bytes base64. Vía manual: uploader admin en
      Configuración (`ScreenshotUploader` + server action `uploadTicketScreenshot`).
- [x] Almacenamiento (Supabase Storage local) con `url` real en `Screenshot`
      (bucket `tenant-media`, path `<tenant_id>/<ticket>/<caption>.<ext>`,
      idempotente por captura; `next.config` ya habilita el host para `next/image`).

**Hecho cuando:** un ticket puede mostrar capturas reales subidas por una persona
o por un agente. ✓ (test `tests/screenshot-upload.test.ts`)

### Fase 4 — Integración Odoo `[v2 / exploratorio]`

- [x] Investigar embeber el changelog en Odoo o volcarlo a un knowledge base
      (incluyendo imágenes). Ver [odoo-integration.md](odoo-integration.md).
- [x] Definir el "cómo": **embed (iframe)**. Sync a Knowledge / módulo a medida
      quedan documentados como alternativas para v2.

**Hecho cuando:** existe una prueba de concepto de changelog visible desde Odoo.
~ PoC del lado del portal listo y verificado: vista pública embebible
`/embed/<tenant>?token=…` (solo lectura, sin chrome, aislada por token) +
`frame-ancestors` + helper `embed-url`. Falta una instancia Odoo real donde
pegar el iframe para cerrarlo "en vivo" (ver odoo-integration.md §8).

---

## 6. Orden de ejecución

```
F0 (pulido)  →  F0.5 (Supabase local + tenancy)  →  F1 (login + ruteo)
   →  F2 (escritura + MCP/CLI/API)  →  F3 (screenshots)  →  F4 (Odoo)
```

## 7. Hitos comprometidos

| Fecha | Entregable |
| --- | --- |
| **Miércoles** | Avances de Fase 0 (pulido) para revisión y feedback de Rodrigo |
| **Próximo lunes** | Login de empresa + personalización (logo, branding por tenant) |

## 8. Prácticas de ingeniería

Acordadas el 2026-06-16; aplican a **todas** las fases.

- **Git:** una branch por fase/feature (`feat/f0-visual-polish`, …), PR a `main`,
  diffs reviewables (~<400 líneas; partir en PRs encadenados si crece).
  Conventional commits, sin atribución de IA.
- **Tests:** el **aislamiento entre tenants** (lectura y escritura) es un gate
  **no negociable** en F0.5/F1/F2. Toda capacidad de escritura nueva viene con su
  test.
- **Migraciones:** schema versionado con migraciones incrementales (nada de
  `drop/create` en un seed). Cada cambio de schema = una migración.
- **Regla de oro del copy:** describir el beneficio para el usuario, nunca la
  implementación técnica (también la respeta la Skill de F2).

## 9. Fuera de alcance (por ahora)

- Conexión a datos reales de clientes (explícitamente pospuesto).
- Integración Odoo en producción (Fase 4, exploratoria).
