const DOLAR_TARJETA_URL = 'https://dolarapi.com/v1/dolares/tarjeta'

export type DolarTarjetaQuote = {
  moneda: string
  casa: string
  nombre: string
  compra: number
  venta: number
  fechaActualizacion: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === 'object'

const parseDolarTarjetaQuote = (raw: unknown): DolarTarjetaQuote => {
  if (!isRecord(raw)) {
    throw new Error('DolarApi: invalid JSON body')
  }
  const venta = raw.venta
  const compra = raw.compra
  if (typeof venta !== 'number' || Number.isNaN(venta) || venta <= 0) {
    throw new Error('DolarApi: invalid or missing venta')
  }
  if (typeof compra !== 'number' || Number.isNaN(compra) || compra <= 0) {
    throw new Error('DolarApi: invalid or missing compra')
  }
  return {
    moneda: typeof raw.moneda === 'string' ? raw.moneda : '',
    casa: typeof raw.casa === 'string' ? raw.casa : '',
    nombre: typeof raw.nombre === 'string' ? raw.nombre : '',
    compra,
    venta,
    fechaActualizacion:
      typeof raw.fechaActualizacion === 'string' ? raw.fechaActualizacion : '',
  }
}

/** GET público agregado; no se envían datos del usuario (constitución v2.2.0). */
export const fetchDolarTarjeta = async (): Promise<DolarTarjetaQuote> => {
  const res = await fetch(DOLAR_TARJETA_URL)
  if (!res.ok) {
    throw new Error(`DolarApi: ${res.status}`)
  }
  const json: unknown = await res.json()
  return parseDolarTarjetaQuote(json)
}

