# Research: App de Control de Gastos Mensuales

**Branch**: `001-expense-tracker-core` | **Date**: 2026-03-23 | **Phase**: 0

---

## 1. Aritmética Financiera de Precisión

**Decision**: Big.js como única librería para cálculos monetarios.

**Rationale**: Big.js es la opción más liviana (~6 KB minificada) orientada exclusivamente a
aritmética decimal de precisión arbitraria. No usa `float`/`double` internamente; todas las
operaciones producen instancias `Big` con redondeo configurable. Se usa `Big.RM = 1`
(ROUND_HALF_UP) globalmente para cumplir el Principio I de la constitución.

**Alternatives considered**:

- `decimal.js` — superconjunto de Big.js; incluye trigonometría innecesaria para este dominio.
- `bignumber.js` — más pesado, mismo caso de uso; descartado por tamaño.
- Enteros en centavos con Number — viable pero requiere conversión manual en UI; Big.js
  elimina ese boilerplate manteniendo la misma seguridad.

---

## 2. Gestión de Estado Global

**Decision**: Zustand 5 con middleware `persist` usando `localStorage`.

**Rationale**: Zustand 5 mantiene la API mínima de v4 y es compatible con React 19. Su
middleware `persist` serializa/deserializa el store a `localStorage` con una línea de
configuración. La ausencia de Provider permite usarlo en cualquier nivel del árbol sin cambios
estructurales. **Cambio importante en v5**: el middleware `persist` ya no guarda el estado
inicial automáticamente al crear el store; se debe llamar `setState` explícitamente si se
necesita persistir valores de inicialización, o bien asegurarse de que el estado inicial
provenga de la hidratación del storage.

**Alternatives considered**:

- Redux Toolkit — mayor tamaño y ceremonia; justificado solo en equipos grandes.
- Context + useReducer — no persiste nativamente; requería wrapper manual de localStorage.
- Jotai — granularidad atómica útil para estados muy dispersos; aquí el estado es cohesivo
  (presupuesto + gastos), Zustand es más directo.

---

## 3. Persistencia Local

**Decision**: `localStorage` vía `zustand/middleware` `persist`.

**Rationale**: Los datos de un usuario personal de finanzas caben holgadamente en
`localStorage` (~5 MB de límite; ~200 gastos/mes × ~200 bytes = ~40 KB). La API es síncrona
y no requiere workers ni IndexedDB para este volumen. Cumple FR-009 (datos locales) y SC-004
(100 % offline).

**Alternatives considered**:

- IndexedDB (via `idb`) — necesario para > 5 MB o búsquedas indexadas; overkill para el volumen
  proyectado.
- SQLite WASM — potencia excesiva; añade complejidad de compilación y tamaño de bundle.

**Nota de privacidad**: `localStorage` es accesible desde cualquier script del mismo origen.
En esta versión (uso personal, sin servidor) el riesgo es aceptable. El cifrado AES-256
mencionado en la constitución queda diferido a una versión futura con autenticación.

---

## 4. Arquitectura de Componentes

**Decision**: Screaming Architecture — dominios bajo `src/features/`; separación estricta
Hook (lógica) / Componente (presentación).

**Rationale**: Cada feature es un módulo cerrado que puede desarrollarse y revisarse de forma
independiente. Los componentes `.tsx` solo reciben `props`; no llaman al store directamente.
Los Custom Hooks son el único punto de acceso al store y a `src/core/math/`. Esto facilita
el code review de lógica financiera (Principio I) sin tener que leer JSX.

**Alternatives considered**:

- Feature-sliced design (FSD) — más formal; overhead de carpetas innecesario para 4 dominios.
- Colocación por tipo (components/, hooks/, utils/) — oscurece la intención del dominio;
  viola el espíritu de Screaming Architecture.

---

## 5. Lógica de Cuotas

**Decision**: El monto por cuota se calcula como `Big(monto_total).div(total_cuotas)`
con `.round(2, 1)` (ROUND_HALF_UP). El campo `cuota_actual` es informativo (indica en qué
cuota va el usuario); no afecta el cálculo del saldo (se descuenta el `monto_total` completo).

**Rationale**: La app controla el gasto total comprometido, no el flujo de caja cuota a cuota.
Simplifica la lógica y evita discrepancias acumuladas por redondeo en cada cuota.

**Alternatives considered**:

- Descontar solo `monto_por_cuota` del saldo mensual — implicaría modelar el calendario de
  pagos; fuera del alcance de esta especificación (ver Assumptions en spec.md).

---

## 6. Generación de PDF en el Cliente

**Decision**: jsPDF + jspdf-autotable para generación client-side.

**Rationale**: jsPDF (~280 KB gzipped) es la librería más madura para generar PDFs en el
navegador sin backend. El plugin `jspdf-autotable` (~30 KB) permite generar tablas con formato
(bordes, colores, paginación automática) con una API declarativa. Ambas librerías son puro
JavaScript, no realizan fetch ni telemetría, y cumplen con el Principio II de la constitución.
La generación ocurre sobre un `MonthlyReport` ya existente en memoria; no requiere nuevas
consultas a Supabase.

**Alternatives considered**:

- `@react-pdf/renderer` — API React-like con componentes JSX, pero pesa ~500 KB y obliga a
  mantener un árbol de componentes paralelo al HTML. Overkill para un reporte con 1 tabla.
- `html2canvas` + `jsPDF` — captura visual del modal como imagen y la embebe en PDF. Produce
  PDFs pesados con texto no seleccionable; descartado por calidad.
- `pdfmake` — alternativa a jsPDF con definición declarativa; pesa más (~400 KB) y la
  comunidad es más pequeña.

---

## 7. Compartir Archivos desde el Navegador

**Decision**: Web Share API (`navigator.share()`) con fallback a descarga directa.

**Rationale**: La Web Share API es nativa del navegador y permite compartir archivos
directamente al sheet del sistema operativo (WhatsApp, Telegram, email, etc.) sin
dependencias externas. En Android Chrome y iOS Safari soporta compartir objetos `File`.
En desktop, el soporte de archivos es limitado (Chrome parcial, Firefox no soporta),
por lo que se usa descarga directa como fallback transparente.

**Detección de soporte**:

```typescript
const canShareFiles = (file: File) =>
  typeof navigator.share === 'function' &&
  typeof navigator.canShare === 'function' &&
  navigator.canShare({ files: [file] })
```

**Alternatives considered**:

- Generar un link `https://wa.me/?text=...` — solo funciona para texto, no para archivos.
- Subir el PDF a un storage temporal y compartir URL — viola Principio II (datos salen del
  dispositivo) y requiere backend.

---

## 6. Estilo Visual

**Decision**: Tailwind CSS 4 con plugin oficial de Vite (`@tailwindcss/vite`); sin `tailwind.config.js`.

**Rationale**: Tailwind v4 elimina el archivo de configuración JS en favor de detección
automática de contenido. La integración con Vite se realiza únicamente a través del plugin
`@tailwindcss/vite` en `vite.config.ts` y una sola línea `@import "tailwindcss"` en el CSS
principal. Encaja con la regla de componentes puramente presentacionales: el estilo es
declarativo en el JSX. Para el indicador de saldo negativo (FR-012) se usa la clase
condicional `text-red-600`.

**Alternatives considered**:

- Styled-components / Emotion — mezclan lógica de estilo con componente; mayor bundle.
- CSS Modules — válidos pero verbosos; Tailwind es más rápido de iterar en UI de entrada rápida.
- Tailwind CSS v3 — versión anterior; requiere `tailwind.config.js` y directivas `@tailwind`; descartada en favor de v4.
