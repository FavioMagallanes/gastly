import { forwardRef } from 'react'

type FormFieldProps = {
  label: string
  error?: string
  children: React.ReactNode
}

export const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-ds-secondary dark:text-dark-secondary uppercase tracking-widest">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

type FormTextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  prefix?: string
}

export const FormTextInput = forwardRef<HTMLInputElement, FormTextInputProps>(
  ({ error, prefix, ...props }, ref) => (
    <div
      className={`flex items-center border rounded-lg bg-surface dark:bg-dark-surface px-3 py-2.5 transition-all focus-within:ring-1 focus-within:ring-primary/50 ${error ? 'border-red-400' : 'border-ds-border dark:border-dark-border'}`}
    >
      {prefix && (
        <span className="text-ds-secondary dark:text-dark-secondary mr-2 text-sm shrink-0">
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        {...props}
        className="w-full bg-transparent border-none p-0 outline-none text-ds-text dark:text-dark-text font-medium text-sm placeholder:text-ds-secondary/60 dark:placeholder:text-dark-secondary/60 placeholder:font-normal"
      />
    </div>
  ),
)
FormTextInput.displayName = 'FormTextInput'
