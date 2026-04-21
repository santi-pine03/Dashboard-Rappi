import { useEffect, useState } from 'react'
import { fetchByDay } from '../api'

const fmt = (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`

const WEEKDAY_ES = {
  Monday: 'lunes', Tuesday: 'martes', Wednesday: 'miércoles',
  Thursday: 'jueves', Friday: 'viernes', Saturday: 'sábado', Sunday: 'domingo'
}

export default function Insights({ summary, byHour, byWeekday }) {
  const [worstDays, setWorstDays] = useState([])

  useEffect(() => {
    fetchByDay().then(days => {
      const sorted = [...days].sort((a, b) => a.avg_stores - b.avg_stores)
      setWorstDays(sorted.slice(0, 3))
    })
  }, [])

  if (!summary || !byHour.length || !byWeekday.length) return null

  const bestWD = [...byWeekday].sort((a, b) => b.avg_stores - a.avg_stores)[0]

  const worstWD = [...byWeekday].sort((a, b) => a.avg_stores - b.avg_stores)[0]
  const lowestHourExcl = byHour.filter(h => h.hour !== 0).sort((a, b) => a.avg_stores - b.avg_stores)[0]

  const sectionLabel = {
    fontSize: 10, color: 'var(--muted)', fontFamily: 'DM Mono, monospace',
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
  }

  const card = (color) => ({
    borderLeft: `3px solid ${color}`,
    paddingLeft: 12,
    marginBottom: 14,
  })

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2, padding: 20, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Puntos clave</div>

      {/* Mejor momento */}
      <div style={card('var(--online)')}>
        <div style={sectionLabel}> Mejor momento</div>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
          Los <span style={{ color: 'var(--accent)' }}>{WEEKDAY_ES[bestWD?.weekday]}</span> a las <span style={{ color: 'var(--accent)' }}>{summary.peak_hour}:00</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>
          ~{fmt(byHour.find(h => h.hour === summary.peak_hour)?.avg_stores || 0)} tiendas online
        </div>
      </div>

      {/* Momento crítico */}
      <div style={card('var(--accent)')}>
        <div style={sectionLabel}> Menor disponibilidad</div>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
          Los <span style={{ color: 'var(--accent)' }}>{WEEKDAY_ES[worstWD?.weekday]}</span> a las <span style={{ color: 'var(--accent)' }}>{lowestHourExcl?.hour}:00</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>
          ~{fmt(lowestHourExcl?.avg_stores || 0)} tiendas online
        </div>
      </div>

      {/* Días con menos tiendas */}
      <div style={card('#ffcc00')}>
        <div style={sectionLabel}> Días con menos tiendas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2 }}>
          {worstDays.map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{d.date}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>{fmt(d.avg_stores)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
