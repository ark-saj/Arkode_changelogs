# Novedades del Sistema — Changelog Visual

Centro de Novedades premium para usuarios finales de Odoo. No es una herramienta
para desarrolladores: es un producto visual, claro y consumible en menos de dos
minutos, donde cada colaborador descubre **qué cambió**, **por qué le sirve** y
**dónde encontrarlo**.

Inspiración de diseño: Apple · Linear · Notion · Arc · Stripe · Vercel.
Estética: **glassmorphism** + **liquid glass**, dark mode por defecto, branding
dinámico por empresa.

---

## ✨ Características

- **Landing con hero** "Novedades del Sistema" y fondo de orbes líquidos animados.
- **Dashboard de KPIs** glassmorphism con contadores animados.
- **Timeline vertical** con línea translúcida y animaciones al hacer scroll.
- **Tarjetas de ticket** expandibles: ¿Qué cambió? · ¿Por qué es útil? · ¿Dónde lo encuentro? (ruta visual).
- **Badges de estado**: Nuevo · Mejora · Corrección · Optimización (color por tipo).
- **Galería de capturas** con lightbox (zoom + navegación) — mockups generados por código, sin imágenes externas.
- **Antes / Después** con slider interactivo (mouse, touch y teclado).
- **Reacciones** 👍 ❤️ 💡 (persistidas en el navegador).
- **Búsqueda global** + **filtros** por módulo y por tipo de cambio.
- **Destacados** ("Novedades más importantes").
- **Branding dinámico** por empresa (Conec-ta naranja por defecto) vía CSS variables.
- **Responsive** (desktop / tablet / mobile) y `prefers-reduced-motion`.

---

## 🧱 Stack

| Capa        | Tecnología                                    |
| ----------- | --------------------------------------------- |
| Framework   | Next.js 15 (App Router) + React 19            |
| Lenguaje    | TypeScript (strict)                           |
| Estilos     | Tailwind CSS + tokens en CSS variables        |
| UI          | Primitivos estilo shadcn/ui + Radix           |
| Animaciones | Framer Motion                                 |
| Iconos      | lucide-react                                   |
| Backend     | **Mock por defecto** · Supabase opcional      |

---

## 🚀 Desarrollo local

```bash
npm install
npm run dev
# http://localhost:3000
```

No requiere ninguna variable de entorno: arranca con datos de demostración.

Otros scripts:

```bash
npm run build      # build de producción
npm run start      # servidor de producción
npm run typecheck  # chequeo de tipos
```

---

## 🏛️ Arquitectura

### Capa de datos desacoplada (repository pattern)

La UI nunca conoce el origen de los datos. Depende de una interfaz
(`ChangelogRepository`) y una fábrica elige la implementación según el entorno:

```
src/lib/data/
├── repository.ts          # interfaz + fábrica (getRepository)
├── mock-repository.ts     # implementación por defecto (sin config)
├── supabase-repository.ts # implementación Supabase (auto-activada)
├── mock-data.ts           # contenido de demo
└── compute-stats.ts       # KPIs derivados de los datos
```

> Cambiar de backend es **configuración, no código**: si existen las variables
> de Supabase, la fábrica usa Supabase; si no, usa el mock.

### Branding dinámico

Cada empresa es un set de CSS custom properties en `src/lib/branding.ts`. Se
inyectan como `style` en un wrapper y repintan toda la app (tarjetas, glows,
gradientes, orbes). Temas incluidos: `conecta` (default), `arkode`, `emerald`.

```
NEXT_PUBLIC_BRAND=conecta   # opcional
```

### Estructura

```
src/
├── app/                 # layout, page (server), globals.css
├── components/
│   ├── ui/              # primitivos (button, card, badge, input, dialog)
│   ├── layout/          # header, footer, theme provider/toggle
│   ├── decor/           # fondo liquid-glass
│   └── changelog/       # hero, dashboard, timeline, ticket, gallery, etc.
└── lib/                 # types, data layer, branding, formato
```

---

## 🔌 Supabase (multi-tenant)

El schema vive en [`supabase/migrations/`](supabase/migrations) (versionado) y el
contenido de ejemplo en [`supabase/seed.sql`](supabase/seed.sql) — dos empresas
ficticias (Conec-ta y Everban) con **datos aislados por tenant vía RLS**.

### Desarrollo local (Docker)

```bash
npx supabase start          # levanta Postgres + API local (aplica migraciones + seed)
npm run db:seed-auth        # crea los usuarios demo y los mapea a su empresa
npx supabase status -o env  # muestra URL y keys locales
```

Creá `.env.local` con las credenciales locales:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY de supabase status>
```

`npm run dev` y entrá por **`/login`**. El flujo: login → te redirige al portal de
**tu** empresa (`/[empresa]`), con su branding (color, logo) y solo sus changelogs.

Usuarios demo (sembrados por `db:seed-auth`):

| Empresa  | Usuario               | Contraseña  |
| -------- | --------------------- | ----------- |
| Conec-ta | `admin@conecta.test`  | `demo12345` |
| Everban  | `admin@everban.test`  | `demo12345` |

> Sin variables de Supabase la app cae a datos mock (cero config, sin login).

### Tests de aislamiento (gate)

```bash
npm test   # requiere supabase local corriendo + npm run db:seed-auth
```

Verifica que un tenant **nunca** lee datos de otro, por dos caminos de RLS: claim
`tenant_id` (token de servicio/agente) y membresía por `auth.uid()` (login real).

### Producción

Crear un proyecto en [supabase.com](https://supabase.com), aplicar las
migraciones (`npx supabase db push`) y definir `NEXT_PUBLIC_SUPABASE_URL` +
`NEXT_PUBLIC_SUPABASE_ANON_KEY` en el panel del host. La fábrica de datos detecta
las credenciales y cambia de mock a Supabase sin tocar código.

---

## ☁️ Deploy en Railway (vía GitHub)

1. Subí este repositorio a GitHub.
2. En [railway.app](https://railway.app): **New Project → Deploy from GitHub repo**
   y elegí este repo.
3. Railway detecta Next.js con Nixpacks y usa la config de [`railway.json`](railway.json):
   - build: `npm run build`
   - start: `npm run start` (Next escucha automáticamente en `$PORT`)
4. (Opcional) En **Variables**, agregá las de Supabase y/o `NEXT_PUBLIC_BRAND`.
5. Railway genera el dominio público. ✅

> Sin variables, el deploy funciona igual con datos de demostración.

### Deploy en Vercel (alternativa)

Importá el repo en Vercel; detecta Next.js automáticamente. Agregá las mismas
variables de entorno si querés Supabase.

---

## 📝 Personalizar el contenido

- **Demo / sin backend**: editá [`src/lib/data/mock-data.ts`](src/lib/data/mock-data.ts).
- **Con Supabase**: cargá filas en las tablas (ver `schema.sql`).

Recordá la regla de oro del copy: **describí el beneficio para el usuario, nunca
la implementación técnica.**

❌ "Se agregó una validación en el modelo CRMLead."
✅ "Ahora el sistema evita registrar oportunidades sin información importante."
