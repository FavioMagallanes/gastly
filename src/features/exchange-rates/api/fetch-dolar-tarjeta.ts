const DOLAR_TARJETA_URL = 'https://dolarapi.com/v1/dolares/tarjeta'

export type DolarTarjetaQuote = {
  moneda: string
  casa: string
  nombre: string
  compra: number
  venta: number
  fechaActualizacion: string
}

export const fetchDolarTarjeta = async (): Promise<DolarTarjetaQuote> => {
  const res = await fetch(DOLAR_TARJETA_URL)
  if (!res.ok) {
    throw new Error(`DolarApi: ${res.status}`)
  }
  return res.json() as Promise<DolarTarjetaQuote>
}
