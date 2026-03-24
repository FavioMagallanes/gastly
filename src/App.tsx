import { useExpenseStore } from './store/expense-store'
import { Dashboard } from './features/dashboard'
import { NewExpenseModal, EditExpenseModal } from './features/expenses'
import { AuthProvider, AuthScreen, useAuth } from './features/auth'
import { Button } from './shared/ui/button'
import { ThemeProvider } from './shared/ui/theme-provider'
import { useTheme } from './shared/hooks/use-theme'
import { Toaster } from 'sonner'

const AppContent = () => {
  const { user, loading } = useAuth()
  const isModalOpen = useExpenseStore(s => s.isModalOpen)
  const editingExpense = useExpenseStore(s => s.editingExpense)
  const openModal = useExpenseStore(s => s.openModal)
  const { theme } = useTheme()

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center transition-colors">
        <div className="text-ds-secondary dark:text-dark-secondary text-[13px]">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <AuthScreen />
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
      </>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg transition-colors">
      <Dashboard />

      {/* FAB — solo visible en mobile, en desktop el botón está inline */}
      <Button
        variant="primary"
        size="lg"
        aria-label="Nuevo gasto"
        onClick={openModal}
        className="md:hidden fixed bottom-6 right-6 size-14! rounded-full! shadow-lg hover:scale-105 active:scale-95 transition-transform z-40"
        leadingIcon="add"
      />

      {isModalOpen && !editingExpense && <NewExpenseModal />}
      <EditExpenseModal />

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
    </div>
  )
}

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ThemeProvider>
)

export default App
