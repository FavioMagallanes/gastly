import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CATEGORY_LABELS } from '../../../types'
import type { MonthlyReport } from '../../../types/database'

/** Formatea un número como moneda ARS para el PDF (sin símbolo para tablas). */
const fmt = (value: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(value)

/**
 * Genera un PDF del reporte mensual 100% client-side.
 * Retorna un Blob listo para descargar o compartir.
 */
export const generateReportPdf = (report: MonthlyReport): Blob => {
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
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`Cerrado el ${closedDate}`, pageWidth / 2, 29, { align: 'center' })

  // ── Tabla resumen ──
  doc.setTextColor(0)
  autoTable(doc, {
    startY: 36,
    head: [['Concepto', 'Monto']],
    body: [
      ['Presupuesto', fmt(report.budget)],
      ['Total gastado', fmt(report.total_spent)],
      ['Saldo', fmt(report.remaining_balance)],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [0, 95, 173],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      1: { halign: 'right' },
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    margin: { left: 20, right: 20 },
    didParseCell: data => {
      // Saldo en rojo si excede presupuesto
      if (data.section === 'body' && data.row.index === 2 && data.column.index === 1) {
        if (report.is_over_budget) {
          data.cell.styles.textColor = [220, 38, 38]
          data.cell.styles.fontStyle = 'bold'
        }
      }
    },
  })

  // ── Tabla de gastos ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const summaryEndY = (doc as any).lastAutoTable?.finalY ?? 80

  autoTable(doc, {
    startY: summaryEndY + 10,
    head: [['Descripción', 'Categoría', 'Cuota', 'Monto']],
    body: report.expenses.map(expense => [
      expense.description || CATEGORY_LABELS[expense.category],
      CATEGORY_LABELS[expense.category],
      expense.installment ?? '—',
      fmt(expense.totalAmount),
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: [0, 95, 173],
      textColor: 255,
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
