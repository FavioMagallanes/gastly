import { QueryClientProvider } from '@tanstack/react-query'
import { useExpenseStore } from './store/expense-store'
import { Dashboard } from './features/dashboard'
import { NewExpenseModal, EditExpenseModal } from './features/expenses'
import { AuthProvider, AuthScreen, useAuth } from './features/auth'
import { ThemeProvider } from './shared/ui/theme-provider'
import { queryClient } from './shared/query/query-client'
import { useTheme } from './shared/hooks/use-theme'
import { Spinner } from './shared/ui/spinner'
import { AppToaster } from './shared/ui/app-toaster'

const AppContent = () => {
  const { user, loading } = useAuth()
  const isModalOpen = useExpenseStore(state => state.isModalOpen)
  const editingExpense = useExpenseStore(state => state.editingExpense)
  const { theme } = useTheme()

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center transition-colors">
        <Spinner className="text-ds-secondary dark:text-dark-secondary" />
      </div>
    )
  }

  return (
    <>
      {!user ? (
        <AuthScreen />
      ) : (
        <div className="min-h-screen bg-white dark:bg-dark-bg transition-colors">
          <Dashboard />

          {isModalOpen && (
            <>{editingExpense ? <EditExpenseModal /> : <NewExpenseModal />}</>
          )}
        </div>
      )}
      <AppToaster theme={theme} />
    </>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

export default App
