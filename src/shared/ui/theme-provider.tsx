import { ThemeContext, useThemeProvider } from '../hooks/use-theme'

/**
 * ThemeProvider — Provee el contexto de tema a toda la app.
 * Se usa una sola vez en App.tsx para centralizar el estado.
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useThemeProvider()
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
