import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { fetchTimeseries, fetchDates } from '../api'

const fmt = (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : v

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      padding: '10px 14px', borderRadius: 2, fontFamily: 'DM Mono, monospace', fontSize: 12,
    }}>
      <div style={{ color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{fmt(payload[0].value)} tiendas</div>
    </div>
  )
}

export default function TimeseriesChart() {
  const [data, setData] = useState([])
  const [dates, setDates] = useState([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDates().then(d => {
      setDates(d.dates)
      setSelected(d.dates[3] || d.dates[0]) 
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    fetchTimeseries(selected).then(d => {
      const formatted = d.map(p => ({
        ...p,
        time: p.timestamp.slice(11, 16),
      }))
      setData(formatted)
      setLoading(false)
    })
  }, [selected])

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>
            Serie de tiempo — Tiendas online en un dia específico
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Cantidad de tiendas disponibles vs hora</div>
        </div>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--text)', padding: '6px 12px', borderRadius: 2,
            fontFamily: 'DM Mono, monospace', fontSize: 12, cursor: 'pointer',
          }}
        >
          {dates.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
          Cargando datos...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4f00" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ff4f00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" stroke="var(--muted)" tick={{ fontFamily: 'DM Mono, monospace', fontSize: 10 }} tickLine={false} interval={59} />
            <YAxis stroke="var(--muted)" tick={{ fontFamily: 'DM Mono, monospace', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={fmt} width={55} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke="#ff4f00" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
