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

/**
 * Verifica si el navegador soporta compartir archivos via Web Share API.
 */
const canShareFile = (file: File): boolean =>
  typeof navigator.share === 'function' &&
  typeof navigator.canShare === 'function' &&
  navigator.canShare({ files: [file] })

/**
 * Comparte un PDF usando la Web Share API nativa.
 * Si el navegador no soporta compartir archivos, descarga directamente.
 */
export const shareReport = async (blob: Blob, filename: string): Promise<void> => {
  const file = new File([blob], filename, { type: 'application/pdf' })

  if (canShareFile(file)) {
    await navigator.share({
      title: filename.replace('.pdf', ''),
      files: [file],
    })
  } else {
    // Fallback: descarga directa en navegadores sin soporte
    downloadBlob(blob, filename)
  }
}

/**
 * Descarga un PDF directamente.
 */
export const downloadReport = (blob: Blob, filename: string): void => {
  downloadBlob(blob, filename)
}
