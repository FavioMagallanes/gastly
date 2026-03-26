import { useState } from 'react'
import { useAuth } from '../context/auth-context'
import { Button } from '../../../shared/ui/button'
import { toast } from 'sonner'
import { useTheme } from '../../../shared/hooks/use-theme'

type AuthMode = 'login' | 'signup'

export const AuthScreen = () => {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { isDark } = useTheme()

  const isLogin = mode === 'login'

  // Clases condicionales según tema
  const cardBase =
    'relative flex w-full max-w-sm flex-col justify-between p-6 md:p-8 border rounded-none shadow-sm'
  const cardTheme = isDark
    ? 'bg-dark-surface border-dark-border text-dark-text'
    : 'bg-white border-gray-200 text-gray-900'
  const labelClass = isDark
    ? 'block text-[11px] font-semibold text-dark-secondary uppercase tracking-widest mb-1.5'
    : 'block text-[11px] font-semibold text-ds-secondary uppercase tracking-widest mb-1.5'
  const inputClass = isDark
    ? 'w-full h-11 px-3 rounded-none border bg-dark-surface text-dark-text placeholder:text-dark-secondary/50 outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all border-dark-border text-sm font-medium'
    : 'w-full h-11 px-3 rounded-none border bg-surface text-ds-text placeholder:text-ds-secondary/50 outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all border-ds-border text-sm font-medium'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.warning('Completá todos los campos')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.warning('Ingresá un email válido')
      return
    }

    if (password.length < 6) {
      toast.warning('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    const error = isLogin ? await signIn(email, password) : await signUp(email, password)
    setLoading(false)

    if (error) {
      toast.error(error)
    } else if (!isLogin) {
      toast.success('¡Cuenta creada! Revisá tu email para confirmar.')
    }
  }

  const toggleMode = () => {
    setMode(m => (m === 'login' ? 'signup' : 'login'))
    setEmail('')
    setPassword('')
  }

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden px-6 md:px-8">
      <div className={[cardBase, cardTheme].join(' ')}>
        {/* Bordes absolutos decorativos (líneas largas) */}
        <div className="absolute -inset-y-6 -left-px w-px bg-ds-border dark:bg-dark-border" />
        <div className="absolute -inset-y-6 -right-px w-px bg-ds-border dark:bg-dark-border" />
        <div className="absolute -inset-x-6 -top-px h-px bg-ds-border dark:bg-dark-border" />
        <div className="absolute -inset-x-6 -bottom-px h-px bg-ds-border dark:bg-dark-border" />

        <div className="w-full max-w-sm animate-in space-y-8">
          <div className="flex flex-col space-y-1 items-center">
            <h1 className="font-bold text-2xl tracking-wide text-ds-text dark:text-dark-text">
              Gastly
            </h1>
            <p className="text-base text-ds-secondary dark:text-dark-secondary">
              {isLogin ? 'Iniciá sesión para continuar' : 'Creá tu cuenta para empezar'}
            </p>
          </div>
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  autoFocus
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="password" className={labelClass}>
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className={inputClass}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                className="mt-4"
              >
                {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
              </Button>
            </form>
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:underline underline-offset-2 font-medium cursor-pointer text-[13px]"
              >
                {isLogin ? '¿No tenés cuenta? Crear cuenta' : '¿Ya tenés cuenta? Iniciar sesión'}
              </button>
            </div>
          </div>
        </div>

        {/* Capa decorativa superior: Cruces de esquinas (Contraste dinámico) */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* + esquina superior izquierda */}
          <div className="absolute left-0 top-0 -translate-x-px -translate-y-3 w-px h-6 bg-[#a1a1aa] dark:bg-white" />
          <div className="absolute left-0 top-0 -translate-x-3 -translate-y-px h-px w-6 bg-[#a1a1aa] dark:bg-white" />

          {/* + esquina inferior derecha */}
          <div className="absolute right-0 bottom-0 translate-x-px translate-y-3 w-px h-6 bg-[#a1a1aa] dark:bg-white" />
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-px h-px w-6 bg-[#a1a1aa] dark:bg-white" />
        </div>
      </div>
    </div>
  )
}
