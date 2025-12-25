import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}

export default function Button({ children, variant = 'primary', disabled, onClick, className = '', type = 'button' }: Props) {
  const base = 'px-4 py-2 rounded transition-all duration-300 transform shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60'
  const styles =
    variant === 'secondary'
      ? 'bg-neutral-700 hover:bg-neutral-600'
      : variant === 'danger'
      ? 'bg-red-600 hover:bg-red-500'
      : 'bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-500 text-white'
  const motion = 'hover:-translate-y-0.5 hover:shadow-md active:scale-95'
  const disabledCls = disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles} ${motion} ${disabledCls} ${className}`}>
      {children}
    </button>
  )
}
