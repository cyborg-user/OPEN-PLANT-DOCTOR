'use client'

import { useEffect, useState } from 'react'
import {
  Shield,
  Wifi,
  Satellite,
  Bell,
  Radio,
  Activity,
  Cpu,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchLiveMarket } from '@/lib/api'

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour12: false,
  timeZone: 'UTC',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'short',
  day: '2-digit',
})

const STATUS_INDICATORS = [
  { label: 'DATA FEED', icon: Wifi, status: 'active' },
  { label: 'SAT LINK', icon: Satellite, status: 'active' },
  { label: 'SIGINT', icon: Radio, status: 'active' },
] as const

export default function DashboardHeader({ onOpenCustomAI }: { onOpenCustomAI?: () => void }) {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [marketData, setMarketData] = useState<any>(null)
  
  // Smart Alert Logic: Trigger pulse if market is highly volatile
  const hasAlert = marketData && (Math.abs(marketData.goldChange) > 1.0 || (marketData.stocks && Math.abs(marketData.stocks['S&P 500']?.change) > 1.0));

  useEffect(() => {
    const loadMarket = async () => {
      const data = await fetchLiveMarket();
      if(data) setMarketData(data);
    };
    loadMarket();
    const marketInterval = setInterval(loadMarket, 60000); // 1m

    const updateTime = () => {
      const now = new Date()
      setTime(timeFormatter.format(now))
      setDate(dateFormatter.format(now))
    }
    updateTime()
    const timerInterval = setInterval(updateTime, 1000)
    
    return () => {
      clearInterval(timerInterval)
      clearInterval(marketInterval)
    }
  }, [])

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 bg-[var(--bg-primary)] border-b border-[var(--surface-border)] relative z-50">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8">
          <Shield className="w-6 h-6 text-[var(--blue-bright)]" />
          <div className="absolute inset-0 rounded-full animate-pulse-dot" style={{ boxShadow: '0 0 8px var(--blue-glow)' }} />
        </div>
        <div className="flex flex-col leading-none">
          <h1 className="text-sm font-bold tracking-[0.3em] font-display text-[var(--blue-bright)]">
            GEOPULSE SENTINEL
          </h1>
          <span className="text-[9px] font-display text-[var(--text-muted)] tracking-[0.2em]">
            GLOBAL INTELLIGENCE MONITORING SYSTEM
          </span>
        </div>
      </div>

      {/* Center: Market Ticker & Status */}
      <div className="hidden md:flex items-center gap-6">
        {STATUS_INDICATORS.map(({ label, icon: Icon, status }) => (
          <StatusBadge key={label} icon={<Icon className="w-3 h-3" />} label={label} status={status as any} />
        ))}
        
        {/* Market Data */}
        <div className="flex items-center gap-4 ml-4 border-l border-border pl-4">
          <AnimatePresence mode="popLayout">
            {marketData ? (
               <>
                 <MarketTickerItem 
                   label="GOLD" 
                   price={marketData.goldPrice} 
                   change={marketData.goldChange} 
                   prefix="$" 
                 />
                 <MarketTickerItem 
                   label="S&P 500" 
                   price={marketData.stocks['S&P 500']?.price} 
                   change={marketData.stocks['S&P 500']?.change} 
                 />
               </>
            ) : (
               <div className="text-[10px] font-mono text-muted-foreground animate-pulse">CONNECTING MARKET FEED...</div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Time + Alerts */}
      <div className="flex flex-col items-end leading-none min-w-[80px]">
        <div className="flex items-center gap-4 mb-2 mt-1">
          <button 
            onClick={onOpenCustomAI}
            className="flex flex-row items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--blue-bright)] bg-[var(--blue-bright)]/10 text-[var(--blue-bright)] hover:bg-[var(--blue-bright)]/20 transition-colors shadow-[0_0_10px_var(--blue-glow)]"
          >
            <Cpu className="w-3 h-3" />
            <span className="text-[9px] font-display font-bold tracking-widest hidden sm:inline text-[var(--blue-bright)]">CUSTOM ML SPACE</span>
          </button>
          <div className="relative">
            <Bell className={`w-4 h-4 transition-colors ${hasAlert ? 'text-[var(--status-critical)]' : 'text-[var(--text-muted)]'}`} />
            {hasAlert && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--status-critical)] animate-pulse-dot" />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-mono text-[var(--text-secondary)] tracking-wider animate-data-flicker">
            {time}
          </span>
          <span className="text-[12px] font-mono text-[var(--text-secondary)] tracking-wider">
            {date} UTC
          </span>
        </div>
      </div>
    </header>
  )
}

function MarketTickerItem({ label, price, change, prefix = '' }: any) {
  if (price === undefined || price === null) return null;
  const isPositive = change > 0;
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, filter: "blur(5px)" }}
      layout
      className="flex flex-col"
    >
      <span className="text-[9px] font-mono text-[var(--text-secondary)] tracking-widest">{label}</span>
      <div className="flex items-center gap-1.5">
        <motion.span 
          key={price}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[13px] font-mono font-bold text-[var(--text-primary)]"
        >
          {prefix}{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </motion.span>
        <span className={`text-[10px] font-mono ${isPositive ? 'text-[var(--status-low)]' : 'text-[var(--status-critical)]'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </span>
      </div>
    </motion.div>
  )
}

const STATUS_COLORS = {
  active: { bg: 'bg-[var(--status-low)]', text: 'text-[var(--status-low)]' },
  warning: { bg: 'bg-[var(--status-medium)]', text: 'text-[var(--status-medium)]' },
  offline: { bg: 'bg-[var(--status-critical)]', text: 'text-[var(--status-critical)]' },
} as const

function StatusBadge({ icon, label, status }: any) {
  const { bg, text } = STATUS_COLORS[status as keyof typeof STATUS_COLORS]

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-1.5 w-1.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${bg}`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${bg}`} style={{ boxShadow: '0 0 6px currentColor' }}/>
      </span>
      <span className={text} style={{ color: "var(--status-low)" }}>{icon}</span>
      <span className="text-[11px] font-sans text-[var(--text-secondary)] tracking-wider">{label}</span>
    </div>
  )
}
