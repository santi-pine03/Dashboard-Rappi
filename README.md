# Dashboard de disponibilidad de tiendas en Rappi

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

## Ejecutar el proyecto con Docker 

### 1. Clonar el repositorio

```bash
git clone https://github.com/santi-pine03/Dashboard-Rappi.git
cd Dashboard-Rappi
```

### 2. Configurar la API key

```bash
cd backend
copy .env.example .env
```

Abrir el archivo `.env` y reemplazar el valor de la variable con API key de Anthropic:

```
ANTHROPIC_API_KEY=sk-ant-tuKeyAqui
```

Si no se configura la key, el chatbot funciona igual con un módulo local basado en pandas. Pero es más limitado en las preguntas que se le puede realizar.

### 3. Volver a la raíz y levantar los contenedores

```bash
cd ..
docker-compose up --build
```

- Dashboard: `http://localhost:5173`
- API: `http://localhost:8000`
- Documentación API: `http://localhost:8000/docs`

### Reiniciar la aplicación

Si se necesita reiniciar:

```bash
docker-compose down
docker-compose up --build
```

---

## Correr sin Docker

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

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
| POST | `/api/chat` | Chatbot, recibe `{ question }` |

---
 
## Reprocesar los datos originales
 
El repositorio ya incluye `backend/data_processed.json`, es un archivo con los 67K puntos de datos listos ya procesados, generado a partir de los 201 CSVs originales del dataset. No es necesario hacer nada adicional para que la app funcione.
 
Si en algún momento se quiere regenerar ese archivo desde los CSVs originales:
 
1. Crear una carpeta `backend/raw_data/` y poner los CSVs ahí
2. Correr el script de procesamiento:
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
