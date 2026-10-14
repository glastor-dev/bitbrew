import { TraceWaterfall } from './components/TraceWaterfall';
import { Activity } from 'lucide-react';

function App() {
  return (
    <div className="relative min-h-screen bg-dark text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob-delayed" />
      
      <div className="relative z-10 max-w-6xl mx-auto p-8 space-y-12">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-zinc-800/50 gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 shadow-xl overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Activity className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Bitbrew
              </h1>
              <p className="text-zinc-400 text-sm mt-1 font-medium tracking-wide">
                Enterprise Agent Observability
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm font-mono text-zinc-300">
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 shadow-2xl px-5 py-2.5 rounded-full flex items-center gap-3 hover:bg-zinc-800/40 transition-all">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Live: 14,203 Traces
            </div>
          </div>
        </header>

        <main className="animate-fade-in">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Recent Execution</h2>
            <p className="text-zinc-400">Inspecting real-time trace workflow and agent routing decisions.</p>
          </div>
          
          <TraceWaterfall />
        </main>
        
      </div>
    </div>
  );
}

export default App;
