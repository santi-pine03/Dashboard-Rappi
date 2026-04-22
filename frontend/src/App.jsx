import { useEffect, useState } from 'react'
import { fetchSummary, fetchByHour, fetchByWeekday } from './api'
import rappiLogo from './assets/rappi-logo.png'

import StatCard from './components/StatCard'
import TimeseriesChart from './components/TimeseriesChart'
import HourlyChart from './components/HourlyChart'
import WeekdayChart from './components/WeekdayChart'
import DayCompare from './components/DayCompare'
import Insights from './components/Insights'
import Chatbot from './components/Chatbot'

const fmt = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

export default function App() {
  const [summary, setSummary] = useState(null)
  const [byHour, setByHour] = useState([])
  const [byWeekday, setByWeekday] = useState([])

  useEffect(() => {
    fetchSummary().then(setSummary)
    fetchByHour().then(setByHour)
    fetchByWeekday().then(setByWeekday)
  }, [])

  return (
    <div style={{ minHeight: '100vh', padding: '28px 36px', maxWidth: 1440, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={rappiLogo} alt="Rappi" style={{ height: 60, width: 'auto', mixBlendMode: 'multiply' }} />
          <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>
              Dashboard de Disponibilidad de Tiendas
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--muted)' }}>
          <div>Feb 01 – Feb 11, 2026</div>
          <div style={{ marginTop: 4 }}>{summary ? `${(summary.total_datapoints / 1000).toFixed(0)}K registros` : '...'}</div>
        </div>
      </div>

      {/* Row 1 — KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
        <StatCard label="Pico máximo" value={summary ? fmt(summary.max_stores) : '—'} sub="tiendas simultáneas" accent />
        <StatCard label="Promedio global" value={summary ? fmt(summary.avg_stores) : '—'} sub="promedio en el período" />
        <StatCard label="Hora pico" value={summary ? `${summary.peak_hour}:00` : '—'} sub="mayor disponibilidad" />
        <StatCard label="Hora de menor actividad" value={summary ? `${summary.lowest_hour}:00` : '—'} sub="menor disponibilidad" />
      </div>

      {/* Row 2 — Serie de tiempo + Comparador */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 12 }}>
        <TimeseriesChart />
        <DayCompare />
      </div>

      {/* Row 3 Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
        <HourlyChart />
        <WeekdayChart />
        <Insights summary={summary} byHour={byHour} byWeekday={byWeekday} />
      </div>

      {/* Row 4 — Chatbot */}
      <Chatbot />

    </div>
  )
}
