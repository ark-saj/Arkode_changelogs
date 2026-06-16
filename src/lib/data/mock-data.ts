import type { Category, ChangelogEntry } from "@/lib/types";

/**
 * Mock content for the demo. Copy is intentionally NON technical: it describes
 * the user benefit, never the implementation. This is the seed data you would
 * mirror in Supabase (see supabase/schema.sql).
 */

export const CATEGORIES: Category[] = [
  { key: "crm", name: "CRM", icon: "UserRound" },
  { key: "ventas", name: "Ventas", icon: "ShoppingCart" },
  { key: "inventario", name: "Inventario", icon: "Boxes" },
  { key: "compras", name: "Compras", icon: "Truck" },
  { key: "rrhh", name: "RRHH", icon: "Briefcase" },
  { key: "facturacion", name: "Facturación", icon: "ReceiptText" },
];

export const ENTRIES: ChangelogEntry[] = [
  {
    id: "2026-06-12",
    date: "2026-06-12",
    title: "Mejoras en CRM y Ventas",
    summary:
      "Registrá oportunidades más rápido, con menos errores y un pipeline más claro.",
    tickets: [
      {
        code: "CRM-001",
        title: "Validación inteligente de oportunidades",
        summary:
          "El sistema te avisa si falta información importante antes de guardar.",
        status: "new",
        categoryKey: "crm",
        featured: true,
        whatChanged:
          "Al crear una oportunidad, el sistema revisa que tenga los datos clave (cliente, contacto y valor estimado) antes de permitir guardarla.",
        whyUseful:
          "Evita oportunidades incompletas que después generan retrabajo y reportes poco confiables. Te ahorra tener que volver a buscar la información más tarde.",
        whereToFind: ["CRM", "Oportunidades", "Crear oportunidad"],
        screenshots: [
          { id: "crm001-1", caption: "Aviso al intentar guardar sin datos clave", variant: "form", seed: 11 },
          { id: "crm001-2", caption: "Oportunidad completa lista para guardar", variant: "form", seed: 12 },
        ],
        reactions: { helped: 32, love: 18, suggestion: 3 },
      },
      {
        code: "CRM-002",
        title: "Vista de embudo más clara",
        summary:
          "Rediseñamos el tablero de oportunidades para ver tu pipeline de un vistazo.",
        status: "improvement",
        categoryKey: "crm",
        featured: true,
        whatChanged:
          "El tablero de oportunidades ahora muestra el monto total por etapa y resalta con color las de mayor prioridad.",
        whyUseful:
          "Identificás en segundos dónde está estancado el negocio y a qué oportunidad darle prioridad hoy.",
        whereToFind: ["CRM", "Oportunidades"],
        screenshots: [
          { id: "crm002-1", caption: "Nuevo tablero con montos por etapa", variant: "kanban", seed: 21 },
        ],
        beforeAfter: {
          beforeCaption: "Antes: tablero plano sin totales",
          afterCaption: "Después: montos y prioridad por etapa",
          beforeVariant: "kanban",
          afterVariant: "kanban",
          seed: 22,
        },
        reactions: { helped: 27, love: 41, suggestion: 5 },
      },
      {
        code: "VEN-014",
        title: "Descuentos visibles en cada línea",
        summary:
          "Ves el descuento aplicado en cada línea del presupuesto sin abrir detalles.",
        status: "improvement",
        categoryKey: "ventas",
        whatChanged:
          "Agregamos una columna de descuento directamente en la vista del presupuesto de venta.",
        whyUseful:
          "Revisás y ajustás precios mucho más rápido, sin entrar producto por producto.",
        whereToFind: ["Ventas", "Presupuestos"],
        screenshots: [
          { id: "ven014-1", caption: "Columna de descuento en el presupuesto", variant: "list", seed: 31 },
        ],
        reactions: { helped: 15, love: 9, suggestion: 2 },
      },
      {
        code: "VEN-015",
        title: "Corrección en el cálculo de impuestos",
        summary:
          "Los productos exentos ya no suman impuesto por error en el total.",
        status: "fix",
        categoryKey: "ventas",
        whatChanged:
          "Corregimos el cálculo para que los productos marcados como exentos no apliquen impuesto en el total.",
        whyUseful:
          "Tus presupuestos y facturas muestran el total correcto siempre, evitando reclamos de clientes.",
        whereToFind: ["Ventas", "Presupuestos"],
        screenshots: [],
        reactions: { helped: 22, love: 6, suggestion: 1 },
      },
    ],
  },
  {
    id: "2026-06-05",
    date: "2026-06-05",
    title: "Inventario más ágil",
    summary: "Recepciones, conteos y consultas de stock más rápidas.",
    tickets: [
      {
        code: "INV-008",
        title: "Recepción por código de barras",
        summary: "Escaneá productos al recibir mercadería y el sistema los carga solo.",
        status: "new",
        categoryKey: "inventario",
        featured: true,
        whatChanged:
          "Habilitamos la lectura de código de barras en las recepciones, desde el celular o un lector.",
        whyUseful:
          "Recibís mercadería mucho más rápido y con menos errores de carga manual.",
        whereToFind: ["Inventario", "Recepciones"],
        screenshots: [
          { id: "inv008-1", caption: "Escaneo de productos al recibir", variant: "form", seed: 41 },
          { id: "inv008-2", caption: "Listado de recepción actualizado", variant: "list", seed: 42 },
        ],
        reactions: { helped: 44, love: 30, suggestion: 7 },
      },
      {
        code: "INV-009",
        title: "Carga más rápida del stock",
        summary: "Las pantallas de inventario ahora abren notablemente más rápido.",
        status: "optimization",
        categoryKey: "inventario",
        whatChanged:
          "Optimizamos cómo se consulta el stock para que las listas con muchos productos abran sin demora.",
        whyUseful:
          "Dejás de esperar a que carguen las pantallas, sobre todo en depósitos grandes.",
        whereToFind: ["Inventario", "Productos"],
        screenshots: [],
        beforeAfter: {
          beforeCaption: "Antes: la lista tardaba en cargar",
          afterCaption: "Después: carga casi instantánea",
          beforeVariant: "list",
          afterVariant: "list",
          seed: 43,
        },
        reactions: { helped: 19, love: 12, suggestion: 0 },
      },
      {
        code: "COM-003",
        title: "Alertas de stock mínimo en compras",
        summary: "El sistema sugiere qué comprar cuando un producto baja del mínimo.",
        status: "improvement",
        categoryKey: "compras",
        whatChanged:
          "Cuando un producto llega a su stock mínimo, aparece una alerta y una sugerencia de pedido de compra.",
        whyUseful:
          "Evitás quedarte sin stock de productos clave sin tener que revisar todo a mano.",
        whereToFind: ["Compras", "Solicitudes de compra"],
        screenshots: [
          { id: "com003-1", caption: "Sugerencia automática de compra", variant: "list", seed: 51 },
        ],
        reactions: { helped: 28, love: 14, suggestion: 4 },
      },
    ],
  },
  {
    id: "2026-05-28",
    date: "2026-05-28",
    title: "Facturación al día",
    summary: "Menos pasos manuales y numeración prolija.",
    tickets: [
      {
        code: "FAC-021",
        title: "Envío automático de facturas por correo",
        summary: "Al confirmar una factura, se envía sola al correo del cliente.",
        status: "new",
        categoryKey: "facturacion",
        featured: true,
        whatChanged:
          "Activamos el envío automático de la factura en PDF al email del cliente cuando se confirma.",
        whyUseful:
          "Te ahorra descargar y enviar a mano; el cliente la recibe al instante.",
        whereToFind: ["Facturación", "Facturas de cliente"],
        screenshots: [
          { id: "fac021-1", caption: "Opción de envío automático activada", variant: "form", seed: 61 },
        ],
        reactions: { helped: 51, love: 38, suggestion: 6 },
      },
      {
        code: "FAC-022",
        title: "Numeración de facturas corregida",
        summary: "Resolvimos un salto de numeración al anular facturas.",
        status: "fix",
        categoryKey: "facturacion",
        whatChanged:
          "Corregimos la secuencia para que las facturas mantengan numeración consecutiva aun al anular una.",
        whyUseful:
          "Tu numeración queda prolija y consistente para temas contables y fiscales.",
        whereToFind: ["Facturación", "Facturas de cliente"],
        screenshots: [],
        reactions: { helped: 17, love: 5, suggestion: 1 },
      },
      {
        code: "VEN-018",
        title: "Plantillas de presupuesto",
        summary: "Creá presupuestos a partir de plantillas reutilizables.",
        status: "improvement",
        categoryKey: "ventas",
        whatChanged:
          "Agregamos plantillas con productos y condiciones predefinidas para armar presupuestos en segundos.",
        whyUseful:
          "No volvés a cargar lo mismo cada vez: ganás velocidad y consistencia comercial.",
        whereToFind: ["Ventas", "Presupuestos", "Nuevo"],
        screenshots: [
          { id: "ven018-1", caption: "Selección de plantilla al crear", variant: "form", seed: 71 },
        ],
        reactions: { helped: 24, love: 20, suggestion: 3 },
      },
    ],
  },
  {
    id: "2026-05-15",
    date: "2026-05-15",
    title: "Recursos Humanos",
    summary: "Autoservicio para el equipo y mejor visibilidad de ausencias.",
    tickets: [
      {
        code: "RH-005",
        title: "Solicitud de vacaciones en autoservicio",
        summary: "Cada colaborador pide sus vacaciones desde su propio perfil.",
        status: "new",
        categoryKey: "rrhh",
        featured: true,
        whatChanged:
          "Habilitamos un formulario para que los colaboradores soliciten vacaciones y vean su saldo disponible.",
        whyUseful:
          "Menos correos y planillas: el pedido llega directo a aprobación y queda registrado.",
        whereToFind: ["Empleados", "Tiempo libre", "Solicitudes"],
        screenshots: [
          { id: "rh005-1", caption: "Formulario de solicitud con saldo", variant: "form", seed: 81 },
          { id: "rh005-2", caption: "Estado de la solicitud", variant: "list", seed: 82 },
        ],
        reactions: { helped: 36, love: 29, suggestion: 8 },
      },
      {
        code: "RH-006",
        title: "Tablero de ausencias del equipo",
        summary: "Los líderes ven de un vistazo quién está de licencia esta semana.",
        status: "improvement",
        categoryKey: "rrhh",
        whatChanged:
          "Nuevo tablero que muestra las ausencias del equipo en formato calendario.",
        whyUseful:
          "Planificás mejor el trabajo sabiendo quién está disponible cada día.",
        whereToFind: ["Empleados", "Tiempo libre"],
        screenshots: [],
        beforeAfter: {
          beforeCaption: "Antes: revisar persona por persona",
          afterCaption: "Después: calendario del equipo completo",
          beforeVariant: "list",
          afterVariant: "dashboard",
          seed: 83,
        },
        reactions: { helped: 21, love: 16, suggestion: 2 },
      },
    ],
  },
  {
    id: "2026-04-30",
    date: "2026-04-30",
    title: "Optimizaciones de rendimiento",
    summary: "Búsquedas más rápidas y correcciones de estabilidad.",
    tickets: [
      {
        code: "CRM-014",
        title: "Búsqueda de clientes más rápida",
        summary: "Buscar un cliente ahora es casi instantáneo.",
        status: "optimization",
        categoryKey: "crm",
        whatChanged:
          "Mejoramos el buscador de contactos para que muestre resultados a medida que escribís.",
        whyUseful:
          "Encontrás al cliente sin esperar, incluso con bases de datos grandes.",
        whereToFind: ["CRM", "Clientes"],
        screenshots: [],
        reactions: { helped: 30, love: 11, suggestion: 1 },
      },
      {
        code: "INV-012",
        title: "Corrección en ajustes de inventario",
        summary: "Solucionamos un error al confirmar ciertos ajustes de stock.",
        status: "fix",
        categoryKey: "inventario",
        whatChanged:
          "Corregimos un caso donde un ajuste con lotes no se confirmaba correctamente.",
        whyUseful:
          "Tus ajustes de inventario quedan registrados sin tener que repetir el proceso.",
        whereToFind: ["Inventario", "Ajustes de inventario"],
        screenshots: [],
        reactions: { helped: 14, love: 4, suggestion: 0 },
      },
    ],
  },
  {
    id: "2026-04-10",
    date: "2026-04-10",
    title: "Nuevo panel comercial",
    summary: "Una pantalla de inicio pensada para el equipo de ventas.",
    tickets: [
      {
        code: "VEN-009",
        title: "Panel comercial de inicio",
        summary: "Una pantalla de inicio con tus ventas del mes y pendientes.",
        status: "new",
        categoryKey: "ventas",
        featured: true,
        whatChanged:
          "Creamos un panel de inicio para el equipo comercial con ventas del mes, oportunidades abiertas y tareas.",
        whyUseful:
          "Arrancás el día viendo lo importante sin navegar por varios menús.",
        whereToFind: ["Ventas", "Inicio"],
        screenshots: [
          { id: "ven009-1", caption: "Panel comercial de inicio", variant: "dashboard", seed: 91 },
          { id: "ven009-2", caption: "Resumen de ventas del mes", variant: "report", seed: 92 },
        ],
        reactions: { helped: 47, love: 33, suggestion: 9 },
      },
    ],
  },
];
