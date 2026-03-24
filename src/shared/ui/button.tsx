import { forwardRef } from 'react'
import { Icon } from './icon'

/* ─── Variants ───────────────────────────────────────────────────────── */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

/* ─── Style maps ─────────────────────────────────────────────────────── */

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
  secondary:
    'bg-transparent border border-ds-border dark:border-dark-border text-ds-text dark:text-dark-text hover:bg-surface dark:hover:bg-dark-hover',
  ghost:
    'bg-transparent text-ds-secondary dark:text-dark-secondary hover:bg-surface dark:hover:bg-dark-hover hover:text-ds-text dark:hover:text-dark-text',
  danger: 'bg-danger text-white hover:bg-danger-hover shadow-sm',
  link: 'bg-transparent text-primary hover:underline underline-offset-2 px-0! py-0! rounded-none! h-auto!',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-[13px] gap-1.5',
  lg: 'h-10 px-5 text-sm gap-2',
  icon: 'size-8 p-0 justify-center',
}

/* ─── Props ──────────────────────────────────────────────────────────── */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Full-width button */
  fullWidth?: boolean
  /** Hugeicon name placed before children */
  leadingIcon?: string
  /** Hugeicon name placed after children */
  trailingIcon?: string
}

/* ─── Component ──────────────────────────────────────────────────────── */

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

    return (
      <button
        ref={ref}
        className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {leadingIcon && <Icon name={leadingIcon} size="base" />}
        {children}
        {trailingIcon && <Icon name={trailingIcon} size="base" />}
      </button>
    )
  },
)

Button.displayName = 'Button'
