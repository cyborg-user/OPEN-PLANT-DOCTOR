'use client'

import { useState, useEffect } from 'react'
import { fetchLiveConflicts } from '@/lib/api'
import { Crosshair, AlertTriangle } from 'lucide-react'

export default function ConflictTracker() {
  const [conflicts, setConflicts] = useState<any[]>([])

  useEffect(() => {
    const fetchIt = async () => {
      const data = await fetchLiveConflicts();
      setConflicts(data);
    };
    fetchIt();
    const intv = setInterval(fetchIt, 60000);
    return () => clearInterval(intv);
  }, []);

  if (conflicts.length === 0) return null;

  return (
    <div className="absolute z-40 bottom-6 left-6 w-72 flex flex-col gap-2 pointer-events-auto">
      <div className="bg-[var(--bg-secondary)] border border-[var(--status-critical)] p-3 rounded shadow-[0_0_15px_rgba(255,59,92,0.15)]">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--surface-border)]">
          <Crosshair className="w-4 h-4 text-[var(--status-critical)] animate-pulse" />
          <span className="text-[12px] font-display font-bold text-[var(--status-critical)] tracking-[0.1em]">ACTIVE HOTSPOTS</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {conflicts.map((c, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[var(--text-primary)] font-semibold">{c.name}</span>
                <span className="text-[9px] font-mono text-[var(--status-critical)] border border-[var(--status-critical)] px-1 py-0.5 rounded capitalize">
                  {c.severity}
                </span>
              </div>
              <span className="text-[9px] font-mono text-[var(--text-muted)] mt-1">
                ACTORS: {c.actors.join(' VS ')}
              </span>
              {c.recentEvents && c.recentEvents.length > 0 && (
                <div className="bg-[var(--bg-elevated)] p-1.5 rounded mt-1 border border-[var(--surface-border)]">
                  <div className="flex gap-1.5 items-start">
                    <AlertTriangle className="w-3 h-3 text-[var(--blue-bright)] shrink-0 mt-0.5" />
                    <span className="text-[10px] font-sans text-[var(--text-secondary)] line-clamp-2 leading-snug">
                      {c.recentEvents[0].title}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
