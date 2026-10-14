import uuid
import time
from functools import wraps
from typing import Any, Callable, Dict, Optional
import contextvars

# Declaramos las variables de contexto para propagar la traza automáticamente.
# Al ser ContextVars, son thread-safe y async-safe por naturaleza en Python.
_current_trace_id = contextvars.ContextVar("current_trace_id", default=None)
_current_span_id = contextvars.ContextVar("current_span_id", default=None)

try:
    from . import core
except ImportError:
    core = None

def init(service_name: str, endpoint: str = "http://localhost:4317"):
    """
    Inicializa el colector de OpenTelemetry en el motor de Rust.
    """
    if core:
        core.init_telemetry(service_name, endpoint)
    else:
        print("Warning: bitbrew_core no encontrado. Compila el motor Rust con 'maturin develop'.")

def trace_agent(
    agent_name: str, 
    event_type: str = "AGENT_EXECUTION",
    metadata: Optional[Dict[str, str]] = None
):
    """
    Decorador Plug-and-Play con propagación de contexto distribuido.
    Soporta flujos multi-agente anidados de forma automática.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            
            # 1. Recuperamos el contexto de quien nos llamó (el "padre")
            parent_trace_id = _current_trace_id.get()
            parent_span_id = _current_span_id.get()
            
            # 2. Si no hay trace_id padre, somos la raíz del árbol
            is_root = parent_trace_id is None
            trace_id = parent_trace_id if not is_root else str(uuid.uuid4())
            span_id = str(uuid.uuid4())
            
            # 3. Inyectamos NUESTROS IDs en el contexto. 
            # Cualquier función que llamemos internamente, leerá estos IDs como sus padres.
            token_trace = _current_trace_id.set(trace_id)
            token_span = _current_span_id.set(span_id)
            
            start_time = time.time()
            status = "SUCCESS"
            error_msg = None
            input_tokens = kwargs.get("input_tokens", 0)
            output_tokens = 0
            
            try:
                # Ejecutamos la lógica del agente
                result = func(*args, **kwargs)
                
                if hasattr(result, "usage"):
                    input_tokens = getattr(result.usage, "prompt_tokens", input_tokens)
                    output_tokens = getattr(result.usage, "completion_tokens", output_tokens)
                    
                return result
                
            except Exception as e:
                status = "ERROR"
                error_msg = str(e)
                raise e
                
            finally:
                latency_ms = int((time.time() - start_time) * 1000)
                
                # 4. Restauramos el contexto al estado anterior (Pop del stack)
                _current_trace_id.reset(token_trace)
                _current_span_id.reset(token_span)
                
                # 5. Enviamos a Rust la información completa (incluyendo parent_span_id)
                if core:
                    core.log_agent_event(
                        trace_id=trace_id,
                        span_id=span_id,
                        parent_span_id=parent_span_id, # <- El enlace mágico
                        agent_name=agent_name,
                        event_type=event_type,
                        latency_ms=latency_ms,
                        input_tokens=input_tokens,
                        output_tokens=output_tokens,
                        status=status,
                        metadata=metadata or {}
                    )
                else:
                    import json
                    if status == "SUCCESS" and latency_ms > 1000:
                        status = "ANOMALY"
                        
                    trace_data = {
                        "trace_id": trace_id,
                        "span_id": span_id,
                        "parent_span_id": parent_span_id,
                        "agent_name": agent_name,
                        "event_type": event_type,
                        "latency_ms": latency_ms,
                        "input_tokens": input_tokens,
                        "output_tokens": output_tokens,
                        "status": status,
                        "metadata": metadata or {},
                        "timestamp": int(time.time() * 1000)
                    }
                    with open("bitbrew_traces.jsonl", "a", encoding="utf-8") as f:
                        f.write(json.dumps(trace_data) + "\n")
        return wrapper
    return decorator
