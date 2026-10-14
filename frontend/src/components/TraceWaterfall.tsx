import React, { useEffect, useState } from 'react';
import { Activity, Terminal, CheckCircle2, ChevronRight, Box, AlertTriangle, XCircle, SearchX } from 'lucide-react';

interface AgentEvent {
  trace_id: string;
  span_id: string;
  parent_span_id: string | null;
  agent_name: string;
  event_type: string;
  latency_ms: number;
  status: string;
  metadata: Record<string, string>;
}

export function TraceWaterfall() {
  const [data, setData] = useState<AgentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraces = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/traces');
        const json = await res.json();
        setData(json.traces);
      } catch (err) {
        console.error("No se pudo conectar a FastAPI", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTraces();
    const interval = setInterval(fetchTraces, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/40 backdrop-blur-xl shadow-2xl rounded-2xl p-16 flex flex-col items-center justify-center gap-4 animate-pulse border border-zinc-800/50">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-zinc-400 font-medium">Estableciendo conexión orbital...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-zinc-900/40 backdrop-blur-xl shadow-2xl rounded-2xl p-16 flex flex-col items-center justify-center text-center border-dashed border-2 border-zinc-700/50 hover:border-indigo-500/50 transition-colors duration-500">
        <div className="bg-zinc-800/50 p-4 rounded-full mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
          <SearchX className="w-10 h-10 text-indigo-400 relative z-10" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No hay trazas activas</h3>
        <p className="text-zinc-400 max-w-md mx-auto mb-8">
          El sistema está esperando eventos. Ejecuta tu script de Python para comenzar a visualizar las decisiones y el ruteo de los agentes en tiempo real.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-300 w-full max-w-lg overflow-x-auto text-left shadow-inner flex items-center justify-between">
          <span><span className="text-pink-400">python</span> <span className="text-indigo-400">test_agents.py</span></span>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        </div>
      </div>
    );
  }

  const activeTraceId = data[0].trace_id;
  const currentTrace = data.filter(d => d.trace_id === activeTraceId).reverse(); 
  const totalLatency = Math.max(...currentTrace.map(d => d.latency_ms), 100);

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-zinc-800/50 bg-white/2">
        <div className="flex items-center gap-3 mb-2 sm:mb-0">
          <div className="p-2 bg-indigo-500/10 rounded-lg shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            <Activity size={18} className="text-indigo-400" />
          </div>
          <h3 className="font-semibold text-zinc-100 tracking-wide">
            Flujo Multi-Agente
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Live Trace:</span>
          <span className="text-xs text-indigo-300 font-mono bg-indigo-500/10 px-3 py-1.5 rounded-md border border-indigo-500/20">
            {activeTraceId.split("-")[0]}
          </span>
        </div>
      </div>
      
      <div className="p-5 space-y-3 bg-zinc-900/20">
        <div className="grid grid-cols-12 text-[11px] font-bold text-zinc-500 mb-4 px-3 uppercase tracking-widest">
          <div className="col-span-4">Agente / Herramienta</div>
          <div className="col-span-2 text-right">Latencia</div>
          <div className="col-span-5 px-6">Ejecución</div>
          <div className="col-span-1 text-center">Estado</div>
        </div>

        <div className="space-y-1.5">
          {currentTrace.map((span, idx) => {
            const width = Math.max((span.latency_ms / totalLatency) * 100, 2);
            const indent = span.parent_span_id ? 28 : 0;
            
            const isAnomaly = span.status === 'ANOMALY';
            const isError = span.status === 'ERROR';
            
            return (
              <div 
                key={span.span_id} 
                className={`grid grid-cols-12 items-center text-sm py-2.5 px-3 rounded-xl cursor-pointer transition-all duration-300 group
                  ${isAnomaly 
                    ? 'bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/20' 
                    : 'bg-zinc-800/20 hover:bg-zinc-800/60 border border-zinc-800/30 hover:border-zinc-700'
                  }`}
              >
                
                <div className="col-span-4 flex items-center gap-3 relative" style={{ paddingLeft: `${indent}px` }}>
                  {span.parent_span_id && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-px bg-zinc-700" style={{ left: `${indent - 16}px` }} />
                  )}
                  {span.parent_span_id && <ChevronRight size={14} className="text-zinc-600 shrink-0" />}
                  
                  <div className={`p-1.5 rounded-md shrink-0 transition-colors ${span.event_type === 'TOOL_CALL' ? 'bg-pink-500/10 group-hover:bg-pink-500/20' : 'bg-indigo-500/10 group-hover:bg-indigo-500/20'}`}>
                    {span.event_type === 'TOOL_CALL' ? (
                      <Terminal size={14} className="text-pink-400" />
                    ) : (
                      <Box size={14} className="text-indigo-400" />
                    )}
                  </div>
                  
                  <span className={`font-medium truncate ${isAnomaly ? 'text-orange-300 font-bold' : 'text-zinc-200 group-hover:text-white transition-colors'}`}>
                    {span.agent_name}
                  </span>
                  
                  {isAnomaly && (
                    <span className="text-[10px] bg-orange-500/20 border border-orange-500/30 text-orange-400 px-2 py-0.5 rounded-full ml-auto">
                      Lento
                    </span>
                  )}
                </div>
                
                <div className="col-span-2 text-right text-zinc-400 font-mono text-xs tabular-nums group-hover:text-zinc-300 transition-colors">
                  {span.latency_ms.toLocaleString()}ms
                </div>
                
                <div className="col-span-5 px-6 flex items-center">
                  <div className="w-full bg-zinc-900/50 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out relative
                        ${isAnomaly ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]' 
                        : (isError ? 'bg-red-500' : 'bg-indigo-500')} 
                        ${!isAnomaly && !isError ? 'opacity-80 group-hover:opacity-100 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.5)]' : ''}`}
                      style={{ width: `${width}%` }}
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1 flex justify-center">
                  {isAnomaly ? (
                    <AlertTriangle size={16} className="text-orange-500 animate-pulse drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
                  ) : isError ? (
                    <XCircle size={16} className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-500/80 group-hover:text-emerald-400 transition-colors" />
                  )}
                </div>
                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
