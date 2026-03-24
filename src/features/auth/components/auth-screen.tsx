import { useState } from 'react'
import { useAuth } from '../context/auth-context'
import { Button } from '../../../shared/ui/button'
import { Icon } from '../../../shared/ui/icon'
import { toast } from 'sonner'

type AuthMode = 'login' | 'signup'

export const AuthScreen = () => {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

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
    <main className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center transition-colors">
      <div className="w-full max-w-sm px-6">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 mb-4">
            <Icon name="receipt-dollar" size="2xl" className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-ds-text dark:text-dark-text">
            Control de Presupuesto
          </h1>
          <p className="text-ds-secondary dark:text-dark-secondary text-[13px] mt-1">
            {isLogin ? 'Iniciá sesión para continuar' : 'Creá tu cuenta para empezar'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[13px] font-medium text-ds-text dark:text-dark-text mb-1.5"
            >
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
              className="w-full h-10 px-3 rounded-lg border border-ds-border dark:border-dark-border bg-white dark:bg-dark-surface text-ds-text dark:text-dark-text placeholder:text-ds-secondary/50 dark:placeholder:text-dark-secondary/50 text-[14px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[13px] font-medium text-ds-text dark:text-dark-text mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="w-full h-10 px-3 rounded-lg border border-ds-border dark:border-dark-border bg-white dark:bg-dark-surface text-ds-text dark:text-dark-text placeholder:text-ds-secondary/50 dark:placeholder:text-dark-secondary/50 text-[14px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            className="mt-2"
          >
            {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </Button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-[13px] text-ds-secondary dark:text-dark-secondary mt-6">
          {isLogin ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="text-primary hover:underline underline-offset-2 font-medium cursor-pointer"
          >
            {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </p>
      </div>
    </main>
  )
}
