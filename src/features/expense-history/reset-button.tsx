import { toast } from 'sonner'
import { Button } from '../../shared/ui/button'

interface ResetButtonProps {
  onConfirm: () => void
}

export const ResetButton = ({ onConfirm }: ResetButtonProps) => {
  const handleClick = () => {
    toast.custom(
      id => (
        <div className="w-89 bg-white rounded-xl shadow-lg border border-ds-border p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-ds-text">¿Borrar todos los datos?</p>
            <p className="text-xs text-ds-secondary mt-1">Esta acción no se puede deshacer.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(id)}
              className="flex-1 h-9 text-[13px] font-medium text-ds-secondary border border-ds-border rounded-lg hover:bg-surface transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(id)
                onConfirm()
                toast.success('Todos los datos fueron eliminados')
              }}
              className="flex-1 h-9 text-[13px] font-semibold text-white bg-ds-text rounded-lg hover:bg-ds-text/90 transition-colors cursor-pointer"
            >
              Borrar todo
            </button>
          </div>
        </div>
      ),
      { duration: 10000 },
    )
  }

  return (
    <Button variant="ghost" size="sm" leadingIcon="clean" onClick={handleClick}>
      Reiniciar todo
    </Button>
  )
}
