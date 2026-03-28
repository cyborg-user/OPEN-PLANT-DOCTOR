'use client'

import { useState, useEffect } from 'react'
import {
  Flame,
  CloudLightning,
  Crosshair,
  TrendingUp,
  Plane,
  Satellite,
  ShieldAlert,
  Globe,
  AlertTriangle,
  Activity,
  Zap,
  BarChart3,
} from 'lucide-react'
import { globalStats } from '@/lib/dashboard-data'
import type { FilterState } from '@/lib/dashboard-data'
import { fetchLiveMarket } from '@/lib/api'

interface LeftSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export default function LeftSidebar({ filters, onFiltersChange }: LeftSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [marketData, setMarketData] = useState<any>(null)

  useEffect(() => {
    const getMarket = async () => {
      const data = await fetchLiveMarket();
      if (data) setMarketData(data);
    };
    getMarket();
    const interval = setInterval(getMarket, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  const filterItems = [
    { key: 'earthquakes' as const, label: 'SEISMIC', icon: Activity, color: '#FFC107', count: 24 },
    { key: 'wildfires' as const, label: 'WILDFIRE', icon: Flame, color: '#FF3B3B', count: 342 },
    { key: 'storms' as const, label: 'STORMS', icon: CloudLightning, color: '#00E5FF', count: 18 },
    { key: 'conflicts' as const, label: 'CONFLICT', icon: Crosshair, color: '#FF3B3B', count: 8 },
    { key: 'markets' as const, label: 'MARKETS', icon: TrendingUp, color: '#FFD700', count: 5 },
    { key: 'flights' as const, label: 'FLIGHTS', icon: Plane, color: '#00E5FF', count: 12847 },
    { key: 'satellites' as const, label: 'SAT FEEDS', icon: Satellite, color: '#00FF88', count: 14 },
  ]

  const toggleFilter = (key: keyof FilterState) => {
    onFiltersChange({ ...filters, [key]: !filters[key] })
  }

  return (
    <aside className={`${collapsed ? 'w-12' : 'w-60'} shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--surface-border)] flex flex-col transition-all duration-300 overflow-hidden`}>
      {/* Sidebar Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-[var(--surface-border)] shrink-0">
        {!collapsed && (
          <span className="text-[10px] font-display font-semibold text-[var(--text-muted)] tracking-[0.15em]">DATA LAYERS</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-sentinel-cyan transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <BarChart3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
          {/* Data Filters */}
          <div className="flex flex-col gap-1">
            {filterItems.map(item => {
              const Icon = item.icon
              const isActive = filters[item.key as keyof FilterState] ?? true
              return (
                <button
                  key={item.key}
                  onClick={() => toggleFilter(item.key as keyof FilterState)}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: isActive ? 'var(--blue-bright)' : 'currentColor' }} />
                  <span className="text-[13px] font-medium tracking-wider flex-1 text-[var(--text-primary)]">{item.label}</span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: isActive ? item.key === 'flights' ? 'var(--blue-accent)' : item.color : 'transparent',
                      color: isActive ? '#FFFFFF' : undefined,
                    }}
                  >
                    {item.count >= 1000 ? `${(item.count / 1000).toFixed(1)}K` : item.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--surface-border)]" />

          {/* Global Statistics */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-display font-semibold text-[var(--text-muted)] tracking-[0.15em] mb-1">GLOBAL STATS</span>

            <StatRow
              icon={<AlertTriangle className="w-3.5 h-3.5 text-sentinel-red" />}
              label="CRITICAL ALERTS"
              value={globalStats.criticalAlerts.toString()}
              color="#FF3B3B"
            />
            <StatRow
              icon={<Crosshair className="w-3.5 h-3.5 text-[#FF8C00]" />}
              label="ACTIVE CONFLICTS"
              value={globalStats.activeConflicts.toString()}
              color="#FF8C00"
            />
            <StatRow
              icon={<ShieldAlert className="w-3.5 h-3.5 text-sentinel-amber" />}
              label="HIGH RISK ZONES"
              value={globalStats.highRiskCountries.toString()}
              color="#FFC107"
            />
            <StatRow
              icon={<Globe className="w-3.5 h-3.5 text-sentinel-cyan" />}
              label="TOTAL EVENTS"
              value={globalStats.totalEvents.toString()}
              color="#00E5FF"
            />
            <StatRow
              icon={<Zap className="w-3.5 h-3.5 text-sentinel-green" />}
              label="SAT FEEDS"
              value={globalStats.satelliteFeeds.toString()}
              color="var(--status-low)"
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--surface-border)]" />

          {/* Market Tickers */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-display font-semibold text-[var(--text-muted)] tracking-[0.15em] mb-1">MARKET DATA</span>

            {marketData ? (
              <>
                <div className="bg-[var(--bg-elevated)] rounded p-2.5 border border-[var(--surface-border)] hover:border-[var(--blue-accent)] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">GOLD (XAU/USD)</span>
                    <span className={`text-[9px] font-mono ${marketData.goldChange >= 0 ? 'text-[var(--status-low)]' : 'text-[var(--status-critical)]'}`}>
                      {marketData.goldChange >= 0 ? '+' : ''}{marketData.goldChange.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-sm font-mono text-sentinel-gold font-semibold">
                    ${marketData.goldPriceUSD.toFixed(2)}
                  </div>
                  <MiniSparkline data={[2820, 2835, 2828, 2842, 2838, 2845, marketData.goldPriceUSD]} color="var(--status-medium)" />
                </div>
                
                {Object.entries(marketData.stocks).map(([name, data]: [string, any]) => (
                  <div key={name} className="bg-[var(--bg-elevated)] rounded p-2.5 border border-[var(--surface-border)] hover:border-[var(--blue-accent)] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">{name}</span>
                      <span className={`text-[9px] font-mono ${data.change >= 0 ? 'text-[var(--status-low)]' : 'text-[var(--status-critical)]'}`}>
                        {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-sm font-mono text-[var(--blue-bright)] font-semibold">
                      ${data.price.toFixed(2)}
                    </div>
                    {data.history && data.history.length > 0 && (
                      <MiniSparkline data={data.history} color={data.change >= 0 ? "var(--status-low)" : "var(--status-critical)"} />
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="text-[10px] font-mono text-[var(--text-muted)] animate-pulse">CONNECTING TO EXCHANGES...</div>
            )}
          </div>

          {/* Threat Level Gauge */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-sentinel-cyan tracking-[0.2em] mb-1">GLOBAL THREAT LEVEL</span>
            <ThreatGauge level={72} />
          </div>
        </div>
      )}
    </aside>
  )
}

function StatRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      {icon}
      <div className="flex-1 flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
        <span className="text-xs font-mono font-semibold" style={{ color }}>{value}</span>
      </div>
    </div>
  )
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const height = 24
  const width = 100

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-6 mt-1" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#spark-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ThreatGauge({ level }: { level: number }) {
  const getColor = () => {
    if (level >= 80) return '#FF3B3B'
    if (level >= 60) return '#FF8C00'
    if (level >= 40) return '#FFC107'
    return '#00FF88'
  }
  const color = getColor()
  const angle = (level / 100) * 180 - 90

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-full">
        {/* Background arc */}
        <path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none"
          stroke="#1E293B"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(level / 100) * 157} 157`}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
        {/* Needle */}
        <line
          x1="60"
          y1="65"
          x2={60 + 35 * Math.cos((angle * Math.PI) / 180)}
          y2={65 + 35 * Math.sin((angle * Math.PI) / 180)}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />
        {/* Center dot */}
        <circle cx="60" cy="65" r="3" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        {/* Value */}
        <text
          x="60"
          y="55"
          textAnchor="middle"
          fill={color}
          fontSize="14"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {level}
        </text>
      </svg>
      <span className="text-[9px] font-mono text-muted-foreground tracking-widest -mt-1">ELEVATED</span>
    </div>
  )
}
