import json
import pandas as pd


def load_data(path: str = "data_processed.json") -> pd.DataFrame:
    with open(path) as f:
        raw = json.load(f)
    df = pd.DataFrame(raw)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["date"] = pd.to_datetime(df["date"])
    return df


def get_summary(df: pd.DataFrame) -> dict:
    by_hour = df.groupby("hour")["value"].mean()
    return {
        "total_datapoints": len(df),
        "date_from": df["timestamp"].min().isoformat(),
        "date_to": df["timestamp"].max().isoformat(),
        "max_stores": int(df["value"].max()),
        "min_stores": int(df["value"].min()),
        "avg_stores": int(df["value"].mean()),
        "peak_hour": int(by_hour.idxmax()),
        "lowest_hour": int(by_hour.idxmin()),
    }


def get_timeseries(df: pd.DataFrame, date: str = None) -> list:
    filtered = df.copy()
    if date:
        filtered = filtered[filtered["date"] == pd.Timestamp(date)]

    filtered = (
        filtered.set_index("timestamp")
        .resample("1min")
        .mean(numeric_only=True)
        .reset_index()
        .dropna()
    )
    return [
        {"timestamp": row["timestamp"].isoformat(), "value": int(row["value"])}
        for _, row in filtered.iterrows()
    ]


def get_by_hour(df: pd.DataFrame) -> list:
    result = df.groupby("hour")["value"].mean().reset_index()
    return [
        {"hour": int(row["hour"]), "avg_stores": int(row["value"])}
        for _, row in result.iterrows()
    ]


def get_by_day(df: pd.DataFrame) -> list:
    result = df.groupby("date")["value"].agg(["mean", "max", "min"]).reset_index()
    return [
        {
            "date": str(row["date"])[:10],
            "avg_stores": int(row["mean"]),
            "max_stores": int(row["max"]),
            "min_stores": int(row["min"]),
        }
        for _, row in result.iterrows()
    ]


def get_by_weekday(df: pd.DataFrame) -> list:
    order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    result = df.groupby("weekday")["value"].mean().reindex(order).reset_index()
    return [
        {"weekday": row["weekday"], "avg_stores": int(row["value"])}
        for _, row in result.iterrows()
        if not pd.isna(row["value"])
    ]


def get_available_dates(df: pd.DataFrame) -> list:
    return sorted(df["date"].dt.strftime("%Y-%m-%d").unique().tolist())
