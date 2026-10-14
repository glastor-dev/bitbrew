use std::collections::HashMap;
use std::sync::Mutex;
use once_cell::sync::Lazy;

// Mantenemos el estado en la memoria RAM de Rust para máxima velocidad
struct AgentStats {
    avg_latency: f64,
    count: u64,
}

// Global Thread-Safe state
static STATS: Lazy<Mutex<HashMap<String, AgentStats>>> = Lazy::new(|| Mutex::new(HashMap::new()));

/// Detecta si una latencia es anómala basándose en un Promedio Móvil Exponencial (EMA)
pub fn detect_anomaly(agent_name: &str, current_latency: u64) -> bool {
    let mut stats = STATS.lock().unwrap();
    let stat = stats.entry(agent_name.to_string()).or_insert(AgentStats {
        avg_latency: current_latency as f64,
        count: 0,
    });
    
    stat.count += 1;
    
    // Si tenemos más de 3 ejecuciones de muestra, y la latencia es 50% mayor al promedio...
    let is_anomaly = stat.count > 3 && (current_latency as f64) > (stat.avg_latency * 1.5);
    
    // Actualizamos el promedio usando Exponential Moving Average (EMA)
    // Le damos un 20% de peso a la ejecución actual y 80% a la historia
    stat.avg_latency = (0.2 * current_latency as f64) + (0.8 * stat.avg_latency);
    
    is_anomaly
}
