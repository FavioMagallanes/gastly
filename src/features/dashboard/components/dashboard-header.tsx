import { Icon } from '../../../shared/ui/icon'
import { ThemeToggle } from '../../../shared/ui/theme-toggle'

type DashboardHeaderProps = {
  currentMonthLabel: string
  nextMonthLabel: string
  isPlannedPanelOpen: boolean
  onTogglePlannedPanel: () => void
  onToggleReportsPanel: () => void
  onSignOut: () => void
}

export const DashboardHeader = ({
  currentMonthLabel,
  nextMonthLabel,
  isPlannedPanelOpen,
  onTogglePlannedPanel,
  onToggleReportsPanel,
  onSignOut,
}: DashboardHeaderProps) => {
  return (
    <header>
      <div className="flex items-start justify-between">
        <div className="flex-col items-center mb-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-[0.15em] leading-none text-ds-text dark:text-dark-text uppercase">
            Gastly<span className="text-primary">.</span>
          </h1>
          <div className="flex items-center gap-1.5 text-ds-secondary dark:text-dark-secondary text-[12px] tracking-wide uppercase mt-2 font-medium">
            <Icon name="calendar" size="sm" />
            {currentMonthLabel}
          </div>
        </div>
        <div className="flex items-center gap-1 mt-0.5 md:mt-2">
          <button
            type="button"
            aria-label={`Plan para ${nextMonthLabel}`}
            onClick={onTogglePlannedPanel}
            className={`size-8 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isPlannedPanelOpen
                ? 'bg-primary/15 text-primary'
                : 'text-ds-secondary dark:text-dark-secondary hover:bg-surface dark:hover:bg-dark-hover hover:text-ds-text dark:hover:text-dark-text'
            }`}
          >
            <Icon name="calendar-check" size="xl" />
          </button>
          <button
            type="button"
            aria-label="Ver reportes anteriores"
            onClick={onToggleReportsPanel}
            className="size-8 inline-flex items-center justify-center rounded-lg text-ds-secondary dark:text-dark-secondary hover:bg-surface dark:hover:bg-dark-hover hover:text-ds-text dark:hover:text-dark-text transition-colors cursor-pointer"
          >
            <Icon name="archive" size="xl" />
          </button>
          <ThemeToggle />
          <button
            type="button"
            aria-label="Cerrar sesión"
            onClick={onSignOut}
            className="size-8 inline-flex items-center justify-center rounded-lg text-ds-secondary dark:text-dark-secondary hover:bg-surface dark:hover:bg-dark-hover hover:text-danger transition-colors cursor-pointer"
          >
            <Icon name="logout" size="xl" />
          </button>
        </div>
      </div>
    </header>
  )
}
