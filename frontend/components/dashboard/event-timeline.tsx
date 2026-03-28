'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Activity,
  Flame,
  CloudLightning,
  Crosshair,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Newspaper
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { eventTypeConfig, severityConfig } from '@/lib/dashboard-data'
import { fetchLiveNews } from '@/lib/api'

const eventIcons: Record<string, React.ReactNode> = {
  earthquake: <Activity className="w-3.5 h-3.5" />,
  wildfire: <Flame className="w-3.5 h-3.5" />,
  storm: <CloudLightning className="w-3.5 h-3.5" />,
  conflict: <Crosshair className="w-3.5 h-3.5" />,
  market: <TrendingUp className="w-3.5 h-3.5" />,
  news: <Newspaper className="w-3.5 h-3.5" />
}

const typeConfSafe = (type: string) => eventTypeConfig[type] || { color: '#888', label: type.toUpperCase() };
const sevConfSafe = (sev: string) => severityConfig[sev] || { color: '#888', bg: 'rgba(136,136,136,0.15)' };

const formatTimestamp = (ts: string) => {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHrs < 1) return 'JUST NOW'
  if (diffHrs < 24) return `${diffHrs}H AGO`
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}D AGO`
}

export default function EventTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [events, setEvents] = useState<any[]>([])

  const loadData = async () => {
    const rawNews = await fetchLiveNews();
    const formatted = rawNews.map((n: any) => ({
      id: n.id,
      type: 'news',
      title: n.title,
      location: n.source,
      timestamp: n.pubDate,
      severity: 'medium',
      link: n.link
    }));
    setEvents(formatted);
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        el.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [checkScroll, events])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = 320
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  return (
    <div className="h-36 shrink-0 bg-[var(--bg-primary)] border-t border-[var(--surface-border)] flex flex-col relative overflow-hidden">
      {/* Timeline Header */}
      <div className="h-8 flex items-center justify-between px-4 border-b border-[var(--surface-border)] shrink-0 z-20 bg-[var(--bg-secondary)] backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue-bright)] animate-pulse-dot" />
          <span className="text-[10px] font-display font-semibold text-[var(--blue-bright)] tracking-[0.2em]">LIVE NEWS FEED</span>
          <span className="text-[9px] font-mono text-[var(--text-muted)] ml-2">{events.length} UPDATES</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--blue-bright)] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--blue-bright)] disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Timeline */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-stretch overflow-x-auto px-4 py-2 gap-3 scrollbar-none relative z-10"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="absolute bottom-[52px] left-4 right-4 h-px bg-border pointer-events-none z-0" />

        <AnimatePresence>
          {events.map((event, i) => (
            <EventCard
              key={event.id}
              event={event}
              icon={eventIcons[event.type]}
              timeAgo={formatTimestamp(event.timestamp)}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>

      {canScrollLeft && (
        <div className="absolute left-0 top-8 bottom-0 w-8 bg-gradient-to-r from-[var(--bg-primary)] to-transparent pointer-events-none z-20" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-8 bottom-0 w-8 bg-gradient-to-l from-[var(--bg-primary)] to-transparent pointer-events-none z-20" />
      )}
    </div>
  )
}

function EventCard({ event, icon, timeAgo, index }: any) {
  const typeConf = typeConfSafe(event.type)
  const sevConf = sevConfSafe(event.severity)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
      className="relative shrink-0 w-64 flex flex-col gap-1.5 p-2.5 rounded bg-[var(--bg-elevated)] border border-[var(--surface-border)] hover:border-[var(--blue-accent)] transition-colors duration-200 group"
      onClick={() => event.link && window.open(event.link, '_blank')}
      style={{ cursor: event.link ? 'pointer' : 'default' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span style={{ color: typeConf.color }}>{icon}</span>
          <span
            className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded uppercase"
            style={{ color: typeConf.color, background: `${typeConf.color}15` }}
          >
            {typeConf.label}
          </span>
        </div>
        <span
          className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider"
          style={{ color: sevConf.color, background: sevConf.bg }}
        >
          {event.severity.toUpperCase()}
        </span>
      </div>

      <p className="text-[12px] font-sans text-[var(--text-primary)] leading-tight line-clamp-2 group-hover:text-[var(--blue-bright)] transition-colors">
        {event.title}
      </p>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-[10px] font-mono text-[var(--text-muted)] truncate max-w-[120px]">{event.location}</span>
        <span className="text-[10px] font-mono text-[var(--blue-bright)] font-bold">{timeAgo}</span>
      </div>

      <div
        className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full z-10"
        style={{
          background: typeConf.color,
          boxShadow: `0 0 6px ${typeConf.color}`,
        }}
      />
    </motion.div>
  )
}
