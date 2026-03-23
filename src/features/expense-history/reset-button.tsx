import { useState } from 'react'

interface ResetButtonProps {
  onConfirm: () => void
}

export const ResetButton = ({ onConfirm }: ResetButtonProps) => {
  const [isPending, setIsPending] = useState(false)

  const handleFirstClick = () => setIsPending(true)
  const handleCancel = () => setIsPending(false)
  const handleConfirm = () => {
    setIsPending(false)
    onConfirm()
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-2 p-3 bg-surface-container-low border-b border-red-200">
        <p className="text-xs text-red-600 font-medium">
          ⚠ Se borrarán todos los gastos y el presupuesto. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Sí, borrar todo
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 text-xs font-medium bg-surface-container-low text-gray-600 border-b border-gray-300 hover:border-gray-500 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleFirstClick}
      className="text-xs text-gray-400 hover:text-red-500 transition-colors underline-offset-2 hover:underline"
    >
      Reiniciar todo
    </button>
  )
}
