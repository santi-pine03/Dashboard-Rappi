# Rappi Store Availability Dashboard

Dashboard web para analizar la disponibilidad histórica de tiendas en Rappi

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + Recharts |
| Backend | FastAPI + Uvicorn |
| Procesamiento | Python + Pandas |
| Chatbot AI | Claude Haiku (Anthropic) |

---


## Correr el proyecto

### Backend

```bash
cd backend
pip install -r requirements.txt
set ANTHROPIC_API_KEY=sk-ant-tuKeyAqui   # Windows CMD
uvicorn main:app --reload
```

La API corre en `http://localhost:8000`. Documentación automática en `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El dashboard corre en `http://localhost:5173`.

---

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/summary` | KPIs generales del dataset |
| GET | `/api/timeseries?date=YYYY-MM-DD` | Serie de tiempo por día |
| GET | `/api/by-hour` | Promedio de tiendas por hora |
| GET | `/api/by-day` | Promedio por día |
| GET | `/api/by-weekday` | Promedio por día de semana |
| GET | `/api/available-dates` | Fechas disponibles en el dataset |
| POST | `/api/chat` | Chatbot — recibe `{ question }` |

---

## Reprocesar los datos originales

Si tiene los CSVs originales, puede regenerar el `data_processed.json`:

```bash
cd backend
python data_loader.py --input ./raw_data --output ./data_processed.json
```

---

## Chatbot

El asistente responde preguntas en lenguaje natural sobre el dataset. Si no hay API key configurada, cae automáticamente a un módulo local basado en pandas.

Ejemplos de preguntas:
- *¿A qué hora hay más tiendas online?*
- *¿Cuál fue la disponibilidad el 5 de febrero?*
- *¿Cómo varía entre semana y fin de semana?*
- *¿Cuál fue el día con más disponibilidad?*
