import { useState, useRef, useEffect } from 'react'
import { sendChat } from '../api'

const SUGGESTIONS = [
  '¿A qué hora hay más tiendas online?',
  '¿Cuál fue el día con más disponibilidad?',
  '¿Cómo varía entre semana y fin de semana?',
  '¿Cuál es el promedio de tiendas en la madrugada?',
  '¿Cuál fue la disponibilidad el 5 de febrero?',
]

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy el asistente de datos de disponibilidad de Rappi. Puedo responder preguntas sobre el dataset. ¿Qué quieres saber?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const q = text || input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)
    const res = await sendChat(q)
    setMessages(prev => [...prev, { role: 'assistant', text: res.answer }])
    setLoading(false)
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 2,
      display: 'grid',
      gridTemplateColumns: '1fr 340px',
    }}>
      {/* Messages area */}
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--online)', boxShadow: '0 0 8px var(--online)' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Chatbot</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '8px 12px', borderRadius: 2, fontSize: 13, lineHeight: 1.6,
                background: m.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
                color: m.role === 'user' ? '#fff' : 'var(--text)',
                border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex' }}>
              <div style={{ padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 2 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Pregunta sobre los datos..."
            style={{
              flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text)', padding: '8px 12px', borderRadius: 2,
              fontFamily: 'DM Mono, monospace', fontSize: 12, outline: 'none',
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? 'var(--surface2)' : 'var(--accent)',
              border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 2,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 700, transition: 'background 0.15s',
            }}
          >→</button>
        </div>
      </div>

      {/* Suggestions panel */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>
          Sugerencias
        </div>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => send(s)} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)',
            padding: '8px 12px', borderRadius: 2, fontSize: 12, cursor: 'pointer',
            fontFamily: 'DM Mono, monospace', textAlign: 'left', transition: 'all 0.15s', lineHeight: 1.4,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            {s}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
