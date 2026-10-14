<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/Built%20with-Rust%20%7C%20Python%20%7C%20React-indigo" alt="Stack">
  <br>
  <h1>🌌 Bitbrew AI</h1>
  <p><b>Enterprise Agent Observability Platform</b></p>
  <p>Visibilidad en tiempo real, rastreo distribuido y detección de anomalías para flujos multi-agente e Inteligencia Artificial.</p>
</div>

---

## ✨ Características

- 🚀 **Rastreo en Tiempo Real:** Visualiza las decisiones de enrutamiento y uso de herramientas de tus agentes en vivo.
- ⚡ **Motor de Alto Rendimiento (Rust):** Procesamiento de telemetría ultrarrápido respaldado por un core escrito en Rust (`bitbrew_core`).
- 🛡️ **Detección de Anomalías:** Identifica cuellos de botella y llamadas a APIs de LLMs que exceden latencias esperadas.
- 🔌 **Plug & Play en Python:** Simplemente usa el decorador `@trace_agent` y Bitbrew se encargará del contexto distribuido automáticamente.
- 🎨 **Dashboard Premium:** Una interfaz moderna estilo "Glassmorphism" construida con Vite, React y Tailwind CSS v4.

---

## 🏗️ Arquitectura del Proyecto

El repositorio está dividido en dos partes principales:

1. **`/backend`**:
   - Contiene la API de FastAPI que expone las trazas.
   - Contiene la librería `bitbrew` con el decorador `@trace_agent`.
   - Soporta un motor nativo en Rust (compilado vía Maturin) para procesamiento de máxima velocidad.
   - Incluye un fallback en Python puro para compatibilidad universal.
2. **`/frontend`**:
   - Dashboard en React (Vite) para la visualización de datos.
   - Utiliza Tailwind CSS v4 para animaciones, layouts interactivos y diseño UI/UX avanzado.

---

## 🚀 Guía de Inicio Rápido

### 1. Levantar el Backend (FastAPI + Motor de Trazas)

Abre una terminal y colócate en la carpeta del backend:

```bash
cd backend
```

Inicia el servidor de recolección de trazas:

```bash
.venv\Scripts\uvicorn bitbrew.server:app --reload
# (En Linux/Mac usa: .venv/bin/uvicorn bitbrew.server:app --reload)
```

En otra terminal, genera algo de tráfico de prueba para el Dashboard simulando el flujo de agentes:

```bash
.venv\Scripts\python test_agents.py
```

### 2. Levantar el Frontend (React Dashboard)

Abre una nueva pestaña en tu terminal y colócate en el frontend:

```bash
cd frontend
npm install
npm run dev
```

Ve a [http://localhost:5173](http://localhost:5173) en tu navegador para ver la magia.

---

## 🔧 Uso Avanzado: Compilar el Core de Rust

Para cargas de trabajo de nivel empresarial, Bitbrew utiliza un motor nativo en Rust para no bloquear el GIL de Python. Para habilitarlo:

1. Asegúrate de tener Rust instalado (`rustup`).
2. Ve a la carpeta `backend` y ejecuta:

```bash
maturin develop --release
```

_(Nota: Si usas una versión muy reciente de Python como la 3.14, podrías necesitar fijar la compatibilidad ABI usando `PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1`)._

---

## 📚 Uso en tu Código (Python)

Integrar Bitbrew en tu propio código de Agentes es tan sencillo como decorar tus funciones:

```python
import bitbrew

bitbrew.init(service_name="MiOrquestadorAgentes")

@bitbrew.trace_agent("Investigador", event_type="LLM_AGENT")
def investigar(tema: str):
    # Lógica de tu LLM aquí
    return recopilar_datos(tema)

@bitbrew.trace_agent("Scraper", event_type="TOOL_CALL")
def recopilar_datos(tema: str):
    # El contexto de la traza se hereda automáticamente
    pass
```

---

<div align="center">
  Hecho con ❤️ para la era de la IA Agentil.
</div>
