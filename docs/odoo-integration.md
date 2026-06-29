# Fase 4 — Integración Odoo (exploración)

> Estado: **exploratorio**. Sin datos reales de clientes ni Odoo productivo
> (decisión explícita, ver §9 de [PLAN.md](PLAN.md)). El objetivo de la fase es
> **investigar el "cómo"** y dejar una **prueba de concepto** del changelog
> visible desde Odoo. Este documento cubre los dos primeros checkboxes de la
> Fase 4: investigar y definir el enfoque.

## 1. Qué ya tenemos (y por qué importa)

El Centro de Novedades es un portal multi-tenant con:

- Lectura por tenant con RLS (`/[tenant]`), branding propio, dark mode.
- **Capa de escritura** detrás de `ChangelogService` (tenantId obligatorio,
  Zod, idempotencia) — Fase 2.
- **Interfaz de agentes**: API HTTP tenant-scoped (`/api/v1`), MCP y CLI, con
  **token por tenant** (§3.1).
- **Capturas reales** atadas a tickets en Supabase Storage — Fase 3.

Conclusión: el contenido (entries, tickets, capturas) ya es **consultable por
tenant** vía la base y vía la API. La integración con Odoo es un **nuevo
adaptador de salida** sobre lo mismo — no hay que rehacer el dominio.

## 2. El objetivo

Que un usuario de Odoo vea las novedades de **su** empresa desde Odoo, sin
romper el aislamiento entre tenants ni perder la calidad visual (imágenes,
estados, ¿qué cambió? / ¿por qué es útil? / ¿dónde lo encuentro?).

## 3. La API externa de Odoo (verificado)

Odoo expone una API RPC para apps externas (no requiere tocar el código de
Odoo):

- **XML-RPC**: `…/xmlrpc/2/common` (autenticación → `uid`) y `…/xmlrpc/2/object`
  (`execute_kw`).
- **JSON-RPC**: `POST /jsonrpc` (o `/web/dataset/call_kw`), `service: "object"`,
  `method: "execute_kw"`.
- Firma: `execute_kw(db, uid, password|api_key, model, method, args, kw)`.
  `create` devuelve el **id** del registro nuevo.
- Autenticación recomendada: **API key por usuario** (no la contraseña).
- Imágenes: se suben como `ir.attachment` y se referencian desde el HTML del
  registro destino.
- **Knowledge** (`knowledge.article`) es un módulo **Enterprise** (no existe en
  Community).

## 4. Opciones (con tradeoffs)

### A. Embed — iframe del portal dentro de Odoo  ⭐ recomendado para el PoC

Una página de Odoo (Website o Portal, o un ítem de menú) embebe
`https://<portal>/<tenant>` en un `<iframe>`.

- **Pros**: casi cero backend nuevo; **siempre actualizado** (sin sync); imágenes,
  estados y animaciones funcionan tal cual (es el portal real); una sola fuente
  de verdad; funciona igual en Community y Enterprise.
- **Contras / a resolver**:
  - **Auth**: el portal hoy exige login (sesión Supabase). Para embeber sin
    doble login hace falta una **vista pública embebible por tenant** (token
    firmado en la URL, solo lectura), o SSO. Es el trabajo real de esta vía.
  - **Framing**: nuestra app debe permitir ser embebida por el origen de Odoo
    (`Content-Security-Policy: frame-ancestors`), acotado a ese dominio.
- **Esfuerzo**: bajo–medio. **PoC más barato y más fiel.**

### B. Sync — volcar a Knowledge de Odoo (`knowledge.article`)

Un adaptador lee el changelog (vía nuestra API/servicio) y **crea/actualiza**
artículos de Knowledge vía `execute_kw`; las capturas van como `ir.attachment`
embebidas en el HTML del artículo.

- **Pros**: contenido **nativo** en Odoo, buscable, vive en su KB aunque el
  portal no esté; bueno para "documentación".
- **Contras**: **Enterprise-only**; es un **snapshot** → hay que sincronizar en
  cada cambio (idempotencia por clave externa, p. ej. `external_id` =
  `tenant:ticketCode`); mapeo a HTML; plumbing de adjuntos; requiere credenciales
  /API key por tenant.
- **Esfuerzo**: medio. Demostrable solo contra una instancia Odoo Enterprise.

### C. Módulo Odoo a medida (addon propio + sync)

Un addon en Python/XML con modelos `changelog.entry` / `changelog.ticket` y
vistas de portal, alimentado por sync desde nuestra API.

- **Pros**: control total de la UX dentro de Odoo; funciona en Community.
- **Contras**: **el más pesado** (desarrollar y mantener un addon Odoo);
  versionado por release de Odoo; mayor superficie de mantenimiento.
- **Esfuerzo**: alto.

## 5. Recomendación

Para una **prueba de concepto exploratoria**, **Opción A (embed)**:

1. Reutiliza el portal completo que ya construimos (incluye las capturas reales
   de Fase 3) — máxima fidelidad, mínimo backend.
2. "Siempre actualizado" sin pipeline de sync ni idempotencia extra.
3. El único trabajo real es una **vista pública embebible por tenant** con token
   firmado de solo lectura + `frame-ancestors` — que además es útil por sí
   misma (compartir el changelog sin login).

La Opción B (Knowledge) es la mejor si el objetivo es **documentación nativa y
buscable** dentro de Odoo y el cliente tiene **Enterprise**; conviene como v2
una vez validado el embed. La Opción C solo si se necesita una UX 100% Odoo en
Community.

## 6. Mapeo de datos (para B/C, referencia)

| Centro de Novedades        | Odoo (Knowledge / modelo)                         |
| -------------------------- | ------------------------------------------------- |
| `ChangelogEntry` (fecha)   | artículo padre "Novedades — <fecha>"              |
| `Ticket` (code, título…)   | sección/artículo hijo; `external_id = tenant:code`|
| `whatChanged/whyUseful/…`  | cuerpo HTML estructurado                          |
| `Screenshot.url`           | `ir.attachment` embebido en el HTML               |
| `status`, `categoryKey`    | tags / categoría del artículo                     |

## 7. Preguntas abiertas (definen el alcance del PoC)

- ¿El cliente objetivo usa Odoo **Community o Enterprise**? (Knowledge = Enterprise.)
- ¿Versión de Odoo y hosting (Odoo.sh / on-premise / SaaS)?
- ¿Hay una instancia Odoo (aunque sea local en Docker) para demostrar el PoC en
  vivo, o el entregable de esta fase es el **diseño + un spike ejecutable**?
- ¿SSO entre Odoo y el portal a futuro, o alcanza el embed público con token?

## 8. PoC implementado — Embed (Opción A)

Enfoque elegido: **embed**. Implementado de nuestro lado (sin instancia Odoo,
fase exploratoria):

- **Vista pública embebible**: `GET /embed/<tenant>?token=…` — solo lectura, sin
  chrome de navegación, fuera del layout con guard de sesión. Reusa
  `TicketCard` + galería de capturas reales (misma lectura que el portal, vía
  `readChangelogData`, pero con el **service client** porque no hay sesión).
- **Token firmado por tenant** (`src/lib/auth/embed-token.ts`): HMAC-SHA256 del
  slug, stateless, estable para un iframe de larga vida. Nombra **un solo
  tenant** → un token de A no puede ver el changelog de B (verificado: 404).
- **`frame-ancestors`** en la CSP solo para `/embed/*`, acotado a
  `ODOO_EMBED_ORIGIN` (+ `'self'`). El resto del sitio no es embebible.
- **Mint de la URL**: `GET /api/v1/embed-url` (autenticado con el write token del
  tenant) o `node scripts/changelog-cli.mjs embed-url --token <t>`.
- **Middleware**: `/embed/*` se excluye del gating de login (es público + token).

### Cómo demostrarlo dentro de Odoo

1. Obtener la URL: `npm run changelog -- embed-url --token <write-token>`.
2. En Odoo (Website → editar página, o un ítem de portal) insertar un bloque
   HTML con el iframe:

   ```html
   <iframe src="https://<portal>/embed/<tenant>?token=<token>"
           style="width:100%;height:80vh;border:0" loading="lazy"></iframe>
   ```

3. Configurar `ODOO_EMBED_ORIGIN` con el origen de esa instancia Odoo para que
   `frame-ancestors` permita el framing.

### Configuración (env)

| Variable             | Para qué                                              |
| -------------------- | ----------------------------------------------------- |
| `EMBED_TOKEN_SECRET` | Firma los tokens de embed (rotar = revocar todos)     |
| `ODOO_EMBED_ORIGIN`  | Origen de Odoo permitido en `frame-ancestors`         |
| `APP_PUBLIC_URL`     | Base para construir las URLs absolutas de embed       |

> **Pendiente para cerrar el "hecho cuando" en vivo**: una instancia Odoo
> (Community o Enterprise) donde pegar el iframe. El artefacto de nuestro lado ya
> está y verificado (la vista embebible renderiza el changelog por tenant, sin
> login y con aislamiento por token).

### Seguridad (notas)

- El token va en la URL: tratarlo como un **secreto de lectura** (puede quedar en
  logs/referrer). Para v2: tokens con expiración + refresh, o SSO Odoo↔portal.
- La vista lee con service_role (bypassa RLS) pero **siempre** acotada al tenant
  del token — mismo invariante que la capa de escritura (§3.1).
