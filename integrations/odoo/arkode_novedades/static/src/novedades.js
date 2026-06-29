/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, xml } from "@odoo/owl";

// The read-only embed URL for this tenant. Get it from the changelog API/CLI:
//   npm run changelog -- embed-url --token <write-token>
// The changelog app must allow framing from this Odoo origin
// (ODOO_EMBED_ORIGIN=http://<odoo-host>:8069). For multi-tenant / production,
// read this from a system parameter instead of a constant.
const EMBED_URL = "http://localhost:3000/embed/<tenant>?token=<embed-token>";

// Client action: shows the Arkode changelog embedded inside the Odoo backend,
// reachable from the "Novedades" app menu (no need to hit /novedades directly).
export class ArkodeNovedades extends Component {
    setup() {
        this.src = EMBED_URL;
    }
}
ArkodeNovedades.template = xml`
    <div class="o_arkode_novedades" style="height:100%;width:100%;background:#faf8f3">
        <iframe t-att-src="src"
                style="width:100%;height:100%;border:0;display:block"
                title="Centro de Novedades"/>
    </div>`;
ArkodeNovedades.props = ["*"];

registry.category("actions").add("arkode_novedades.embed", ArkodeNovedades);
