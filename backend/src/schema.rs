use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Este es el esquema central que Python deberá enviarle a Rust.
/// Cubre todas las necesidades de observabilidad de un agente moderno.
#[derive(Debug, Serialize, Deserialize)]
pub struct AgentEvent {
    pub trace_id: String,           // ID único para toda la conversación/flujo
    pub span_id: String,            // ID único para este paso (ej. invocación de herramienta)
    pub parent_span_id: Option<String>, 
    pub agent_name: String,         // ej. "ResearcherAgent"
    pub event_type: String,         // "LLM_CALL", "TOOL_INVOCATION", "ROUTING"
    
    // Métricas cruciales de facturación y performance
    pub input_tokens: Option<u32>,
    pub output_tokens: Option<u32>,
    pub latency_ms: u64,
    
    pub status: String,             // "SUCCESS", "ERROR"
    pub error_msg: Option<String>,
    
    // Metadata dinámica (ej. el Prompt usado, la herramienta seleccionada)
    pub metadata: HashMap<String, String>,
}
