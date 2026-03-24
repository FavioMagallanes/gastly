import { useTheme } from '../hooks/use-theme'
import { Icon } from './icon'

/**
 * ThemeToggle — Botón que alterna entre light y dark mode.
 * Muestra sol en dark mode (para cambiar a light) y luna en light mode (para cambiar a dark).
 */
export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={toggleTheme}
      className="size-8 inline-flex items-center justify-center rounded-lg text-ds-secondary dark:text-dark-secondary hover:bg-surface dark:hover:bg-dark-hover hover:text-ds-text dark:hover:text-dark-text transition-colors cursor-pointer"
    >
      <Icon name={isDark ? 'sun' : 'moon'} size="xl" />
    </button>
  )
}
