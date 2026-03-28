'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, Cpu, Terminal, Zap, X, GitMerge, Server } from 'lucide-react'

export default function CustomAIWorkspace({ onClose }: { onClose: () => void }) {
  const [ticker, setTicker] = useState('AAPL')
  const [modelId, setModelId] = useState('fin-bert-custom-v2')
  const [strategy, setStrategy] = useState('technical')
  const [days, setDays] = useState(30)
  
  const [isInferring, setIsInferring] = useState(false)
  const [result, setResult] = useState<any>(null)

  const runModel = async () => {
    setIsInferring(true)
    setResult(null)
    
    try {
      const res = await fetch('http://localhost:5000/api/custom-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId,
          ticker,
          strategy,
          historicalDataLengthDays: days
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ success: false, error: 'Network failure' });
    }
    
    setIsInferring(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[var(--bg-primary)] border border-[var(--surface-border)] rounded-lg shadow-2xl overflow-hidden shadow-[0_0_50px_rgba(43,123,232,0.1)]">
        
        {/* Header */}
        <div className="h-12 border-b border-[var(--surface-border)] bg-[var(--bg-secondary)] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[var(--blue-glow)]/20 rounded">
              <BrainCircuit className="w-4 h-4 text-[var(--blue-bright)]" />
            </div>
            <div>
              <h2 className="text-xs font-display font-bold tracking-[0.2em] text-[var(--blue-bright)]">CUSTOM NEURAL WORKSPACE</h2>
              <span className="text-[9px] font-mono text-[var(--text-muted)]">Plug and map custom ML models into the GEO-PULSE pipeline</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--status-critical)] transition-colors p-1 hover:bg-[var(--status-critical)]/10 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Settings Sidebar */}
          <div className="w-80 border-r border-[var(--surface-border)] bg-[var(--bg-secondary)] overflow-y-auto p-4 flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-[var(--text-muted)]">MODEL ID / ENDPOINT</label>
              <div className="flex bg-[var(--bg-primary)] border border-[var(--surface-border)] rounded px-2 items-center focus-within:border-[var(--blue-bright)] transition-colors">
                <Server className="w-3.5 h-3.5 text-[var(--text-muted)] mr-2" />
                <input 
                  value={modelId}
                  onChange={e => setModelId(e.target.value)}
                  className="bg-transparent text-[11px] font-mono text-[var(--text-primary)] w-full py-2 outline-none"
                  placeholder="e.g. huggingface/models/my-fin-bert"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-[var(--text-muted)]">TARGET TICKER / ASSET</label>
              <input 
                value={ticker}
                onChange={e => setTicker(e.target.value)}
                className="bg-[var(--bg-primary)] border border-[var(--surface-border)] rounded px-3 py-2 text-[11px] font-mono text-[var(--text-primary)] outline-none focus:border-[var(--blue-bright)] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-[var(--text-muted)]">ANALYSIS STRATEGY</label>
              <select 
                value={strategy}
                onChange={e => setStrategy(e.target.value)}
                className="bg-[var(--bg-primary)] border border-[var(--surface-border)] rounded px-2 py-2 text-[11px] font-mono text-[var(--text-primary)] outline-none focus:border-[var(--blue-bright)] transition-colors"
              >
                <option value="technical">Technical Analysis</option>
                <option value="fundamental">Fundamental Analysis</option>
                <option value="aggressive">Aggressive Growth</option>
                <option value="conservative">Conservative Yield</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-[var(--text-muted)]">HISTORICAL DATA HORIZON (DAYS)</label>
              <input 
                type="range"
                min="7" max="365" step="1"
                value={days}
                onChange={e => setDays(parseInt(e.target.value))}
                className="w-full accent-[var(--blue-bright)]"
              />
              <span className="text-[9px] font-mono text-[var(--blue-bright)] text-right">{days} DAYS</span>
            </div>

            <button 
              onClick={runModel}
              disabled={isInferring}
              className={`mt-4 w-full py-2.5 rounded font-display text-[11px] font-bold tracking-widest transition-all ${
                isInferring 
                  ? 'bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--surface-border)]' 
                  : 'bg-[var(--blue-accent)] text-white hover:bg-[var(--blue-bright)] shadow-[0_0_15px_var(--blue-glow)]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {isInferring ? <Cpu className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isInferring ? 'EXECUTING PIPELINE...' : 'EXECUTE INFERENCE'}
              </div>
            </button>

          </div>

          {/* Terminal / Output area */}
          <div className="flex-1 bg-[var(--bg-primary)] p-4 flex flex-col relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--blue-glow)]/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest">INFERENCE OUTPUT TERMINAL</span>
            </div>

            <div className="flex-1 bg-[#0A0E17] border border-[var(--surface-border)] rounded p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-[#A0AEC0]">
              <div className="opacity-50 mb-4">
                $ initializing geopuLSe engine...<br/>
                $ connecting to {modelId}...<br/>
                $ awaiting execution trigger...
              </div>

              {isInferring && (
                <div className="text-[var(--blue-bright)] animate-pulse">
                  $ [SYS] Running pipeline for {ticker} using {strategy} strategy over {days} history...<br/>
                  $ [SYS] Streaming weights...
                </div>
              )}

              {result && result.success && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 border-t border-[var(--surface-line)] pt-4">
                  <div className="text-white mb-2">$ [SUCCESS] INFERENCE COMPLETE</div>
                  <div className="text-[var(--blue-bright)] whitespace-pre-wrap">{result.analysis}</div>
                  
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex flex-col gap-1 p-3 bg-[var(--bg-secondary)] border border-[var(--surface-border)] rounded w-48">
                      <span className="text-[9px] text-[var(--text-muted)]">FORECAST CONFIDENCE</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[var(--surface-line)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--blue-bright)]" style={{ width: `${result.confidence}%` }} />
                        </div>
                        <span className="text-sm font-bold text-white">{result.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {result && !result.success && (
                <div className="text-[var(--status-critical)] mt-4">
                  $ [ERROR] {result.error}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
