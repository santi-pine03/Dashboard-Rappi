from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from services.data_service import (
    load_data, get_summary, get_timeseries,
    get_by_hour, get_by_day, get_by_weekday, get_available_dates
)
from services.chat_service import get_chat_response

app = FastAPI(title="Rappi Availability Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carga los datos una sola vez al arrancar
df = load_data()


@app.get("/api/summary")
def summary():
    return get_summary(df)


@app.get("/api/timeseries")
def timeseries(date: str = Query(None)):
    return get_timeseries(df, date)


@app.get("/api/by-hour")
def by_hour():
    return get_by_hour(df)


@app.get("/api/by-day")
def by_day():
    return get_by_day(df)


@app.get("/api/by-weekday")
def by_weekday():
    return get_by_weekday(df)


@app.get("/api/available-dates")
def available_dates():
    return {"dates": get_available_dates(df)}


@app.post("/api/chat")
def chat(body: dict):
    return {"answer": get_chat_response(body.get("question", ""), df)}
