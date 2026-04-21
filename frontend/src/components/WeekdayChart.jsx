import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fetchByWeekday } from '../api'

const LABELS = { Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mié', Thursday: 'Jue', Friday: 'Vie', Saturday: 'Sáb', Sunday: 'Dom' }
const fmt = (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 2, fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
      <div style={{ color: 'var(--muted)', marginBottom: 2 }}>{payload[0].payload.label}</div>
      <div style={{ color: 'var(--accent2)', fontWeight: 700 }}>{fmt(payload[0].value)} tiendas</div>
    </div>
  )
}

export default function WeekdayChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetchByWeekday().then(d => setData(d.map(r => ({ ...r, label: LABELS[r.weekday] || r.weekday }))))
  }, [])

  const max = Math.max(...data.map(d => d.avg_stores))

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2, padding: 20, height: '100%' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>Comparativa</div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Por día de semana</div>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <XAxis type="number" stroke="var(--muted)" tick={{ fontFamily: 'DM Mono, monospace', fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={fmt} />
          <YAxis type="category" dataKey="label" stroke="var(--muted)" tick={{ fontFamily: 'DM Mono, monospace', fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,79,0,0.06)' }} />
          <Bar dataKey="avg_stores" radius={[0, 2, 2, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.avg_stores === max ? '#ff4f00' : '#e2e2e6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
