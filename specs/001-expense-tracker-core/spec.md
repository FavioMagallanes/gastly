# Feature Specification: App de Control de Gastos Mensuales

**Feature Branch**: `001-expense-tracker-core`
**Created**: 2026-03-23
**Status**: Draft
**Input**: User description: "App de Control de Gastos Mensuales con presupuesto inicial, registro por categorías (Tarjeta BBVA, Tarjeta Supervielle, Préstamo, Otros), lógica de cuotas, CRUD completo y botón Reiniciar Todo."

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Configurar presupuesto mensual (Priority: P1)

El usuario abre la aplicación por primera vez en el mes y define cuánto dinero tiene disponible
para gastar. Este valor es la base de todos los cálculos de saldo restante.

**Why this priority**: Sin presupuesto no hay saldo que mostrar; es el punto de entrada
obligatorio de toda la experiencia.

**Independent Test**: Ingresar un monto de presupuesto y verificar que el saldo restante
mostrado sea igual al monto ingresado (aún sin gastos registrados).

**Acceptance Scenarios**:

1. **Given** la app sin presupuesto configurado, **When** el usuario ingresa $50.000 y confirma,
   **Then** el saldo restante muestra $50.000 y el formulario de gastos queda habilitado.
2. **Given** un presupuesto ya configurado, **When** el usuario lo edita a $60.000,
   **Then** el saldo restante se recalcula automáticamente descontando los gastos existentes.
3. **Given** el campo de presupuesto vacío, **When** el usuario intenta confirmar con valor 0
   o negativo, **Then** se muestra un error específico y no se guarda el valor.

---

### User Story 2 — Registrar un gasto con categoría y cuotas (Priority: P1)

El usuario registra un gasto seleccionando la categoría (Tarjeta BBVA, Tarjeta Supervielle,
Préstamo u Otros), ingresa el monto total y, si elige una tarjeta, especifica en cuántas cuotas
lo pagará. La app calcula automáticamente el monto por cuota.

**Why this priority**: Es la acción más frecuente de la app; su fluidez determina el valor
diario del producto.

**Independent Test**: Registrar un gasto de $12.000 en 3 cuotas con Tarjeta BBVA y verificar
que el monto por cuota calculado sea $4.000 y que el saldo restante se reduzca en $12.000.

**Acceptance Scenarios**:

1. **Given** el formulario de nuevo gasto abierto, **When** el usuario selecciona "Tarjeta BBVA",
   **Then** los campos "Cuota X de Y" se habilitan y el campo de cuota recibe foco.
2. **Given** monto $12.000 y 3 cuotas seleccionadas, **When** el usuario confirma,
   **Then** la app muestra "Cuota 1 de 3 — $4.000" y descuenta $12.000 del saldo.
3. **Given** la categoría "Otros" seleccionada, **When** el usuario completa el formulario,
   **Then** los campos de cuotas no aparecen y el monto se registra en su totalidad.
4. **Given** el campo de monto vacío o con texto no numérico, **When** el usuario intenta guardar,
   **Then** se muestra un mensaje de error específico ("El monto debe ser un número positivo").
5. **Given** cuotas = 0 o valor negativo, **When** el usuario intenta guardar,
   **Then** se muestra error "El número de cuotas debe ser al menos 1".

---

### User Story 3 — Visualizar resumen de gastos y saldo (Priority: P1)

El usuario ve de un vistazo el presupuesto total, el total gastado, el saldo restante y la
lista de todos los gastos del mes con su categoría, monto y detalle de cuotas.

**Why this priority**: La lectura del estado financiero es el motivo principal por el que el
usuario abre la app a diario.

**Independent Test**: Con 3 gastos registrados de distintas categorías, verificar que el total
mostrado sea la suma exacta y el saldo sea presupuesto − total gastos.

**Acceptance Scenarios**:

1. **Given** gastos registrados, **When** el usuario ve la pantalla principal,
   **Then** se muestran: presupuesto, total gastado, saldo restante y lista de gastos.
2. **Given** un gasto en cuotas, **When** aparece en la lista,
   **Then** muestra descripción, categoría, monto total y detalle "Cuota X de Y — $monto_cuota".
3. **Given** ningún gasto registrado, **When** el usuario ve la pantalla principal,
   **Then** el saldo restante es igual al presupuesto y la lista muestra un estado vacío
   con indicación de cómo registrar el primer gasto.

---

### User Story 4 — Editar o eliminar un gasto existente (Priority: P2)

El usuario puede corregir un gasto ya registrado (monto, categoría, cuotas, descripción) o
eliminarlo. El saldo restante se actualiza de forma inmediata.

**Why this priority**: Los errores de carga son inevitables; la gestión correctiva es crítica
para mantener la precisión financiera.

**Independent Test**: Editar el monto de un gasto de $5.000 a $8.000 y verificar que el saldo
se reduzca en $3.000 adicionales sin recargar la pantalla.

**Acceptance Scenarios**:

1. **Given** un gasto en la lista, **When** el usuario selecciona "Editar",
   **Then** el formulario se abre precargado con los valores actuales del gasto.
2. **Given** el formulario de edición con cambios, **When** el usuario guarda,
   **Then** el saldo restante refleja la diferencia en ≤ 300 ms sin recarga de pantalla.
3. **Given** un gasto en la lista, **When** el usuario selecciona "Eliminar" y confirma,
   **Then** el gasto desaparece de la lista y el saldo restante aumenta en el monto eliminado.
4. **Given** la acción de eliminar iniciada, **When** falla el guardado local,
   **Then** el gasto permanece en la lista y se muestra un mensaje de error claro.

---

### User Story 5 — Reiniciar todo el mes (Priority: P3)

El usuario puede limpiar todos los gastos y el presupuesto del mes para comenzar desde cero,
típicamente al inicio de un nuevo período.

**Why this priority**: Función de utilidad mensual; importante pero no bloquea el valor diario
del producto.

**Independent Test**: Con gastos y presupuesto configurados, ejecutar "Reiniciar Todo" y
verificar que la lista quede vacía y el presupuesto vuelva a estado no configurado.

**Acceptance Scenarios**:

1. **Given** gastos y presupuesto existentes, **When** el usuario presiona "Reiniciar Todo",
   **Then** se muestra una confirmación explícita advirtiendo que se borrarán todos los datos.
2. **Given** la confirmación aceptada, **When** la operación se completa,
   **Then** la lista de gastos queda vacía, el presupuesto vuelve a "sin configurar"
   y el saldo muestra $0.
3. **Given** la confirmación rechazada, **When** el usuario cancela,
   **Then** no se modifica ningún dato y la app permanece en su estado anterior.

---

### Edge Cases

- ¿Qué ocurre si el total de gastos supera el presupuesto? → El saldo se muestra en negativo
  (en rojo) para alertar al usuario; no se bloquea el registro.
- ¿Qué ocurre si se ingresa un monto con decimales? → Se acepta hasta 2 decimales; valores
  con más decimales se redondean con regla half-up (Principio I de la constitución).
- ¿Qué pasa si el usuario cierra la app durante el ingreso de un gasto? → El formulario
  se descarta; no se guarda ningún dato parcial.
- ¿Qué ocurre si se edita el presupuesto a un valor menor que el total gastado? → Se permite
  pero el saldo queda negativo y se advierte visualmente.
- ¿Qué pasa si se intenta registrar un gasto con presupuesto no configurado? → El botón de
  agregar gasto permanece deshabilitado hasta que exista un presupuesto válido.

---

### User Story 6 — Exportar reporte mensual como PDF y compartir (Priority: P3)

El usuario puede generar un PDF del reporte de un mes cerrado y compartirlo a través de
WhatsApp u otra aplicación instalada en su dispositivo.

**Why this priority**: Es un complemento de valor sobre los reportes ya existentes; no bloquea
ninguna funcionalidad principal pero mejora la utilidad práctica de los datos.

**Independent Test**: Con un reporte mensual cerrado, generar el PDF y verificar que contiene
el resumen (presupuesto, total gastado, saldo) y la lista completa de gastos con categorías
y montos correctos.

**Acceptance Scenarios**:

1. **Given** un reporte mensual cerrado visible en el modal de detalle, **When** el usuario
   presiona "Descargar PDF", **Then** se genera y descarga un archivo PDF con el nombre
   `reporte-{label}.pdf` que contiene el resumen financiero y la lista de gastos.
2. **Given** un dispositivo con soporte para Web Share API (móvil), **When** el usuario presiona
   "Compartir", **Then** se abre el sheet nativo del sistema con el PDF adjunto, permitiendo
   enviarlo por WhatsApp, Telegram u otra app.
3. **Given** un navegador de escritorio sin soporte para `navigator.share` con archivos,
   **When** el usuario presiona "Compartir", **Then** se descarga el PDF directamente como
   fallback.
4. **Given** el proceso de generación de PDF en curso, **When** el usuario espera,
   **Then** se muestra un estado de carga en el botón hasta que el PDF esté listo.
5. **Given** cualquier flujo de exportación, **When** el PDF se genera,
   **Then** la generación ocurre 100 % en el cliente; ningún dato financiero se envía a
   servidores externos (Principio II constitución).

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema DEBE permitir al usuario definir un presupuesto mensual con un único
  campo numérico positivo antes de habilitar el registro de gastos.
- **FR-002**: El sistema DEBE ofrecer exactamente 4 categorías de gasto predefinidas y no
  editables: Tarjeta BBVA, Tarjeta Supervielle, Préstamo y Otros.
- **FR-003**: El sistema DEBE habilitar los campos "Cuota actual" y "Total de cuotas"
  únicamente cuando la categoría seleccionada sea "Tarjeta BBVA" o "Tarjeta Supervielle".
- **FR-004**: El sistema DEBE calcular automáticamente el monto por cuota como
  `monto_total ÷ total_cuotas` con redondeo half-up a 2 decimales, usando aritmética de punto
  fijo (sin `float`/`double`).
- **FR-005**: El sistema DEBE mostrar el saldo restante (`presupuesto − suma de montos totales
de gastos`) actualizándolo sincrónicamente al confirmar cualquier alta, edición o baja.
- **FR-006**: El sistema DEBE implementar CRUD completo sobre cada registro de gasto:
  crear, leer (listar), editar y eliminar.
- **FR-007**: El sistema DEBE solicitar confirmación explícita antes de ejecutar la acción
  "Reiniciar Todo" y, al confirmarse, eliminar todos los gastos y restablecer el presupuesto
  a estado no configurado.
- **FR-008**: El sistema DEBE validar que todo campo numérico (monto, cuotas) sea un número
  positivo y mostrar mensajes de error específicos ante valores inválidos.
- **FR-009**: El sistema DEBE persistir todos los datos localmente en el dispositivo;
  ningún dato debe enviarse a servidores externos.
- **FR-010**: El formulario de nuevo gasto DEBE colocar el foco automáticamente en el campo
  de monto al abrirse y preseleccionar "Tarjeta BBVA" y "1 cuota" como valores por defecto.
- **FR-011**: Los campos de selección de tarjeta DEBEN presentarse como lista de selección
  rápida (picker/dropdown); no se permite entrada de texto libre para la categoría.
- **FR-012**: Cuando el saldo restante sea negativo, el sistema DEBE mostrarlo con indicación
  visual de alerta (ej. color rojo) sin bloquear el registro de nuevos gastos.
- **FR-013**: El sistema DEBE permitir generar un archivo PDF a partir de un reporte mensual
  cerrado, conteniendo el resumen financiero y la lista detallada de gastos. La generación
  DEBE ocurrir íntegramente en el cliente sin enviar datos a servicios externos.
- **FR-014**: El sistema DEBE ofrecer la opción de compartir el PDF generado usando la
  Web Share API nativa cuando esté disponible, con fallback a descarga directa en
  navegadores sin soporte.

### Key Entities

- **Presupuesto**: monto mensual definido por el usuario (valor único por sesión de mes);
  atributos: `monto` (entero en centavos), `fecha_configuracion`.
- **Gasto**: registro de un egreso; atributos: `id`, `descripcion` (opcional), `categoria`
  (enum: BBVA | SUPERVIELLE | PRESTAMO | OTROS), `monto_total` (entero en centavos),
  `cuota_actual` (entero ≥ 1, solo tarjetas), `total_cuotas` (entero ≥ 1, solo tarjetas),
  `monto_por_cuota` (calculado, entero en centavos), `fecha_registro`.
- **Resumen**: valor calculado derivado de Presupuesto y Gastos; no persiste de forma
  independiente; atributos: `presupuesto`, `total_gastado`, `saldo_restante`.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El usuario completa el registro de un gasto en el flujo más común
  (monto + tarjeta + cuotas + confirmar) en ≤ 4 interacciones.
- **SC-002**: El saldo restante se actualiza y queda visible al usuario en ≤ 300 ms tras
  confirmar cualquier alta, edición o baja de gasto.
- **SC-003**: El cálculo de monto por cuota produce el valor correcto al centavo para todos
  los casos revisados en code review (monto exacto, monto con resto, cuota única).
- **SC-004**: La aplicación funciona sin conexión a internet en el 100 % de sus funcionalidades
  principales (registro, edición, eliminación, resumen, reinicio).
- **SC-005**: Ningún dato financiero del usuario es transmitido fuera del dispositivo en ningún
  flujo de uso normal o de error.
- **SC-006**: El botón "Reiniciar Todo" requiere siempre una confirmación secundaria; no existe
  camino para ejecutarlo en un único gesto involuntario.
- **SC-007**: Los mensajes de error para campos numéricos inválidos identifican el campo
  específico y la razón del rechazo (no se usan mensajes genéricos).

---

## Assumptions

- La aplicación es de uso personal (un solo usuario por instalación); no se requiere
  autenticación multi-usuario.
- El período mensual no se gestiona automáticamente por calendario; el usuario decide cuándo
  reiniciar mediante el botón "Reiniciar Todo".
- El historial de meses anteriores queda fuera del alcance de esta especificación.
- La moneda es única (la local del usuario) y no requiere conversión ni símbolo configurable
  en esta versión.
- "Monto total del gasto" representa el importe completo de la compra, no la cuota individual;
  la cuota es un campo calculado y de visualización.
- El campo "descripción" del gasto es opcional y de texto libre; no afecta ningún cálculo.
