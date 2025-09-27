import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Credit = {
  unic_id: string
  project_name: string
  vintage: number
  status: 'Active' | 'Retired'
}

function StatusBadge({ status }: { status: Credit['status'] }) {
  const color = status === 'Active' ? '#16a34a' : '#6b7280'
  const bg = status === 'Active' ? 'rgba(22,163,74,0.1)' : 'rgba(107,114,128,0.15)'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        color,
        backgroundColor: bg,
        border: `1px solid ${color}20`,
      }}
    >
      {status}
    </span>
  )
}

function App() {
  const [credits, setCredits] = useState<Credit[]>([])
  const [query, setQuery] = useState('')
  const [year, setYear] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Credit | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}credits.json`)
        if (!res.ok) throw new Error('Failed to load credits.json')
        const data: Credit[] = await res.json()
        setCredits(data)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return credits.filter((c) => {
      const matchesText = q
        ? c.project_name.toLowerCase().includes(q) || c.unic_id.toLowerCase().includes(q)
        : true
      const matchesYear = year ? String(c.vintage) === year : true
      return matchesText && matchesYear
    })
  }, [credits, query, year])

  const vintages = useMemo(() => {
    const set = new Set(credits.map((c) => c.vintage))
    return Array.from(set).sort((a, b) => b - a)
  }, [credits])

  const downloadCertificate = (credit: Credit) => {
    const timestamp = new Date().toISOString()
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Retirement Certificate - ${credit.unic_id}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
      .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; max-width: 720px; }
      h1 { margin: 0 0 12px; font-size: 24px; }
      .meta { display: grid; grid-template-columns: 180px 1fr; row-gap: 8px; column-gap: 12px; }
      .label { color: #6b7280; }
      .value { font-weight: 600; }
      .footer { margin-top: 16px; color: #6b7280; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Carbon Credit Retirement Certificate</h1>
      <div class="meta">
        <div class="label">UNIC ID</div><div class="value">${credit.unic_id}</div>
        <div class="label">Project Name</div><div class="value">${credit.project_name}</div>
        <div class="label">Vintage</div><div class="value">${credit.vintage}</div>
        <div class="label">Status</div><div class="value">${credit.status}</div>
        <div class="label">Timestamp</div><div class="value">${timestamp}</div>
      </div>
      <div class="footer">This certificate attests that the above credit details were exported from Offset Dashboard.</div>
    </div>
  </body>
</html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `retirement-certificate-${credit.unic_id}.html`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <h1 style={{ marginBottom: 16 }}>Offset Credits</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by project name or UNIC ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            minWidth: 280,
          }}
        />
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
        >
          <option value="">All Vintages</option>
          {vintages.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading && <div>Loading credits…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f9fafb' }}>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>UNIC ID</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>Project</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>Vintage</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.unic_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{c.unic_id}</td>
                  <td style={{ padding: 12 }}>{c.project_name}</td>
                  <td style={{ padding: 12 }}>{c.vintage}</td>
                  <td style={{ padding: 12 }}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ padding: 12, display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setSelected(c)}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white' }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => downloadCertificate(c)}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #10b981', background: '#10b981', color: 'white' }}
                    >
                      Download Retirement Certificate
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td style={{ padding: 20, color: '#6b7280' }} colSpan={5}>No credits found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'white', borderRadius: 12, maxWidth: 640, width: '100%', padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Credit Details</h2>
              <button onClick={() => setSelected(null)} style={{ border: 'none', background: 'transparent', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 8, columnGap: 12 }}>
              <div style={{ color: '#6b7280' }}>UNIC ID</div><div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{selected.unic_id}</div>
              <div style={{ color: '#6b7280' }}>Project Name</div><div>{selected.project_name}</div>
              <div style={{ color: '#6b7280' }}>Vintage</div><div>{selected.vintage}</div>
              <div style={{ color: '#6b7280' }}>Status</div><div><StatusBadge status={selected.status} /></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button
                onClick={() => downloadCertificate(selected)}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #10b981', background: '#10b981', color: 'white' }}
              >
                Download Retirement Certificate
              </button>
              <button onClick={() => setSelected(null)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
