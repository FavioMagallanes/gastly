import { useState } from 'react'
import { useAuth } from '../context/auth-context'
import { Button } from '../../../shared/ui/button'
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
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden px-6 md:px-8">
      <div
        className={[
          'relative flex w-full max-w-sm flex-col justify-between p-6 md:p-8 border border-[#232329] bg-[radial-gradient(50%_80%_at_20%_0%,#232329_0%,transparent_100%)]',
          'dark:bg-[radial-gradient(50%_80%_at_20%_0%,#232329_0%,transparent_100%)]',
        ].join(' ')}
      >
        {/* Bordes absolutos */}
        <div className="absolute -inset-y-6 -left-px w-px bg-[#3f3f46]" />
        <div className="absolute -inset-y-6 -right-px w-px bg-[#3f3f46]" />
        <div className="absolute -inset-x-6 -top-px h-px bg-[#3f3f46]" />
        <div className="absolute -inset-x-6 -bottom-px h-px bg-[#3f3f46]" />

        {/* + esquina superior izquierda */}
        <div className="absolute left-0 top-0 -translate-x-px -translate-y-3 w-px h-6 bg-[#a1a1aa]" />
        <div className="absolute left-0 top-0 -translate-x-3 -translate-y-px h-px w-6 bg-[#a1a1aa]" />
        {/* + esquina inferior derecha */}
        <div className="absolute right-0 bottom-0 translate-x-px translate-y-3 w-px h-6 bg-[#a1a1aa]" />
        <div className="absolute right-0 bottom-0 translate-x-3 translate-y-px h-px w-6 bg-[#a1a1aa]" />

        <div className="w-full max-w-sm animate-in space-y-8">
          <div className="flex flex-col space-y-1 items-center">
            <h1 className="font-bold text-2xl tracking-wide text-white">Gastly</h1>
            <p className="text-base text-[#b3b3c0]">
              {isLogin ? 'Iniciá sesión para continuar' : 'Creá tu cuenta para empezar'}
            </p>
          </div>
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[13px] font-medium text-[#e5e5ee] mb-2"
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
                  className="w-full h-12 px-4 rounded-lg border border-[#232329] bg-[#232329] text-[#e5e5ee] placeholder:text-[#b3b3c0] text-[15px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-[13px] font-medium text-[#e5e5ee] mb-2"
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
                  className="w-full h-12 px-4 rounded-lg border border-[#232329] bg-[#232329] text-[#e5e5ee] placeholder:text-[#b3b3c0] text-[15px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
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
      </div>
    </div>
  )
}
