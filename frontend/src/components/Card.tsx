import { ReactNode } from 'react'

export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded border border-neutral-800 bg-neutral-900/40 shadow-sm p-4 transition-all duration-200 hover:shadow-md animate-fade-up ${className}`}>
      {children}
    </div>
  )
}
