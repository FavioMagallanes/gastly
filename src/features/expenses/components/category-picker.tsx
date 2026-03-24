import { CATEGORY_LABELS } from '../../../types'
import { Icon } from '../../../shared/ui/icon'
import type { Category } from '../../../types'

interface CategoryPickerProps {
  value: Category
  onChange: (category: Category) => void
}

const CATEGORIES: Category[] = ['BBVA', 'SUPERVIELLE', 'PRESTAMO', 'SERVICIOS', 'COLEGIO', 'OTROS']

export const CategoryPicker = ({ value, onChange }: CategoryPickerProps) => {
  const isDefault = value === 'OTROS'

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-[11px] font-semibold text-ds-secondary dark:text-dark-secondary uppercase tracking-widest">
        Categoría
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value as Category)}
          className={`w-full appearance-none border border-ds-border dark:border-dark-border rounded-lg bg-surface dark:bg-dark-surface px-3 py-2.5 pr-10 text-sm outline-none transition-all focus:ring-1 focus:ring-primary/50 cursor-pointer [&>option]:font-normal [&>option]:text-ds-text [&>option]:bg-white dark:[&>option]:text-dark-text dark:[&>option]:bg-dark-surface ${isDefault ? 'text-ds-secondary dark:text-dark-secondary font-normal' : 'text-ds-text dark:text-dark-text font-medium'}`}
        >
          {CATEGORIES.map(category => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon
            name="unfold-more"
            size="base"
            className="text-ds-secondary dark:text-dark-secondary"
          />
        </span>
      </div>
    </div>
  )
}
