import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CATEGORY_LABELS } from '../../../types'
import type { Expense } from '../../../types'
import type { MonthlyReport } from '../../../types/database'

/** Formatea un número como moneda ARS para el PDF. */
const fmt = (value: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(value)

/**
 * Genera un PDF con los gastos seleccionados de un reporte mensual.
 * Solo incluye la tabla de gastos (sin resumen de presupuesto/saldo).
 * 100% client-side — no envía datos a la red.
 */
export const generateReportPdf = (report: MonthlyReport, expenses: Expense[]): Blob => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  // ── Título ──
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(report.label, pageWidth / 2, 22, { align: 'center' })

  // ── Fecha de cierre ──
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120)
  const closedDate = new Date(report.closed_at).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  doc.text(`Cerrado el ${closedDate}`, pageWidth / 2, 29, { align: 'center' })

  // ── Tabla de gastos ──
  doc.setTextColor(0)

  const total = expenses.reduce((sum, e) => sum + e.totalAmount, 0)

  autoTable(doc, {
    startY: 38,
    head: [['Descripción', 'Categoría', 'Cuota', 'Monto']],
    body: expenses.map(expense => [
      expense.description || CATEGORY_LABELS[expense.category],
      CATEGORY_LABELS[expense.category],
      expense.installment ?? '—',
      fmt(expense.totalAmount),
    ]),
    foot: [['', '', 'Total', fmt(total)]],
    theme: 'striped',
    headStyles: {
      fillColor: [0, 95, 173],
      textColor: 255,
      fontStyle: 'bold',
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      3: { halign: 'right' },
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    margin: { left: 20, right: 20 },
  })

  // ── Footer ──
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(160)
    doc.text(
      `Expense Tracker · Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' },
    )
  }

  return doc.output('blob')
}
