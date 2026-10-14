import bitbrew
import time
import random

# Inicializar Telemetría
bitbrew.init(service_name="DemoAgentes")

# Simulamos una herramienta que a veces falla
@bitbrew.trace_agent("Buscador_Google", event_type="TOOL_CALL")
def buscar(query):
    # Simular latencia de red aleatoria (A veces lento, a veces rápido para disparar Anomalía)
    latencia = random.uniform(0.1, 1.2)
    time.sleep(latencia) 
    if random.random() > 0.9: # 10% de fallo
        raise Exception("Google Search API Rate Limit")
    return f"Resultados para: {query}"

# Simulamos un Agente orquestador
@bitbrew.trace_agent("Agente_Investigador", event_type="LLM_AGENT")
def investigar(tema):
    print(f"[Investigador] Empezando a investigar: {tema}")
    time.sleep(random.uniform(0.1, 0.4))
    try:
        data = buscar(tema)
        print(f"[Investigador] Encontré datos: {data}")
    except Exception as e:
        print(f"[Investigador] Error en herramienta: {e}")
        time.sleep(0.1)
        print("[Investigador] Resolviendo con conocimiento base...")

if __name__ == "__main__":
    print("--- INICIANDO DEMO DE BITBREW ---")
    investigar("Frameworks Rust para AI")
    print("--- DEMO FINALIZADA ---")
