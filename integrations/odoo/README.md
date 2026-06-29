# Odoo integration — embed PoC (Fase 4)

`arkode_novedades` is a minimal Odoo addon that surfaces a tenant's Arkode
changelog **inside Odoo**, two ways:

- **App menu "Novedades"** → a client action that embeds the changelog in the
  Odoo backend (with Odoo's chrome around it).
- **Public page `/novedades`** → a standalone page with the same embed (handy to
  share or iframe elsewhere).

Both point at the changelog's public, read-only embed view
(`/embed/<tenant>?token=…`). See [../../docs/odoo-integration.md](../../docs/odoo-integration.md)
for the design rationale and the other approaches considered.

## Configure

1. Mint the read-only embed URL for the tenant (needs that tenant's write token):

   ```bash
   npm run changelog -- embed-url --token <write-token>
   ```

2. Put that URL into `EMBED_URL` in both
   `arkode_novedades/controllers/main.py` and
   `arkode_novedades/static/src/novedades.js`.
   (For multi-tenant / production, read it from an `ir.config_parameter`
   instead of a constant.)

3. On the **changelog** side, allow framing from your Odoo origin so the browser
   doesn't block the iframe:

   ```
   ODOO_EMBED_ORIGIN=http://<odoo-host>:8069
   ```

## Install (local Docker Odoo)

Mount this folder into the container's addons path (e.g. `./addons`), then:

```bash
# install
docker exec <odoo-container> odoo -d <db> -i arkode_novedades --stop-after-init
docker restart <odoo-container>

# after editing the addon
docker exec <odoo-container> odoo -d <db> -u arkode_novedades --stop-after-init
docker restart <odoo-container>
```

Then open Odoo → apps → **Novedades**, or visit `/novedades`.

## Security notes

- The embed token rides in the URL — treat it as a read-only secret. Rotate by
  changing `EMBED_TOKEN_SECRET` on the changelog app.
- The token authorizes exactly one tenant; a token for tenant A cannot show
  tenant B (the embed view returns 404). The changelog reads server-side scoped
  to that tenant.
- For production, prefer short-lived tokens + refresh, or SSO between Odoo and
  the portal.
