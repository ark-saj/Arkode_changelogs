from odoo import http
from odoo.http import Response

# The read-only embed URL for this tenant. Get it from the changelog API/CLI:
#   npm run changelog -- embed-url --token <write-token>
# and make sure the changelog app allows framing from this Odoo origin
# (ODOO_EMBED_ORIGIN=http://<odoo-host>:8069). For multi-tenant / production,
# move this to an ir.config_parameter instead of a constant.
EMBED_URL = "http://localhost:3000/embed/<tenant>?token=<embed-token>"

PAGE = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Novedades</title>
  <style>
    html, body {{ margin: 0; height: 100%; background: #faf8f3; }}
    iframe {{ display: block; width: 100%; height: 100vh; border: 0; }}
  </style>
</head>
<body>
  <iframe src="{url}" loading="lazy" title="Centro de Novedades"></iframe>
</body>
</html>""".format(url=EMBED_URL)


class ArkodeNovedades(http.Controller):
    @http.route("/novedades", type="http", auth="public", csrf=False, sitemap=False)
    def novedades(self, **kw):
        # Allow this Odoo page to frame the changelog app.
        headers = [
            ("Content-Type", "text/html; charset=utf-8"),
            (
                "Content-Security-Policy",
                "frame-src 'self' http://localhost:3000 http://127.0.0.1:3000",
            ),
        ]
        return Response(PAGE, headers=headers)
