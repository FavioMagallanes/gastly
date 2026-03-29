import { Toaster } from 'sonner'
import type { Theme } from '../hooks/use-theme'

type AppToasterProps = {
  theme: Theme
}

export const AppToaster = ({ theme }: AppToasterProps) => (
  <Toaster
    position="bottom-right"
    richColors
    theme={theme}
    toastOptions={{
      style: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '13px',
      },
    }}
  />
)
