import { CATEGORY_LABELS, CATEGORIES } from '../../../types'
import type { Expense } from '../../../types'
import type { MonthlyReport } from '../../../types/database'

/** Formatea un número como moneda ARS para el PDF. */
const formatArsCurrency = (value: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(value)

/**
 * Genera un PDF con los gastos seleccionados de un reporte mensual.
 * Se importa `jspdf` y `jspdf-autotable` dinámicamente para reducir el bundle inicial.
 * Devuelve una Promise que resuelve con el Blob del PDF.
 */
export const generateReportPdf = async (
  report: MonthlyReport,
  expenses: Expense[],
): Promise<Blob> => {
  // Import dinámico de librerías pesadas
  const { jsPDF } = await import('jspdf')
  const autoTableModule = await import('jspdf-autotable')
  // Aceptar que el módulo pueda exportar default o ser la propia función
  const autoTable =
    (autoTableModule as unknown as { default?: (doc: unknown, opts: unknown) => void }).default ??
    (autoTableModule as unknown as (doc: unknown, opts: unknown) => void)

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

  const expensesTotal = expenses.reduce(
    (runningTotal, expense) => runningTotal + expense.totalAmount,
    0,
  )

  autoTable(doc, {
    startY: 38,
    head: [['Descripción', 'Categoría', 'Cuota', 'Monto']],
    body: expenses.map(expense => {
      const category = CATEGORIES.find(entry => entry.id === expense.categoryId)
      const label = CATEGORY_LABELS[expense.categoryId] ?? expense.categoryId
      const categoryText =
        category?.requiresBank && expense.banco ? `${label} · ${expense.banco}` : label
      return [
        expense.description || label,
        categoryText,
        expense.installment ?? '—',
        formatArsCurrency(expense.totalAmount),
      ]
    }),
    foot: [['', '', 'Total', formatArsCurrency(expensesTotal)]],
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
