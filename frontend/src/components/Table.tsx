import { ReactNode } from 'react'

type Column<T> = {
  key: keyof T
  label: string
  render?: (row: T) => ReactNode
  sortable?: boolean
}

type Props<T> = {
  columns: Column<T>[]
  data: T[]
  sortKey?: keyof T | null
  sortDir?: 'asc' | 'desc'
  onSort?: (key: keyof T) => void
  className?: string
}

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  sortKey = null,
  sortDir = 'asc',
  onSort,
  className = '',
}: Props<T>) {
  return (
    <div className={`overflow-x-auto rounded border border-neutral-800 ${className}`}>
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-900/40">
          <tr>
            {columns.map((c) => (
              <th
                key={String(c.key)}
                className="text-left px-3 py-2 font-medium"
              >
                {c.sortable && onSort ? (
                  <button
                    className="inline-flex items-center gap-2 hover:text-white"
                    onClick={() => onSort(c.key)}
                  >
                    <span>{c.label}</span>
                    {sortKey === c.key && (
                      <span className="text-xs px-1 rounded bg-neutral-800">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                ) : (
                  <span>{c.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-neutral-800">
              {columns.map((c) => (
                <td key={String(c.key)} className="px-3 py-2">
                  {c.render ? c.render(row) : String(row[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td className="px-3 py-3 text-neutral-400" colSpan={columns.length}>No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
