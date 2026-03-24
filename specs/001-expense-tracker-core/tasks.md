# Tasks: App de Control de Gastos Mensuales

**Input**: Design documents from `/specs/001-expense-tracker-core/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Stack**: React 19 · TypeScript 5.7 · Zustand 5 · Big.js 6 · Tailwind CSS 4 · Vite 6
**Architecture**: Screaming Architecture · SPA (sin router) · Hooks/Presentational split · kebab-case

> **Regla de nomenclatura UI (v1.0.3)**: Los componentes de la app tienen identidad propia
> basada en el concepto "The Digital Ledger". Ningún nombre de componente, archivo, clase
> ni comentario DEBE referenciar productos de terceros (Notion, Linear, etc.).
> El input minimalista de borde inferior se llama `LedgerInput` / `ledger-input.tsx`.

> **Regla de idioma en código (v1.0.4)**: Todos los identificadores del código fuente
> (variables, parámetros, funciones, métodos, componentes, interfaces, tipos, props)
> DEBEN estar en **inglés**. El español se reserva exclusivamente para strings de UI
> visibles al usuario (labels, placeholders, mensajes de error). Esta regla aplica
> a todos los archivos: types, store, hooks, components y utils.
>
> Renombramientos aplicados en esta versión:
>
> - `Gasto` → `Expense` · `Presupuesto` → `Budget` · `ResumenMensual` → `MonthlySummary`
> - `esTarjeta` → `isCardCategory` · `CATEGORIAS_TARJETA` → `CARD_CATEGORIES`
> - `calcMontoCuota` → `calcInstallmentAmount` · `calcTotalGastado` → `calcTotalSpent` · `calcSaldo` → `calcRemainingBalance`
> - `getResumen` → `getSummary` · `editingGasto` → `editingExpense` · `openEditModal(gasto)` → `openEditModal(expense)`
> - Props snake_case en español → camelCase en inglés (ej: `monto_total` → `totalAmount`, `fecha_registro` → `registeredAt`)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias incompletas)
- **[Story]**: Historia de usuario correspondiente (US1–US5)
- Rutas absolutas desde la raíz del proyecto

---

## Phase 1: Setup — Proyecto e Infraestructura Base ✅

**Purpose**: Inicialización del proyecto, tokens de diseño y estructura de carpetas.

- [x] T001 Crear proyecto Vite 6 + React 19 + TypeScript 5.7 con `npm create vite@latest expenses -- --template react-ts`
- [x] T002 Instalar dependencias de producción: `npm install zustand big.js`
- [x] T003 Instalar dependencias de desarrollo: `npm install -D tailwindcss @tailwindcss/vite`
- [x] T004 Configurar plugin Tailwind v4 en `vite.config.ts` — agregar `tailwindcss()` al array `plugins`
- [x] T005 Reemplazar `src/index.css` con `@import "tailwindcss"` y tokens del Design System
- [x] T006 Crear `src/index.css` con las custom properties del Design System "The Digital Ledger":
  ```css
  @import 'tailwindcss';
  @theme {
    --color-background: #f9f9f7;
    --color-surface-container-low: #f2f4f2;
    --color-primary: #005fad;
    --radius-DEFAULT: 0px; /* No-Line Rule: 0px borders */
    --radius-sm: 0px;
    --radius-md: 0px;
    --radius-lg: 0px;
  }
  ```
- [x] T007 [P] Descargar assets Stitch — Dashboard HTML: `curl -L "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzdjY2E4NTg0ZTFhZjQ1ZGI5MTI5YmNiZTdkNzIwYzQ0EgsSBxCEof6_1BcYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzA3NTQzOTQwNzQzNzg1NjI5NQ&filename=&opi=89354086" -o src/assets/stitch-dashboard.html`
- [x] T008 [P] Descargar assets Stitch — Quick Entry Modal HTML: `curl -L "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2E1NWM4YmQ5MTAyNTQwNWZiYzBhMTRkZGZiNGU4NzA3EgsSBxCEof6_1BcYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzA3NTQzOTQwNzQzNzg1NjI5NQ&filename=&opi=89354086" -o src/assets/stitch-quick-entry-modal.html`
- [x] T009 Crear estructura de carpetas: `src/core/math/`, `src/core/storage/`, `src/features/budget/`, `src/features/expense-registration/`, `src/features/expense-history/`, `src/store/`, `src/types/`
- [x] T010 [P] Configurar ESLint + Prettier con reglas para TypeScript y React 19 en `eslint.config.js` y `.prettierrc`

**Checkpoint**: Proyecto creado, Tailwind v4 configurado con tokens, assets Stitch descargados, estructura de carpetas lista.

---

## Phase 2: Foundational — Tipos, Core y Store ✅

**Purpose**: Infraestructura compartida que TODA feature requiere. Nada puede implementarse sin esta fase.

**⚠️ CRÍTICO**: Ninguna feature puede comenzar hasta completar esta fase.

- [x] T011 Crear `src/types/index.ts` — `Category`, `Expense`, `Budget`, `MonthlySummary`, `CARD_CATEGORIES`, `CATEGORY_LABELS`, `isCardCategory`
- [x] T012 [P] Crear `src/core/math/finance.ts` — `calcInstallmentAmount`, `calcTotalSpent`, `calcRemainingBalance` (Big.js, ROUND_HALF_UP)
- [x] T013 [P] Crear `src/core/storage/persist-config.ts` — `STORAGE_KEY`, `partialize`
- [x] T014 Crear `src/store/expense-store.ts` — Zustand 5 + persist: DataSlice + NavSlice (`isModalOpen`, `editingExpense`, `openModal`, `closeModal`, `openEditModal`)
- [x] T015 [P] Crear `src/shared/ui/primary-button.tsx` — variantes primary/danger/ghost, No-Line Rule
- [x] T016 [P] Crear `src/shared/ui/ledger-input.tsx` — borde inferior `primary`, fondo `surface-container-low`, sin outline en focus

**Checkpoint**: Tipos, funciones de cálculo, store y componentes base compartidos listos. Features pueden implementarse en paralelo.

---

## Phase 3: US1 — Configurar Presupuesto Mensual ✅

**Goal**: El usuario puede definir y editar el presupuesto mensual; el saldo se calcula al instante.

- [x] T017 [US1] Crear `src/features/budget/use-budget.ts` — expone `budget`, `remainingBalance`, `totalSpent`, `isOverBudget`, `error`, `handleSetBudget`, `handleEditBudget`
- [x] T018 [P] [US1] Crear `src/features/budget/budget-form.tsx` — `onSubmit(amount)`, `isEditing`, `error`; usa `LedgerInput` + `PrimaryButton`
- [x] T019 [P] [US1] Crear `src/features/budget/budget-summary.tsx` — `budgetAmount`, `totalSpent`, `remainingBalance`, `isOverBudget`; `text-primary` / `text-red-600`; `bg-surface-container-low`

**Checkpoint**: US1 completa y verificable de forma independiente.

---

## Phase 4: US2 + US3 — Registro de Gastos y Resumen ✅

**Goal**: El usuario registra un gasto con categoría, cuotas y ve el resumen actualizado instantáneamente.

- [x] T020 [US2] Crear `src/features/expense-registration/category-picker.tsx` — 4 chips en grid 2×2, activo=`bg-primary text-white`, No-Line Rule (border-b-2)
- [x] T021 [US2] Crear `src/features/expense-registration/use-expense-form.ts` — validación completa, `showInstallments`, `amountPerInstallment` en tiempo real, `amountRef`
- [x] T022 [US2] Crear `src/features/expense-registration/expense-form.tsx` — presentacional puro, cuotas condicionales, preview por cuota, cancelar opcional
- [x] T023 [US3] Crear `src/features/expense-history/expense-item.tsx` — descripción, categoría, cuotas, botones edit/delete en hover con `aria-label`
- [x] T024 [US3] Crear `src/features/expense-history/expense-list.tsx` — tonal layering alternado, estado vacío con CTA

**Checkpoint**: US2 y US3 completas; formulario de registro y lista de gastos funcionan de forma independiente.

---

## Phase 5: US4 — Editar y Eliminar Gastos ✅

**Goal**: El usuario puede corregir o eliminar un gasto; el saldo refleja el cambio en ≤ 300 ms sin recarga.

- [x] T025 [US4] Crear `src/features/expense-history/use-expenses.ts` — `handleEdit` (→`openEditModal`), `handleDelete`, `handleUpdate`
- [x] T026 [US4] `expense-item.tsx` ya incluye `onEdit?`/`onDelete?` opcionales desde T023 ✓
- [x] T027 [US4] Crear `src/features/expense-history/use-edit-expense-form.ts` + `edit-expense-modal.tsx` — modal con overlay, `role="dialog"`, `key={expense.id}`, reutiliza `ExpenseForm`

**Checkpoint**: US4 completa; CRUD de gastos totalmente funcional.

---

## Phase 6: US5 — Reiniciar Todo ✅

**Goal**: El usuario puede limpiar todos los datos del mes con confirmación robusta.

- [x] T028 [US5] Crear `src/features/expense-history/reset-button.tsx` — doble confirmación inline, advertencia roja explícita, cancelar seguro (FR-007, SC-006)
- [x] T029 [US5] Conectar `reset-button.tsx` con `resetAll()` en `src/app.tsx` ← **implementado en T031**

**Checkpoint**: US5 completa; "Reiniciar Todo" requiere siempre doble confirmación.

---

## Phase 7: Integración SPA y Composición Final ✅

**Purpose**: Ensamblar todas las features en la SPA, implementar navegación por estado y aplicar el estilo editorial completo.

- [x] T030 `src/store/expense-store.ts` — NavSlice (`isModalOpen`, `editingExpense`, `openModal`, `closeModal`, `openEditModal`) correctamente separado; sin react-router en ningún archivo ✓
- [x] T031 Crear `src/App.tsx` — Dashboard (BudgetSummary/BudgetForm + ExpenseList + ResetButton) + NewExpenseModal + EditExpenseModal; navegación SPA por `isModalOpen`/`editingExpense`; botón "＋ Nuevo gasto"; `resetAll` conectado (T029 ✓)
- [x] T032 Actualizar `src/main.tsx` — importa `./App.tsx`; monta `<App />` en `#root` ✓
- [x] T033 [P] Auditoría presentacionales — solo `edit-expense-modal.tsx` accede al store (es contenedor SPA, correcto); todos los demás `.tsx` de features son puramente presentacionales ✓
- [x] T034 [P] Auditoría No-Line Rule — ningún componente usa `rounded-*` con valor distinto de 0 ✓
- [x] T035 [P] Tokens Design System — `bg-primary`, `bg-surface-container-low`, `bg-background`, `text-primary` usados como clases Tailwind directas en todos los componentes; sin `var(--color-*)` inline ✓

**Checkpoint**: SPA completamente funcional; navegación por estado; estilo editorial aplicado.

---

## Phase 8: Polish y Criterios de Éxito

**Purpose**: Validar criterios de aceptación del spec.md antes de dar por terminada la implementación.

- [ ] T036 [P] Validar SC-001 — recorrer el flujo "monto → tarjeta → cuotas → confirmar" contando interacciones; ajustar UX si supera 4 pasos
- [ ] T037 [P] Validar SC-002 — medir tiempo desde confirmación de gasto hasta actualización visible del saldo; debe ser ≤ 300 ms (sin animaciones bloqueantes)
- [ ] T038 [P] Validar SC-003 — revisar manualmente en code review: `calcMontoCuota(1200000, 3) === 400000`; `calcMontoCuota(100, 3) === 34` (half-up); `calcMontoCuota(100, 1) === 100`
- [ ] T039 [P] Validar SC-004 — desconectar red y verificar que todas las funciones principales operan sin errores
- [ ] T040 [P] Validar SC-005 — auditar con DevTools Network que no hay fetch/XHR saliente en ningún flujo
- [ ] T041 [P] Validar SC-006 — confirmar que no hay camino para invocar `resetAll()` sin pasar por la confirmación secundaria
- [ ] T042 [P] Validar SC-007 — revisar que cada campo numérico inválido muestra un mensaje específico (no genérico)
- [ ] T043 Ejecutar linter y formatter: `npm run lint && npm run format:check`; corregir cualquier violación antes del merge

**Checkpoint**: Todos los Success Criteria del spec.md verificados. Listo para merge.

---

## Dependencies — Orden de Completitud

```
Phase 1 (Setup)
    └─► Phase 2 (Foundational: types + core + store + shared UI)
            ├─► Phase 3 (US1: Budget)          — puede comenzar en paralelo con Phase 4
            ├─► Phase 4 (US2+US3: Registration + History)  — puede comenzar en paralelo con Phase 3
            ├─► Phase 5 (US4: CRUD)            — requiere Phase 4 completa
            └─► Phase 6 (US5: Reset)           — requiere Phase 2 completa
                    └─► Phase 7 (Integration)  — requiere Phases 3+4+5+6 completas
                            ├─► Phase 8 (Polish) — requiere Phase 7 completa
                            └─► Phase 9 (PDF Export) — requiere Phase 7 completa
```

### Tareas paralelizables dentro de Phase 2

```
T011 (types) → T012 (math) [P] + T013 (storage) [P] en paralelo
                        └─────────────────────────┘
                                    │
                                  T014 (store)
                                    │
                          T015 [P] + T016 [P] en paralelo
```

### MVP incremental sugerido

| MVP       | Phases      | Entrega                                   |
| --------- | ----------- | ----------------------------------------- |
| **MVP-A** | 1 + 2 + 3   | Configurar presupuesto y ver saldo        |
| **MVP-B** | + 4         | Registrar gastos y ver resumen            |
| **MVP-C** | + 5 + 6 + 7 | CRUD completo, reset y SPA integrada      |
| **Final** | + 8 + 9     | Polish, exportación PDF y validación      |

---

## Phase 9: US6 — Exportar Reporte como PDF y Compartir

**Purpose**: El usuario puede descargar un PDF del reporte mensual cerrado y compartirlo por WhatsApp u otra app.

**Prerequisites**: Phase 7 completa (reportes funcionales con modal de detalle).

- [ ] T044 Instalar dependencias: `pnpm add jspdf jspdf-autotable` + `pnpm add -D @types/jspdf`
- [ ] T045 [P] [US6] Crear `src/features/reports/services/report-pdf.ts` — función `generateReportPdf(report: MonthlyReport): Promise<Blob>` que construye el PDF con jsPDF + autoTable: título (label), fecha de cierre, tabla resumen (presupuesto/gastado/saldo), tabla de gastos (descripción, categoría, cuota, monto)
- [ ] T046 [P] [US6] Crear `src/features/reports/services/share-report.ts` — función `shareReport(blob: Blob, filename: string): Promise<void>` que usa `navigator.share({ files })` si está disponible, con fallback a `URL.createObjectURL` + descarga directa
- [ ] T047 [US6] Agregar botones "Descargar PDF" y "Compartir" al `report-detail-modal.tsx` con estados de loading; conectar con `generateReportPdf` y `shareReport`

**Checkpoint**: US6 completa; el usuario puede descargar y compartir el PDF del reporte desde el modal de detalle.

---

## Implementation Strategy

1. **Empezar por `src/types/index.ts` y `src/core/math/finance.ts`** — son la base de todo.
   Sin ellos, el store y los hooks no pueden compilar.
2. **El store es el contrato de la app** — implementarlo completamente antes de tocar cualquier
   componente. Referencia: `contracts/store.md`.
3. **Hooks antes que componentes** — cada hook debe poder usarse de forma aislada. Los
   componentes son solo plantillas de presentación que reciben props.
4. **Stitch como referencia visual** — los assets descargados en T007/T008 son la fuente de
   verdad para espaciado, colores y tipografía. No inventar estilos; traducir los tokens de
   Stitch a clases Tailwind.
5. **No instalar react-router** — toda navegación es un booleano en el store.
   Si surge la necesidad de múltiples rutas, abrir una enmienda a la constitución primero.

---

## Summary

| Métrica                            | Valor                  |
| ---------------------------------- | ---------------------- |
| Total de tareas                    | 47                     |
| Phase 1 — Setup                    | 10 tareas              |
| Phase 2 — Foundational             | 6 tareas               |
| Phase 3 — US1 Budget               | 3 tareas               |
| Phase 4 — US2+US3 Registro+Resumen | 5 tareas               |
| Phase 5 — US4 CRUD                 | 3 tareas               |
| Phase 6 — US5 Reset                | 2 tareas               |
| Phase 7 — Integración SPA          | 6 tareas               |
| Phase 8 — Polish                   | 8 tareas               |
| Phase 9 — PDF Export + Share        | 4 tareas               |
| Tareas paralelizables [P]          | 24 tareas              |
| MVP mínimo (MVP-A)                 | Phases 1–3 → 19 tareas |
