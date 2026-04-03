// src/components/Sidebar.jsx
import React, { useState } from 'react'
import {
  MapPin, Navigation, Cloud, Clock, AlertTriangle,
  ChevronRight, Shield, Zap, Scale, Info,
  TrendingUp, Loader2,
} from 'lucide-react'

const WEATHER_OPTIONS = [
  { value: '',       label: 'Auto (Live Weather)', emoji: '🌐' },
  { value: 'clear',  label: 'Clear',               emoji: '☀️' },
  { value: 'cloudy', label: 'Cloudy',               emoji: '⛅' },
  { value: 'rainy',  label: 'Rainy',                emoji: '🌧️' },
  { value: 'foggy',  label: 'Foggy / Night',        emoji: '🌫️' },
]

const LOCATION_LIST = [
  'peddapalli','ramagundam','godavarikhani','manthani',
  'sultanabad','kamanpur','ramagiri','dharmaram',
  'srirampur','eligaid','julapalli','palakurthy',
  'odela','mutharam','anthergaon','ntpc','yellampalli','katnapalli',
]

const VARIANT_META = {
  safest:   { Icon: Shield, accent: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',  label: '🛡 SAFEST'   },
  fastest:  { Icon: Zap,    accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', label: '⚡ FASTEST'  },
  balanced: { Icon: Scale,  accent: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)', label: '⚖ BALANCED' },
}

function RiskBadge({ label }) {
  const cls = label === 'Low Risk'    ? 'risk-low'
            : label === 'Medium Risk' ? 'risk-medium'
            : 'risk-high'
  return (
    <span className={`${cls} text-xs font-medium px-2 py-0.5 rounded-full font-display`}>
      {label}
    </span>
  )
}

function RouteCard({ route, isActive, onClick }) {
  const m = VARIANT_META[route.variant] || VARIANT_META.balanced
  const { Icon } = m
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-3 transition-all duration-150 border"
      style={{
        background:   isActive ? m.bg : 'rgba(255,255,255,0.02)',
        borderColor:  isActive ? m.border : 'rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Icon size={13} style={{ color: m.accent }} />
          <span className="text-xs font-display font-medium" style={{ color: m.accent }}>
            {m.label}
          </span>
          {route.recommended && (
            <span className="text-[10px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 px-1.5 py-0.5 rounded-full">
              ★ REC
            </span>
          )}
        </div>
        <RiskBadge label={route.risk_label} />
      </div>

      <div className="grid grid-cols-3 gap-1 text-center">
        {[
          ['Distance',  `${route.distance_km} km`],
          ['Est. Time', `${route.duration_min} min`],
          ['Risk',      `${(route.avg_risk_score * 100).toFixed(0)}%`],
        ].map(([lbl, val]) => (
          <div key={lbl} className="bg-white/[0.03] rounded-lg py-1.5">
            <div className="text-[10px] text-slate-500 mb-0.5">{lbl}</div>
            <div className="text-xs font-medium text-slate-200">{val}</div>
          </div>
        ))}
      </div>

      {route.hotspots?.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-400">
          <AlertTriangle size={11} />
          <span>{route.hotspots.length} confirmed fatal hotspot{route.hotspots.length > 1 ? 's' : ''}</span>
        </div>
      )}
    </button>
  )
}

export default function Sidebar({
  routeData, loading, error,
  activeRoute, onRouteSelect,
  onSubmit, onHeatmapToggle, heatmapMode, heatmapWeather, onHeatmapWeatherChange,
}) {
  const [origin,  setOrigin]  = useState('peddapalli')
  const [dest,    setDest]    = useState('ramagundam')
  const [weather, setWeather] = useState('')
  const [time,    setTime]    = useState('now')

  const handleSubmit = () => {
    if (!origin.trim() || !dest.trim()) return
    onSubmit({ origin: origin.trim(), destination: dest.trim(), weather_condition: weather, time_of_day: time })
  }

  const selectedRoute = routeData?.routes?.find(r => r.variant === activeRoute)

  return (
    <aside className="w-[300px] flex-shrink-0 h-screen overflow-y-auto flex flex-col gap-3 p-3"
           style={{ background: '#0d1420', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

      <div className="flex items-center gap-3 pt-2 pb-1 px-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
             style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
          🗺️
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100 leading-tight">Road Risk AI</div>
          <div className="text-[11px] text-slate-500">Peddapalli · Telangana</div>
        </div>
      </div>

      <div className="glass rounded-xl p-3 space-y-3">
        <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">Route Query</p>

        <div>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
            <MapPin size={11} className="text-emerald-400" /> Origin
          </label>
          <input
            list="loc-list" className="input-field"
            value={origin} onChange={e => setOrigin(e.target.value)}
            placeholder="e.g. peddapalli"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
            <Navigation size={11} className="text-blue-400" /> Destination
          </label>
          <input
            list="loc-list" className="input-field"
            value={dest} onChange={e => setDest(e.target.value)}
            placeholder="e.g. ramagundam"
          />
        </div>

        <datalist id="loc-list">
          {LOCATION_LIST.map(l => <option key={l} value={l} />)}
        </datalist>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
              <Cloud size={10} /> Weather
            </label>
            <select className="input-field text-xs" value={weather} onChange={e => setWeather(e.target.value)}>
              {WEATHER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
              <Clock size={10} /> Time
            </label>
            <input
              type="text" className="input-field text-xs"
              value={time} onChange={e => setTime(e.target.value)}
              placeholder="now or 22:00"
            />
          </div>
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Analysing...</>
            : <><TrendingUp size={14} /> Predict Route Risk</>
          }
        </button>
      </div>

      <div className="glass rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-display text-slate-400 uppercase tracking-widest">Risk Heatmap</span>
          <button
            onClick={onHeatmapToggle}
            className="relative w-10 h-5 rounded-full transition-colors duration-200"
            style={{ background: heatmapMode ? '#f97316' : 'rgba(255,255,255,0.1)' }}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${heatmapMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {heatmapMode && (
          <select
            className="input-field text-xs"
            value={heatmapWeather}
            onChange={e => onHeatmapWeatherChange(e.target.value)}
          >
            {WEATHER_OPTIONS.filter(o => o.value).map(o => (
              <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="rounded-xl p-3 flex gap-2 text-xs text-red-400"
             style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {routeData && (
        <>
          <div className="glass rounded-xl p-3 space-y-2">
            <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">Analysis Info</p>
            {[
              ['Weather',  `${routeData.weather.condition} · ${routeData.weather.temperature_c}°C`],
              ['Model',    routeData.model_name],
              ['Accuracy', `${(routeData.model_accuracy * 100).toFixed(1)}%`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center text-xs">
                <span className="text-slate-500">{k}</span>
                <span className={`text-slate-300 ${k === 'Accuracy' ? 'text-emerald-400' : ''}`}>{v}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest px-1">Route Variants</p>
            {routeData.routes.map(r => (
              <RouteCard
                key={r.variant}
                route={r}
                isActive={activeRoute === r.variant}
                onClick={() => onRouteSelect(r.variant)}
              />
            ))}
          </div>

          {routeData.recommendation && (
            <div className="rounded-xl p-3"
                 style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <p className="flex items-center gap-1.5 text-[11px] text-blue-400 font-display mb-1.5">
                <Info size={11} /> Recommendation
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{routeData.recommendation}</p>
            </div>
          )}

          {routeData.top_risk_segments?.length > 0 && (
            <div className="glass rounded-xl p-3 space-y-2">
              <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">Top Risk Nodes</p>
              {routeData.top_risk_segments.map((seg, i) => {
                const col = seg.risk_color === 'red' ? '#ef4444'
                          : seg.risk_color === 'orange' ? '#f59e0b' : '#22c55e'
                return (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col }} />
                      <span className="text-xs text-slate-300 truncate">{seg.name}</span>
                      {seg.is_hotspot && <span className="text-[10px] text-red-400 shrink-0">★</span>}
                    </div>
                    <span className="text-xs font-display text-slate-400 shrink-0">
                      {(seg.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {selectedRoute?.top_factors?.length > 0 && (
            <div className="glass rounded-xl p-3 space-y-2">
              <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">Risk Factors</p>
              {selectedRoute.top_factors.slice(0, 5).map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <ChevronRight size={12} className="mt-0.5 text-slate-600 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}

          {selectedRoute?.path?.length > 0 && (
            <div className="glass rounded-xl p-3">
              <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest mb-2">Route Path</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedRoute.path.map((node, i) => {
                  const coord = selectedRoute.coordinates?.find(c => c.name === node)
                  const col   = coord
                    ? (coord.risk_color === 'red' ? '#ef4444' : coord.risk_color === 'orange' ? '#f59e0b' : '#22c55e')
                    : '#94a3b8'
                  const isStart = i === 0
                  const isEnd   = i === selectedRoute.path.length - 1
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0"
                           style={{ background: isStart ? '#22c55e' : isEnd ? '#3b82f6' : col }} />
                      <span className={`truncate ${isStart || isEnd ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                        {node}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="h-4" />
    </aside>
  )
}
