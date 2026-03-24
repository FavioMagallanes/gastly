import { toast } from 'sonner'
import { confirmToast } from '../../../shared/ui/confirm-toast'
import { Button } from '../../../shared/ui/button'

interface ResetButtonProps {
  onConfirm: () => void
}

export const ResetButton = ({ onConfirm }: ResetButtonProps) => {
  const handleClick = () => {
    confirmToast({
      title: '¿Borrar todos los datos?',
      confirmLabel: 'Borrar todo',
      variant: 'dark',
      onConfirm: () => {
        onConfirm()
        toast.success('Todos los datos fueron eliminados')
      },
    })
  }

  return (
    <Button variant="ghost" size="sm" leadingIcon="clean" onClick={handleClick}>
      Reiniciar todo
    </Button>
  )
}
