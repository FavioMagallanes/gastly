import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import {
  ReceiptDollarIcon,
  Cancel01Icon,
  Calendar01Icon,
  PencilEdit01Icon,
  PencilEdit02Icon,
  Delete02Icon,
  Add01Icon,
  Alert02Icon,
  InformationCircleIcon,
  CreditCardIcon,
  Payment01Icon,
  Money01Icon,
  ArrowUp02Icon,
  ArrowDown02Icon,
  UnfoldMoreIcon,
  Tick02Icon,
  CleanIcon,
} from '@hugeicons/core-free-icons'

/* ─── Icon registry ──────────────────────────────────────────────────── */

const iconMap: Record<string, IconSvgElement> = {
  'receipt-dollar': ReceiptDollarIcon,
  cancel: Cancel01Icon,
  close: Cancel01Icon,
  calendar: Calendar01Icon,
  pencil: PencilEdit01Icon,
  'pencil-edit': PencilEdit02Icon,
  edit: PencilEdit02Icon,
  delete: Delete02Icon,
  add: Add01Icon,
  alert: Alert02Icon,
  info: InformationCircleIcon,
  'credit-card': CreditCardIcon,
  payment: Payment01Icon,
  money: Money01Icon,
  'trending-up': ArrowUp02Icon,
  'trending-down': ArrowDown02Icon,
  'unfold-more': UnfoldMoreIcon,
  unfold: UnfoldMoreIcon,
  check: Tick02Icon,
  clean: CleanIcon,
}

/* ─── Sizes ──────────────────────────────────────────────────────────── */

type IconSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '4xl'

const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '4xl': 36,
}

/* ─── Props ──────────────────────────────────────────────────────────── */

interface IconProps {
  /** Icon name from the registry */
  name: keyof typeof iconMap
  /** Icon size preset */
  size?: IconSize
  /** Stroke width (default 1.5) */
  strokeWidth?: number
  className?: string
}

/* ─── Component ──────────────────────────────────────────────────────── */

/**
 * Icon — Wrapper consistente para Hugeicons (free stroke-rounded).
 * Usa `color: currentColor` por defecto, así hereda el color del padre.
 * `shrink-0` previene que se comprima en flex. `leading-none` para alineación.
 */
export const Icon = ({ name, size = 'xl', strokeWidth = 1.5, className = '' }: IconProps) => {
  const iconDef = iconMap[name]
  if (!iconDef) return null

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 leading-none ${className}`}
      aria-hidden="true"
    >
      <HugeiconsIcon
        icon={iconDef}
        size={sizeMap[size]}
        color="currentColor"
        strokeWidth={strokeWidth}
      />
    </span>
  )
}
