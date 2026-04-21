import os
import json
import urllib.request
import pandas as pd

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

_fmt = lambda v: f"{v/1_000_000:.1f}M" if v >= 1_000_000 else f"{v/1_000:.0f}K" if v >= 1_000 else str(int(v))

WEEKDAY_ES = {
    "Monday": "lunes", "Tuesday": "martes", "Wednesday": "miércoles",
    "Thursday": "jueves", "Friday": "viernes", "Saturday": "sábado", "Sunday": "domingo"
}


def build_context(df: pd.DataFrame) -> str:
    by_hour    = df.groupby("hour")["value"].mean()
    by_day     = df.groupby("date")["value"].mean()
    by_weekday = df.groupby("weekday")["value"].mean()
    return f"""Eres un asistente de datos para el equipo de ingeniería de Rappi.
La métrica 'synthetic_monitoring_visible_stores' mide cuántas tiendas están online/visibles en la app de Rappi en cada momento.
Datos del {df['timestamp'].min().strftime('%Y-%m-%d')} al {df['timestamp'].max().strftime('%Y-%m-%d')}.
- Total puntos de datos: {len(df):,}
- Máximo: {int(df['value'].max()):,} tiendas
- Mínimo: {int(df['value'].min()):,} tiendas
- Promedio global: {int(df['value'].mean()):,} tiendas
- Hora pico: {int(by_hour.idxmax())}:00 ({int(by_hour.max()):,} tiendas promedio)
- Hora valle: {int(by_hour.idxmin())}:00 ({int(by_hour.min()):,} tiendas promedio)
- Mejor día: {str(by_day.idxmax())[:10]} ({int(by_day.max()):,} tiendas)
- Peor día: {str(by_day.idxmin())[:10]} ({int(by_day.min()):,} tiendas)
- Mejor día de semana: {by_weekday.idxmax()} ({int(by_weekday.max()):,} tiendas)
- Promedio fin de semana: {int(by_weekday[['Saturday','Sunday']].mean()):,}
- Promedio entre semana: {int(by_weekday[['Monday','Tuesday','Wednesday','Thursday','Friday']].mean()):,}
- Promedio madrugada (0-5h): {int(df[df['hour'].between(0,5)]['value'].mean()):,}

Promedio por día:
{chr(10).join(f"- {str(d)[:10]}: {int(v):,} tiendas" for d, v in by_day.items())}

Promedio por hora del día:
{chr(10).join(f"- {int(h):02d}:00 -> {int(v):,} tiendas" for h, v in by_hour.items())}

Responde en español, de forma concisa y directa basándote en estos datos."""


def get_chat_response(question: str, df: pd.DataFrame) -> str:
    # Intenta con Anthropic Claude
    if ANTHROPIC_API_KEY:
        try:
            payload = json.dumps({
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 400,
                "system": build_context(df),
                "messages": [
                    {"role": "user", "content": question}
                ]
            }).encode("utf-8")

            req = urllib.request.Request(
                "https://api.anthropic.com/v1/messages",
                data=payload,
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read())
                return result["content"][0]["text"]
        except Exception as e:
            print(f"Error Anthropic: {e}")
            pass

    # En caso de fallo se usa el fallback local
    return _local_chat(question, df)


def _local_chat(question: str, df: pd.DataFrame) -> str:
    q = question.lower().strip()

    by_hour    = df.groupby("hour")["value"].mean()
    by_day     = df.groupby("date")["value"].mean()
    by_weekday = df.groupby("weekday")["value"].mean()

    peak_hour   = int(by_hour.idxmax())
    lowest_hour = int(by_hour.idxmin())
    peak_day    = str(by_day.idxmax())[:10]
    worst_day   = str(by_day.idxmin())[:10]
    best_wd     = by_weekday.idxmax()
    worst_wd    = by_weekday.idxmin()

    if any(w in q for w in ["madrugada", "noche", "nocturno"]):
        dawn = df[df["hour"].between(0, 5)]["value"].mean()
        return f"En la madrugada (00:00–05:59) el promedio es **{_fmt(dawn)}** tiendas. Es la franja con menor actividad, solo operan tiendas 24 horas."

    if any(w in q for w in ["pico", "máximo", "maximo", "más tiendas", "mas tiendas", "mayor"]):
        return f"La hora pico es las **{peak_hour}:00** con ~{_fmt(by_hour[peak_hour])} tiendas en promedio. Coincide con el horario de almuerzo/tarde."

    if any(w in q for w in ["valle", "mínimo", "minimo", "menos tiendas", "menor"]):
        return f"La hora con menos tiendas es las **{lowest_hour}:00** con ~{_fmt(by_hour[lowest_hour])} tiendas."

    if any(w in q for w in ["promedio", "media", "average", "en general"]):
        return f"El promedio global es **{_fmt(df['value'].mean())}** tiendas por muestra."

    if any(w in q for w in ["fin de semana", "weekend", "finde", "sábado", "sabado", "domingo"]):
        weekend = by_weekday[["Saturday", "Sunday"]].mean()
        weekday = by_weekday[["Monday","Tuesday","Wednesday","Thursday","Friday"]].mean()
        diff = (weekend - weekday) / weekday * 100
        return f"Fin de semana: **{_fmt(weekend)}** tiendas vs entre semana: **{_fmt(weekday)}**. El finde tiene un **{abs(diff):.1f}% {'más' if diff>0 else 'menos'}**."

    if any(w in q for w in ["día", "dia", "fecha", "mejor", "peor"]):
        if any(w in q for w in ["peor", "menos", "mínimo", "minimo"]):
            return f"El peor día fue el **{worst_day}** con promedio de **{_fmt(by_day.min())}** tiendas."
        return f"El mejor día fue el **{peak_day}** con promedio de **{_fmt(by_day.max())}** tiendas."

    if any(w in q for w in ["tendencia", "patrón", "patron", "comportamiento", "ciclo"]):
        return f"El patrón es claro: tiendas suben desde las 7:00, pico a las **{peak_hour}:00** con ~{_fmt(by_hour[peak_hour])}, luego bajan hasta la madrugada. Se repite cada día."

    return (
        f"Puedo responder sobre los datos de disponibilidad. Pregúntame por ejemplo:\n\n"
        f"• ¿A qué hora hay más tiendas?\n"
        f"• ¿Cuál fue el mejor día?\n"
        f"• ¿Cómo varía el fin de semana?\n"
        f"• ¿Cuál es el promedio en la madrugada?\n\n"
        f"Stats: máx **{_fmt(df['value'].max())}** · prom **{_fmt(df['value'].mean())}** · pico **{peak_hour}:00**"
    )
