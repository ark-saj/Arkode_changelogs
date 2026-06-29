{
    "name": "Arkode - Centro de Novedades (embed)",
    "version": "1.0.0",
    "summary": "Embeds the Arkode changelog portal inside Odoo.",
    "description": "Adds a 'Novedades' app that shows the tenant's Arkode "
    "changelog embedded in the Odoo backend, plus a public /novedades page. "
    "Fase 4 PoC — see docs/odoo-integration.md.",
    "author": "Arkode",
    "category": "Tools",
    "depends": ["web"],
    "data": ["views/menus.xml"],
    "assets": {
        "web.assets_backend": [
            "arkode_novedades/static/src/novedades.js",
        ],
    },
    "installable": True,
    "application": True,
    "license": "LGPL-3",
}
