import { Icon } from '../../../shared/ui/icon'

const fmt = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)

interface BudgetSummaryProps {
  budgetAmount: number
  totalSpent: number
  remainingBalance: number
  isOverBudget: boolean
}

export const BudgetSummary = ({
  budgetAmount,
  totalSpent,
  remainingBalance,
  isOverBudget,
}: BudgetSummaryProps) => {
  const pct = budgetAmount > 0 ? Math.min((totalSpent / budgetAmount) * 100, 100) : 0
  const barColor = isOverBudget ? 'bg-red-500' : pct > 80 ? 'bg-orange-400' : 'bg-primary'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatCard
        label="Gastado"
        value={fmt(totalSpent)}
        footer={
          <div className="mt-4">
            <div className="h-2 bg-ds-border dark:bg-dark-border rounded-full overflow-hidden">
              <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-ds-secondary dark:text-dark-secondary mt-2">
              {pct.toFixed(0)}% del presupuesto
            </p>
          </div>
        }
      />
      <StatCard
        label="Saldo restante"
        value={fmt(remainingBalance)}
        valueClassName={isOverBudget ? 'text-red-500' : 'text-ds-text dark:text-dark-text'}
        footer={
          <p
            className={`text-xs mt-6 font-medium flex items-center gap-1 ${isOverBudget ? 'text-red-500' : 'text-green-600'}`}
          >
            <Icon name={isOverBudget ? 'trending-down' : 'trending-up'} size="sm" />
            {isOverBudget ? 'Superaste el presupuesto' : 'En línea este mes'}
          </p>
        }
      />
      <StatCard
        label="Presupuesto mensual"
        value={fmt(budgetAmount)}
        footer={
          <p className="text-xs text-ds-secondary dark:text-dark-secondary mt-6">
            Período: {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </p>
        }
      />
    </div>
  )
}

const StatCard = ({
  label,
  value,
  valueClassName = 'text-ds-text dark:text-dark-text',
  footer,
}: {
  label: string
  value: string
  valueClassName?: string
  footer?: React.ReactNode
}) => (
  <div className="border border-ds-border dark:border-dark-border rounded-xl bg-background dark:bg-dark-surface p-5 hover:bg-[#EFEFEF] dark:hover:bg-dark-hover transition-colors">
    <p className="text-[11px] font-semibold text-ds-secondary dark:text-dark-secondary uppercase tracking-widest mb-2">
      {label}
    </p>
    <p className={`text-2xl font-bold tracking-tighter ${valueClassName}`}>{value}</p>
    {footer}
  </div>
)
