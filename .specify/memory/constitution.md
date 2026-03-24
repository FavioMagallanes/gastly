<!--
SYNC IMPACT REPORT
==================
Version change: (template) → 1.0.0; amended 1.0.0 → 1.0.1; amended 1.0.1 → 1.0.2; amended 1.0.2 → 2.0.0 (MAJOR); amended 2.0.0 → 2.1.0 (MINOR)
Added principles:
  - I. Precisión Matemática
  - II. Privacidad de Datos (AMENDED v2.0.0: permitir cloud storage con condiciones)
  - III. UX de Entrada Rápida
  - IV. Estado Predictivo
  - V. Código Limpio
Added sections:
  - Restricciones Técnicas (AMENDED v2.0.0: Supabase como backend cloud)
  - Flujo de Desarrollo
  - Governance
Removed sections: none
Templates requiring updates:
  ✅ .specify/memory/constitution.md (este archivo)
  ⚠ .specify/templates/plan-template.md — verificar alineación con principios I y IV
  ⚠ .specify/templates/spec-template.md — verificar secciones de privacidad y validaciones numéricas
  ⚠ .specify/templates/tasks-template.md — asegurar tipos de tarea para cálculos financieros y privacidad
Deferred TODOs: ninguno

AMENDMENT v2.0.0 — Justificación:
  El usuario necesita acceso multi-dispositivo (PC + móvil) a sus reportes mensuales.
  localStorage no sincroniza entre dispositivos. Supabase provee PostgreSQL + Auth + RLS
  bajo modelo open-source. Se mantiene cifrado y control del usuario sobre sus datos
  mediante Row Level Security (cada usuario solo ve sus propios datos).
-->

# Expense Tracker Constitution

## Core Principles

### I. Precisión Matemática (NO NEGOCIABLE)

Todos los cálculos de saldos, cuotas e intereses DEBEN producir resultados exactos y reproducibles.

- Los valores monetarios DEBEN representarse con aritmética de punto fijo o enteros en centavos;
  el uso de `float`/`double` para montos finales está **prohibido**.
- El cálculo de cuotas DEBE seguir la fórmula de amortización validada y documentarse
  explícitamente en el módulo financiero.
- Toda función que retorne un monto DEBE revisarse manualmente en code review para verificar
  precisión al centavo.
- Los redondeos DEBEN aplicarse con la regla "half-up" (round half away from zero) y documentarse
  explícitamente en la función.

### II. Privacidad de Datos (NO NEGOCIABLE)

Los datos financieros del usuario DEBEN permanecer bajo su control exclusivo y nunca exponerse a
terceros sin consentimiento explícito.

- Los datos PUEDEN almacenarse en un backend cloud (Supabase) siempre que:
  1. Se requiera autenticación (email + contraseña) para acceder.
  2. Se aplique Row Level Security (RLS) para que cada usuario solo acceda a sus propios datos.
  3. Se mantenga una capa de caché local (localStorage/Zustand persist) para funcionamiento
     offline del mes activo.
- Los datos en tránsito DEBEN usar HTTPS (garantizado por Supabase).
- La aplicación DEBE seguir funcionando para el mes activo sin conexión a internet
  (el cierre de mes y consulta de reportes históricos SÍ requieren conexión).
- Cualquier exportación de datos (PDF, CSV, compartir) DEBE advertir al usuario sobre el
  contenido sensible antes de proceder. La generación del archivo DEBE ocurrir íntegramente
  en el cliente; no se permite enviar datos financieros a servicios de terceros para renderizar.
- Las dependencias de terceros DEBEN auditarse antes de incorporarse; las que realicen telemetría
  o envíen datos a la red están **prohibidas** salvo justificación documentada y aprobada:
  - `@supabase/supabase-js` — cloud storage con RLS (aprobada v2.0.0).
  - `jspdf` + `jspdf-autotable` — generación de PDF 100 % client-side, sin red ni telemetría
    (aprobada v2.0.0).

### III. UX de Entrada Rápida

El registro de un gasto DEBE poder completarse en ≤ 4 interacciones (taps/clics/teclas) para el
flujo más común (monto + tarjeta + cuotas + confirmar).

- Los campos de tarjeta y número de cuotas DEBEN presentarse como listas de selección rápida
  (picker/dropdown) precargadas con las opciones del usuario; no se permite entrada de texto libre
  para estos campos.
- El campo de monto DEBE recibir foco automático al abrir el formulario de nuevo gasto.
- Los valores por defecto (tarjeta más usada, 1 cuota) DEBEN preseleccionarse para minimizar
  fricción en el caso común.
- La acción de guardar DEBE ejecutarse con un único gesto de confirmación (botón primario o tecla
  Enter) sin pasos adicionales de validación modal, excepto cuando existan errores de campo.

### IV. Estado Predictivo

La interfaz DEBE reflejar el impacto de cualquier modificación en el presupuesto disponible de
forma **síncrona e inmediata**, sin requerir recarga de página o navegación adicional.

- El saldo disponible y los totales por categoría DEBEN recalcularse y mostrarse en la misma
  transacción de UI que confirma la edición o eliminación de un gasto.
- No DEBE existir un estado intermedio donde el saldo visible sea inconsistente con los gastos
  listados.
- Los cambios optimistas en la UI DEBEN revertirse automáticamente si la operación de persistencia
  falla, mostrando un mensaje de error claro.
- Las animaciones de transición de valores monetarios DEBEN completarse en ≤ 300 ms para no
  interrumpir el flujo cognitivo del usuario.

### V. Código Limpio

El código DEBE ser modular, legible y resistente a errores de entrada, privilegiando la
mantenibilidad sobre la brevedad.

- Cada categoría de gasto DEBE encapsularse en su propio componente/módulo con interfaz pública
  documentada; no se permiten componentes "monolíticos" que mezclen categorías.
- Todo campo numérico (monto, cuotas, límite de tarjeta) DEBE validarse tanto en el lado cliente
  como en la capa de persistencia; los valores inválidos DEBEN rechazarse con mensajes de error
  específicos (no genéricos).
- Las funciones de cálculo financiero DEBEN ser puras (sin efectos secundarios) y residir en un
  módulo dedicado separado de la lógica de UI.
- El código DEBE seguir la guía de estilo del proyecto (linter + formatter configurados en el
  repositorio); los PRs que fallen el linting NO DEBEN mergearse.
- La duplicación de lógica de negocio está **prohibida**; se DEBE extraer a utilidades compartidas.

## Restricciones Técnicas

- **Almacenamiento**: Supabase (PostgreSQL) como backend cloud + localStorage como caché local
  para el mes activo. Zustand persist mantiene el estado del mes actual offline.
- **Autenticación**: Supabase Auth con email + contraseña.
- **Seguridad**: Row Level Security (RLS) en todas las tablas; cada usuario solo accede a sus datos.
- **Aritmética**: Biblioteca de aritmética decimal/enteros para todos los cálculos monetarios
  (ej. `decimal.js`, `big.js`, o equivalente nativo del lenguaje).
- **Dependencias externas**: Cada nueva dependencia DEBE justificarse en el PR que la introduce
  (propósito, tamaño, política de privacidad); las de telemetría están prohibidas.
- **Compatibilidad offline**: El mes activo (budget + gastos) funciona sin conexión.
  El cierre de mes y consulta de reportes históricos requieren conexión.

## Flujo de Desarrollo

- **Revisión de privacidad**: Todo PR que agregue persistencia, exportación o red DEBE incluir
  en su descripción una sección "Impacto en Privacidad" revisada por al menos un colaborador.
- **Quality gates**: Los pipelines de CI DEBEN ejecutar linter y formatter check;
  un fallo en cualquiera bloquea el merge.
- **Revisión de UX**: Cualquier cambio en el formulario de entrada de gastos DEBE validarse contra
  el criterio de ≤ 4 interacciones (Principio III) antes de mergearse.

## Governance

Esta constitución es el documento rector del proyecto Expense Tracker y tiene precedencia sobre
cualquier decisión de diseño o implementación individual.

- Todo PR DEBE verificar cumplimiento con los cinco principios antes de solicitar revisión.
- Las enmiendas a esta constitución REQUIEREN:
  1. Propuesta documentada que justifique el cambio.
  2. Aprobación de al menos un colaborador adicional.
  3. Actualización de versión según semver de constitución (MAJOR / MINOR / PATCH).
  4. Actualización de `LAST_AMENDED_DATE` y propagación a templates dependientes.
- La complejidad añadida DEBE justificarse explícitamente; se aplica el principio YAGNI.
- Ante ambigüedad en la interpretación de un principio, prevalece la lectura más restrictiva
  hasta que una enmienda formal la aclare.

**Version**: 2.1.0 | **Ratified**: 2026-03-23 | **Last Amended**: 2026-03-24
