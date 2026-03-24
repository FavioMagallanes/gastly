/**
 * Descarga un Blob como archivo en el navegador.
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const canShareFile = (file: File): boolean =>
  typeof navigator.share === 'function' &&
  typeof navigator.canShare === 'function' &&
  navigator.canShare({ files: [file] })

export type ShareResult = 'shared' | 'unsupported'

/**
 * Comparte un PDF usando la Web Share API nativa.
 * Si el navegador no soporta compartir archivos, retorna 'unsupported'
 * sin descargar (el usuario puede usar el botón "Descargar PDF" para eso).
 */
export const shareReport = async (blob: Blob, filename: string): Promise<ShareResult> => {
  const file = new File([blob], filename, { type: 'application/pdf' })

  if (canShareFile(file)) {
    await navigator.share({
      title: filename.replace('.pdf', ''),
      files: [file],
    })
    return 'shared'
  }

  return 'unsupported'
}

export const downloadReport = (blob: Blob, filename: string): void => {
  downloadBlob(blob, filename)
}
