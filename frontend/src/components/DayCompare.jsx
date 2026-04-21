import { useState, useEffect } from 'react'
import { fetchDates, fetchTimeseries } from '../api'

const fmt = (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(Math.round(v))

export default function DayCompare() {
  const [dates, setDates] = useState([])
  const [dayA, setDayA] = useState('')
  const [dayB, setDayB] = useState('')
  const [statsA, setStatsA] = useState(null)
  const [statsB, setStatsB] = useState(null)

  useEffect(() => {
    fetchDates().then(d => {
      setDates(d.dates)
      setDayA(d.dates[0])
      setDayB(d.dates[4])
    })
  }, [])

  const loadStats = (date, setter) => {
    fetchTimeseries(date).then(data => {
      if (!data.length) return
      const values = data.map(d => d.value)
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const max = Math.max(...values)
      const min = Math.min(...values)
      const peakEntry = data.reduce((best, d) => d.value > best.value ? d : best, data[0])
      setter({ avg, max, min, peakHour: peakEntry.timestamp.slice(11, 16) })
    })
  }

  useEffect(() => { if (dayA) loadStats(dayA, setStatsA) }, [dayA])
  useEffect(() => { if (dayB) loadStats(dayB, setStatsB) }, [dayB])

  const selectStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '4px 8px', borderRadius: 2,
    fontFamily: 'DM Mono, monospace', fontSize: 11, cursor: 'pointer', width: '100%',
  }

  const rows = [
    { label: 'Promedio',  a: statsA?.avg,      b: statsB?.avg,      numeric: true },
    { label: 'Máximo',    a: statsA?.max,       b: statsB?.max,      numeric: true },
    { label: 'Mínimo',    a: statsA?.min,       b: statsB?.min,      numeric: true },
    { label: 'Hora pico', a: statsA?.peakHour,  b: statsB?.peakHour, numeric: false },
  ]

  const winner = (a, b) => {
    if (a == null || b == null) return null
    if (a > b) return 'a'
    if (b > a) return 'b'
    return 'tie'
  }

  const cellStyle = (isWinner) => ({
    padding: '9px 12px',
    fontFamily: 'DM Mono, monospace',
    fontSize: 12,
    fontWeight: isWinner ? 700 : 400,
    color: isWinner ? 'var(--accent)' : 'var(--muted)',
    textAlign: 'center',
    borderBottom: '1px solid var(--border)',
  })

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2, padding: 20, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>
        Comparador
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Dos días</div>

      {/* Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>── DÍA A</div>
          <select value={dayA} onChange={e => setDayA(e.target.value)} style={selectStyle}>
            {dates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--online)', fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>── DÍA B</div>
          <select value={dayB} onChange={e => setDayB(e.target.value)} style={selectStyle}>
            {dates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'hidden', borderRadius: 2, border: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '8px 12px', fontSize: 10, color: 'var(--muted)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Métrica</div>
          <div style={{ padding: '8px 12px', fontSize: 10, color: 'var(--accent)', fontFamily: 'DM Mono, monospace', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Día A</div>
          <div style={{ padding: '8px 12px', fontSize: 10, color: 'var(--online)', fontFamily: 'DM Mono, monospace', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Día B</div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => {
          const w = row.numeric ? winner(row.a, row.b) : null
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
              <div style={{ padding: '9px 12px', fontSize: 11, color: 'var(--muted)', fontFamily: 'DM Mono, monospace', borderBottom: '1px solid var(--border)' }}>
                {row.label}
              </div>
              <div style={cellStyle(w === 'a')}>
                {row.a != null ? (row.numeric ? fmt(row.a) : row.a) : '—'}
                {w === 'a' && ' ↑'}
              </div>
              <div style={cellStyle(w === 'b')}>
                {row.b != null ? (row.numeric ? fmt(row.b) : row.b) : '—'}
                {w === 'b' && ' ↑'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
