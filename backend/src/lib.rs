use pyo3::prelude::*;
use tracing::{info, span, Level};
use std::collections::HashMap;

mod schema;
mod anomaly;

use schema::AgentEvent;
use std::fs::OpenOptions;
use std::io::Write;

/// Inicia el exportador de OpenTelemetry en background
#[pyfunction]
fn init_telemetry(service_name: &str, endpoint: &str) -> PyResult<()> {
    // Aquí inicializamos el pipeline de OTLP (OpenTelemetry Protocol).
    // NOTA: En un entorno de producción, esto envía los datos por gRPC 
    // a tu colector (ej. Datadog) en lotes asíncronos para no frenar a Python.
    
    // Por ahora, configuramos un subscriber básico para demostración que imprime
    // el formato estructurado.
    let subscriber = tracing_subscriber::fmt()
        .json() // Logs en formato JSON estructurado
        .with_max_level(Level::INFO)
        .finish();
        
    let _ = tracing::subscriber::set_global_default(subscriber);
    
    info!(
        service.name = service_name,
        endpoint = endpoint,
        "Bitbrew telemetry initialized via Rust core!"
    );
    Ok(())
}

/// Recibe el evento JSON desde Python y lo inyecta en OpenTelemetry
#[pyfunction]
fn log_agent_event(
    trace_id: String,
    span_id: String,
    parent_span_id: Option<String>,
    agent_name: String,
    event_type: String,
    latency_ms: u64,
    input_tokens: Option<u32>,
    output_tokens: Option<u32>,
    status: String,
    metadata: HashMap<String, String>,
) -> PyResult<()> {
    
    // 1. Detectar Anomalías en tiempo real
    let is_anomaly = anomaly::detect_anomaly(&agent_name, latency_ms);
    let final_status = if is_anomaly && status == "SUCCESS" {
        "ANOMALY".to_string()
    } else {
        status.clone()
    };

    // Creamos el evento fuertemente tipado
    let event = AgentEvent {
        trace_id: trace_id.clone(),
        span_id: span_id.clone(),
        parent_span_id: parent_span_id.clone(),
        agent_name: agent_name.clone(),
        event_type: event_type.clone(),
        input_tokens,
        output_tokens,
        latency_ms,
        status: final_status.clone(),
        error_msg: None,
        metadata: metadata.clone(),
    };
    
    // 2. Persistir localmente para el Frontend (Full-stack Loop)
    if let Ok(json_str) = serde_json::to_string(&event) {
        if let Ok(mut file) = OpenOptions::new().create(true).append(true).open("bitbrew_traces.jsonl") {
            let _ = writeln!(file, "{}", json_str);
        }
    }

    // Usamos el macro `info_span!` de tracing para crear un span de OpenTelemetry.
    // Todos estos campos se convierten automáticamente en "Attributes" (etiquetas) en Datadog/Grafana.
    let agent_span = span!(
        Level::INFO, 
        "agent_execution",
        otel.name = %event.agent_name,
        otel.kind = "client",
        trace_id = %event.trace_id,
        span_id = %event.span_id,
        parent_span_id = event.parent_span_id.as_deref().unwrap_or("root"),
        event_type = %event.event_type,
        input_tokens = event.input_tokens.unwrap_or(0),
        output_tokens = event.output_tokens.unwrap_or(0),
        latency_ms = event.latency_ms,
        status = %event.status
    );

    let _enter = agent_span.enter();

    // Aquí registramos la metadata dinámica (los prompts, parámetros, etc)
    info!(
        metadata = ?event.metadata,
        "Agent step completed"
    );

    Ok(())
}

#[pymodule]
fn bitbrew_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(init_telemetry, m)?)?;
    m.add_function(wrap_pyfunction!(log_agent_event, m)?)?;
    Ok(())
}
