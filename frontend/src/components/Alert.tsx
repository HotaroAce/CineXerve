type Props = {
  message: string
  variant?: 'info' | 'success' | 'error'
}

export default function Alert({ message, variant = 'info' }: Props) {
  const cls =
    variant === 'success'
      ? 'bg-emerald-800 text-emerald-100'
      : variant === 'error'
      ? 'bg-red-800 text-red-100'
      : 'bg-neutral-800 text-neutral-200'
  return <div className={`rounded p-2 text-sm ${cls}`}>{message}</div>
}
