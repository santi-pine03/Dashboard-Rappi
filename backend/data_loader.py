"""
data_loader.py
--------------
Procesa todos los CSVs originales de disponibilidad de tiendas
y genera un archivo data_processed.json listo para usar por la API.

Uso:
    python data_loader.py --input ./raw_data --output ./data_processed.json
"""

import argparse
import glob
import json
import pandas as pd


def process_csvs(input_folder: str, output_path: str):
    files = glob.glob(f"{input_folder}/*.csv")

    if not files:
        print(f"No se encontraron archivos CSV en: {input_folder}")
        return

    print(f"Encontrados {len(files)} archivos CSV...")

    all_series = []
    for f in files:
        try:
            df = pd.read_csv(f, header=0)
            timestamps = df.columns[4:]
            values = df.iloc[0, 4:].values
            for ts, val in zip(timestamps, values):
                all_series.append({"timestamp": ts, "value": val})
        except Exception as e:
            print(f"Error leyendo {f}: {e}")

    print(f" Procesando {len(all_series):,} puntos de datos...")

    combined = pd.DataFrame(all_series)

    combined["timestamp"] = pd.to_datetime(
        combined["timestamp"].str.replace(r" GMT.*", "", regex=True),
        format="%a %b %d %Y %H:%M:%S"
    )


    combined = combined.sort_values("timestamp").drop_duplicates("timestamp")
    combined["value"] = pd.to_numeric(combined["value"], errors="coerce")
    combined = combined.dropna()

    combined["hour"] = combined["timestamp"].dt.hour
    combined["date"] = combined["timestamp"].dt.date.astype(str)
    combined["weekday"] = combined["timestamp"].dt.day_name()
    combined["timestamp"] = combined["timestamp"].astype(str)

    combined.to_json(output_path, orient="records")

    print(f" Listo! {len(combined):,} puntos guardados en: {output_path}")
    print(f"   Rango: {combined['timestamp'].min()} → {combined['timestamp'].max()}")
    print(f"   Máximo: {int(combined['value'].max()):,} tiendas")
    print(f"   Promedio: {int(combined['value'].mean()):,} tiendas")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Procesa CSVs de disponibilidad de Rappi")
    parser.add_argument("--input", default="./raw_data", help="Carpeta con los CSVs originales")
    parser.add_argument("--output", default="./data_processed.json", help="Archivo de salida")
    args = parser.parse_args()

    process_csvs(args.input, args.output)
