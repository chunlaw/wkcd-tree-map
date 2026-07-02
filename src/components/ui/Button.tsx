import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  /** Font Awesome icon class, e.g. "fa-ruler". */
  icon?: string
  children?: ReactNode
}

/** Shared button primitive (uses the .btn / .btn-* classes). */
export default function Button({
  variant = 'primary',
  icon,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...rest}>
      {icon ? (
        <>
          <i className={`fas ${icon}`} /> {children}
        </>
      ) : (
        children
      )}
    </button>
  )
}
