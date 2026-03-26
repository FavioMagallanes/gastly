import { CATEGORIES } from '../../../types'
import type { Category } from '../../../types'

function renderOptions(categories: Category[], level = 0): React.ReactNode[] {
  return categories.flatMap(category => [
    <option key={category.id} value={category.id}>
      {`${'— '.repeat(level)}${category.label}`}
    </option>,
    ...(category.subcategories ? renderOptions(category.subcategories, level + 1) : []),
  ])
}

interface CategoryPickerProps {
  value: string // id de la categoría
  onChange: (categoryId: string) => void
}

export const CategoryPicker = ({ value, onChange }: CategoryPickerProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-[11px] font-semibold text-ds-secondary dark:text-dark-secondary uppercase tracking-widest">
        Categoría
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none border border-ds-border dark:border-dark-border rounded-none bg-surface dark:bg-dark-surface px-3 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-primary/50 cursor-pointer [&>option]:font-normal [&>option]:text-ds-text [&>option]:bg-white dark:[&>option]:text-dark-text dark:[&>option]:bg-dark-surface"
        >
          {renderOptions(CATEGORIES)}
        </select>
      </div>
    </div>
  )
}
