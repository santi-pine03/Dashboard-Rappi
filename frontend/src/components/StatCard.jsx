export default function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 2,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      position: 'relative',
      overflow: 'hidden',
      alignItems: 'center',
    }}>
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 2, background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
        }} />
      )}
      <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }}>
        {label}
      </span>
      <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: accent ? 'var(--accent)' : 'var(--text)', textAlign: 'center' }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>
          {sub}
        </span>
      )}
    </div>
  )
}
