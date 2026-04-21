const BASE = 'http://localhost:8000/api'

export async function fetchSummary() {
  const r = await fetch(`${BASE}/summary`)
  return r.json()
}

export async function fetchTimeseries(date = null) {
  const url = date ? `${BASE}/timeseries?date=${date}` : `${BASE}/timeseries`
  const r = await fetch(url)
  return r.json()
}

export async function fetchByHour() {
  const r = await fetch(`${BASE}/by-hour`)
  return r.json()
}

export async function fetchByDay() {
  const r = await fetch(`${BASE}/by-day`)
  return r.json()
}

export async function fetchByWeekday() {
  const r = await fetch(`${BASE}/by-weekday`)
  return r.json()
}

export async function fetchDates() {
  const r = await fetch(`${BASE}/available-dates`)
  return r.json()
}

export async function sendChat(question) {
  const r = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  return r.json()
}
