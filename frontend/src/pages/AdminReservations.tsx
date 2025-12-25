import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import Button from '../components/Button'
import Card from '../components/Card'
import Table from '../components/Table'

type Reservation = {
  id: number
  userName: string
  seatNumber: string
  createdAt: string
  showtimeId: number
  movieTitle: string
  cinema: string
  datetime: string
}

export default function AdminReservations() {
  const [items, setItems] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [date, setDate] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<keyof Reservation>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  useEffect(() => {
    api.get('/reservations').then((r) => setItems(r.data)).finally(() => setLoading(false))
  }, [])

  async function cancel(id: number) {
    const ok = window.confirm('Cancel this reservation?')
    if (!ok) return
    const r = await api.delete(`/cancel/${id}`).catch((e) => e.response)
    if (r?.status === 200) {
      setItems((prev) => prev.filter((x) => x.id !== id))
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const d = date ? new Date(date) : null
    return items.filter((b) => {
      const matchQ =
        !q ||
        b.userName.toLowerCase().includes(q) ||
        b.movieTitle.toLowerCase().includes(q) ||
        b.cinema.toLowerCase().includes(q) ||
        b.seatNumber.toLowerCase().includes(q)
      const matchD = d
        ? (() => {
            const bd = new Date(b.datetime)
            return (
              bd.getFullYear() === d.getFullYear() &&
              bd.getMonth() === d.getMonth() &&
              bd.getDate() === d.getDate()
            )
          })()
        : true
      return matchQ && matchD
    })
  }, [items, query, date])
  const sorted = useMemo(() => {
    const arr = filtered.slice()
    arr.sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      let cmp = 0
      if (sortKey === 'createdAt' || sortKey === 'datetime') {
        cmp = new Date(va as string).getTime() - new Date(vb as string).getTime()
      } else {
        cmp = String(va).localeCompare(String(vb))
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [filtered, sortKey, sortDir])
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])
  function handleSort(key: keyof Reservation) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Reservations</h2>
      <div className="flex flex-wrap gap-3">
        <a className="underline" href="/admin/add-movie">Add Movie</a>
        <a className="underline" href="/admin/add-showtime">Add Showtime</a>
      </div>
      <Card className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            className="p-2 rounded bg-neutral-800 text-sm md:col-span-2"
            placeholder="Search user, movie, cinema, or seat"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
          />
          <input
            type="date"
            className="p-2 rounded bg-neutral-800 text-sm"
            value={date ?? ''}
            onChange={(e) => {
              setDate(e.target.value || null)
              setPage(1)
            }}
          />
          <div className="flex gap-2">
            <button
              className="text-sm px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
              onClick={() => {
                setQuery('')
                setDate(null)
                setPage(1)
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <Table
          columns={[
            { key: 'movieTitle', label: 'Movie', sortable: true },
            { key: 'datetime', label: 'Showtime', sortable: true, render: (r) => new Date(r.datetime).toLocaleString() },
            { key: 'cinema', label: 'Cinema', sortable: true },
            { key: 'userName', label: 'User', sortable: true },
            { key: 'seatNumber', label: 'Seat', sortable: true },
            { key: 'createdAt', label: 'Created', sortable: true, render: (r) => new Date(r.createdAt).toLocaleString() },
            { key: 'id', label: 'Actions', render: (r) => <Button variant="danger" onClick={() => cancel(r.id)}>Cancel</Button> },
          ]}
          data={paged}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
        <div className="flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            Page {page} of {totalPages} • {sorted.length} results
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-400">Rows</label>
            <select
              className="px-2 py-1 rounded bg-neutral-800 text-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
      {loading && <div className="text-sm text-neutral-400">Loading…</div>}
    </div>
  )
}
