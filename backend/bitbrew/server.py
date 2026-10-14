from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI(title="Bitbrew Local Telemetry API")

# Permitir a React (localhost:5173) conectarse a esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/traces")
def get_traces():
    """
    Lee el archivo local escrito por el motor de Rust y lo expone para el Dashboard.
    """
    traces = []
    filepath = "bitbrew_traces.jsonl"
    
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    traces.append(json.loads(line))
                    
    # Retornamos el array invertido para mostrar los más recientes primero
    return {"traces": traces[::-1]}
