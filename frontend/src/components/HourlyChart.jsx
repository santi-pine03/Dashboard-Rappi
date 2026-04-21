import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fetchByHour } from '../api'

const fmt = (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      padding: '10px 14px', borderRadius: 2, fontFamily: 'DM Mono, monospace', fontSize: 12,
    }}>
      <div style={{ color: 'var(--muted)', marginBottom: 4 }}>{payload[0].payload.hour}:00 hs</div>
      <div style={{ color: 'var(--accent2)', fontWeight: 700 }}>{fmt(payload[0].value)} tiendas</div>
    </div>
  )
}

export default function HourlyChart() {
  const [data, setData] = useState([])

  useEffect(() => { fetchByHour().then(setData) }, [])

  const max = Math.max(...data.map(d => d.avg_stores))

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2, padding: 24 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>
        Patrón diario
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Promedio por hora del día</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="hour" stroke="var(--muted)" tick={{ fontFamily: 'DM Mono, monospace', fontSize: 10 }} tickLine={false} tickFormatter={h => `${h}h`} />
          <YAxis stroke="var(--muted)" tick={{ fontFamily: 'DM Mono, monospace', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={fmt} width={45} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,79,0,0.08)' }} />
          <Bar dataKey="avg_stores" radius={[2, 2, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.avg_stores === max ? '#ff4f00' : '#e2e2e6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
