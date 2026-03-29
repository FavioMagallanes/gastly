import { Modal } from '../../../shared/ui/modal'
import { Icon } from '../../../shared/ui/icon'
import { Button } from '../../../shared/ui/button'
import { formatCurrency } from '../../../core/math/format'
import { CATEGORY_LABELS } from '../../../types'
import type { MonthlyReport } from '../../../types/database'
import type { ReportUpdatePayload } from '../services/report-service'
import { ReportExpenseModal } from './report-expense-modal'
import { getExpenseRowKey, useReportDetailModal } from '../hooks/use-report-detail-modal'

type ReportDetailModalProps = {
  report: MonthlyReport
  onClose: () => void
  onUpdate: (id: string, payload: ReportUpdatePayload) => Promise<boolean>
}

export const ReportDetailModal = ({ report, onClose, onUpdate }: ReportDetailModalProps) => {
  const {
    isEditing,
    subModal,
    setSubModal,
    isSaving,
    draftBudget,
    setDraftBudget,
    listExpenses,
    selectedRowKeys,
    summaryBudget,
    summaryTotalSpent,
    summaryRemaining,
    summaryOverBudget,
    closedAtLabel,
    isDownloadingPdf,
    isSharingPdf,
    handleStartEdit,
    handleCancelEdit,
    handleSaveReport,
    handleDownloadPdf,
    handleSharePdf,
    toggleRowSelection,
    toggleSelectAllRows,
    handleDeleteDraftExpense,
    handleCommitExpenseFromSubModal,
  } = useReportDetailModal(report, onUpdate)

  return (
    <>
      <Modal title={report.label} icon="receipt-dollar" onClose={onClose}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {!isEditing ? (
              <Button variant="secondary" size="sm" leadingIcon="pencil-edit" onClick={handleStartEdit}>
                Editar reporte
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                  Cancelar edición
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leadingIcon="check"
                  onClick={() => void handleSaveReport()}
                  loading={isSaving}
                >
                  Guardar cambios
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon="add"
                  onClick={() => setSubModal('new')}
                  disabled={isSaving}
                >
                  Agregar gasto
                </Button>
              </>
            )}
          </div>

          <div className="rounded-lg border border-ds-border dark:border-dark-border p-4 space-y-2 text-[13px]">
            <div className="flex justify-between items-center gap-2">
              <span className="text-ds-secondary dark:text-dark-secondary">Presupuesto</span>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <span className="text-ds-secondary dark:text-dark-secondary text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={draftBudget}
                    onChange={e => setDraftBudget(e.target.value)}
                    className="w-28 border border-ds-border dark:border-dark-border rounded-lg bg-surface dark:bg-dark-surface px-2 py-1 text-right text-sm font-medium text-ds-text dark:text-dark-text outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              ) : (
                <span className="font-medium text-ds-text dark:text-dark-text">
                  {formatCurrency(summaryBudget)}
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-ds-secondary dark:text-dark-secondary">Total gastado</span>
              <span className="font-medium text-ds-text dark:text-dark-text">
                {formatCurrency(summaryTotalSpent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ds-secondary dark:text-dark-secondary">Saldo</span>
              <span
                className={`font-medium ${summaryOverBudget ? 'text-danger' : 'text-ds-text dark:text-dark-text'}`}
              >
                {formatCurrency(summaryRemaining)}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[13px] font-medium text-ds-text dark:text-dark-text">
                Gastos ({selectedRowKeys.size}/{listExpenses.length})
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={toggleSelectAllRows}
                  className="text-[11px] text-primary hover:underline underline-offset-2 cursor-pointer"
                >
                  {selectedRowKeys.size === listExpenses.length
                    ? 'Deseleccionar todo'
                    : 'Seleccionar todo'}
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {listExpenses.map((expense, i) => {
                const rowKey = getExpenseRowKey(expense, i)
                const isRowSelected = selectedRowKeys.has(rowKey)
                return (
                  <div
                    key={rowKey}
                    onClick={!isEditing ? () => toggleRowSelection(rowKey) : undefined}
                    role={!isEditing ? 'button' : undefined}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[13px] transition-colors ${
                      isEditing
                        ? 'border-ds-border dark:border-dark-border cursor-default'
                        : `cursor-pointer ${
                            isRowSelected
                              ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                              : 'border-ds-border dark:border-dark-border opacity-50'
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {!isEditing && (
                        <div
                          className={`size-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                            isRowSelected
                              ? 'bg-primary border-primary'
                              : 'border-ds-border dark:border-dark-border'
                          }`}
                        >
                          {isRowSelected && <Icon name="check" size="sm" className="text-white" />}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-ds-text dark:text-dark-text truncate">
                          {expense.description || CATEGORY_LABELS[expense.categoryId]}
                        </p>
                        <p className="text-[11px] text-ds-secondary dark:text-dark-secondary">
                          {CATEGORY_LABELS[expense.categoryId]}
                          {expense.installment && ` · Cuota ${expense.installment}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-medium text-ds-text dark:text-dark-text">
                        {formatCurrency(expense.totalAmount)}
                      </span>
                      {isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label="Editar gasto"
                            onClick={e => {
                              e.stopPropagation()
                              setSubModal(expense)
                            }}
                            className="size-8 inline-flex items-center justify-center rounded-lg text-ds-secondary dark:text-dark-secondary hover:bg-surface dark:hover:bg-dark-hover hover:text-ds-text dark:hover:text-dark-text transition-colors cursor-pointer"
                          >
                            <Icon name="pencil-edit" size="base" />
                          </button>
                          <button
                            type="button"
                            aria-label="Eliminar gasto"
                            onClick={e => {
                              e.stopPropagation()
                              handleDeleteDraftExpense(expense, i)
                            }}
                            className="size-8 inline-flex items-center justify-center rounded-lg text-ds-secondary dark:text-dark-secondary hover:bg-surface dark:hover:bg-dark-hover hover:text-danger transition-colors cursor-pointer"
                          >
                            <Icon name="delete" size="base" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              leadingIcon="download"
              onClick={handleDownloadPdf}
              loading={isDownloadingPdf}
              disabled={selectedRowKeys.size === 0}
            >
              {isDownloadingPdf ? 'Generando...' : 'Descargar PDF'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              leadingIcon="share"
              onClick={handleSharePdf}
              loading={isSharingPdf}
              disabled={selectedRowKeys.size === 0}
            >
              {isSharingPdf ? 'Compartiendo...' : 'Compartir'}
            </Button>
          </div>

          <p className="text-[11px] text-ds-secondary dark:text-dark-secondary text-center">
            Cerrado el {closedAtLabel}
          </p>
        </div>
      </Modal>

      {subModal !== null && (
        <ReportExpenseModal
          key={subModal === 'new' ? 'new' : subModal.id}
          initial={subModal === 'new' ? null : subModal}
          onClose={() => setSubModal(null)}
          onSave={handleCommitExpenseFromSubModal}
        />
      )}
    </>
  )
}
