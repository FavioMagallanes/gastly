import { CATEGORY_LABELS } from '../../types'
import type { Category } from '../../types'

interface CategoryPickerProps {
  value: Category
  onChange: (category: Category) => void
}

const CATEGORIES: Category[] = ['BBVA', 'SUPERVIELLE', 'PRESTAMO', 'OTROS']

export const CategoryPicker = ({ value, onChange }: CategoryPickerProps) => (
  <div className="flex flex-col gap-1.5 w-full">
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoría</span>
    <div className="grid grid-cols-2 gap-2">
      {CATEGORIES.map(category => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          aria-pressed={value === category}
          className={[
            'px-3 py-2.5 text-sm font-medium border-b-2 transition-colors',
            value === category
              ? 'bg-primary text-white border-b-primary'
              : 'bg-surface-container-low text-gray-700 border-b-transparent hover:border-b-primary',
          ].join(' ')}
        >
          {CATEGORY_LABELS[category]}
        </button>
      ))}
    </div>
  </div>
)
