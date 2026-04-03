import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || ''

// ── Risk helpers ──────────────────────────────────────────────
const riskColor = (s) => s >= 0.65 ? '#ff3b30' : s >= 0.35 ? '#ff9500' : '#34c759'
const riskBg    = (s) => s >= 0.65 ? 'rgba(255,59,48,0.10)' : s >= 0.35 ? 'rgba(255,149,0,0.10)' : 'rgba(52,199,89,0.10)'
const riskLabel = (s) => s >= 0.65 ? 'High' : s >= 0.35 ? 'Medium' : 'Low'

// ── Location chips ────────────────────────────────────────────
const CHIPS = [
  { label: 'Peddapalli', icon: '🏘', val: 'peddapalli' },
  { label: 'Godavarikhani', icon: '⛏', val: 'godavarikhani' },
  { label: 'Ramagundam', icon: '🏭', val: 'ramagundam' },
  { label: 'Manthani', icon: '🌿', val: 'manthani' },
  { label: 'Sultanabad', icon: '🏘', val: 'sultanabad' },
  { label: 'Kamanpur', icon: '🌾', val: 'kamanpur' },
  { label: 'Ramagiri', icon: '🌾', val: 'ramagiri' },
  { label: 'Dharmaram', icon: '🏘', val: 'dharmaram' },
  { label: 'Odela', icon: '🌳', val: 'odela' },
  { label: 'Julapalli', icon: '🌾', val: 'julapalli' },
  { label: 'Eligaid', icon: '🌾', val: 'eligaid' },
  { label: 'Palakurthy', icon: '🏘', val: 'palakurthy' },
  { label: 'Srirampur', icon: '🌳', val: 'srirampur' },
  { label: 'NTPC', icon: '⚡', val: 'ntpc' },
  { label: 'Yellampalli', icon: '💧', val: 'yellampalli' },
  { label: 'Katnapalli', icon: '⚠️', val: 'katnapalli' },
]

// ── Inline styles (iOS HIG-inspired) ─────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#f2f2f7',
    fontFamily: "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
    WebkitFontSmoothing: 'antialiased',
    overflowX: 'hidden',
  },
  // Hero header
  hero: {
    background: 'linear-gradient(175deg, #0a0f1e 0%, #0d1f3c 55%, #0f2a50 100%)',
    padding: '56px 20px 40px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', top: -80, left: '50%',
    transform: 'translateX(-50%)',
    width: 320, height: 320,
    background: 'radial-gradient(circle, rgba(0,122,255,0.25) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroIcon: {
    fontSize: 52, marginBottom: 12,
    filter: 'drop-shadow(0 0 20px rgba(0,122,255,0.6))',
    display: 'block',
  },
  heroTitle: {
    fontSize: 28, fontWeight: 700,
    color: '#fff', letterSpacing: -0.5,
    margin: '0 0 6px',
    lineHeight: 1.2,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13, margin: '0 0 20px',
    letterSpacing: 0.1,
  },
  pillRow: {
    display: 'flex', gap: 7,
    justifyContent: 'center',
    flexWrap: 'wrap', marginBottom: 16,
  },
  pill: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 30, padding: '4px 13px',
    fontSize: 11, color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.2,
  },
  statusBadge: (ready) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: ready ? 'rgba(52,199,89,0.15)' : 'rgba(255,149,0,0.15)',
    border: `1px solid ${ready ? 'rgba(52,199,89,0.35)' : 'rgba(255,149,0,0.35)'}`,
    borderRadius: 30, padding: '5px 14px',
    fontSize: 12, fontWeight: 600,
    color: ready ? '#34c759' : '#ff9500',
  }),
  statusDot: (ready) => ({
    width: 7, height: 7, borderRadius: '50%',
    background: ready ? '#34c759' : '#ff9500',
    boxShadow: ready ? '0 0 6px #34c759' : '0 0 6px #ff9500',
    animation: !ready ? 'pulse 1.4s ease-in-out infinite' : 'none',
  }),
  // Card
  card: {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
    overflow: 'visible',
  },
  // Input labels
  label: {
    fontSize: 12, fontWeight: 600,
    letterSpacing: 0.3, textTransform: 'uppercase',
    marginBottom: 7, display: 'block',
  },
  input: (focused) => ({
    width: '100%', padding: '14px 16px',
    borderRadius: 13, boxSizing: 'border-box',
    border: `1.5px solid ${focused ? '#007aff' : 'rgba(0,0,0,0.10)'}`,
    background: focused ? 'rgba(0,122,255,0.03)' : '#f9f9fb',
    fontSize: 15, outline: 'none',
    fontFamily: 'inherit', color: '#1c1c1e',
    transition: 'border-color 0.18s, background 0.18s',
    boxShadow: focused ? '0 0 0 3px rgba(0,122,255,0.12)' : 'none',
  }),
  select: {
    width: '100%', padding: '13px 14px',
    borderRadius: 13, boxSizing: 'border-box',
    border: '1.5px solid rgba(0,0,0,0.10)',
    background: '#f9f9fb', fontSize: 14,
    outline: 'none', fontFamily: 'inherit',
    color: '#1c1c1e', cursor: 'pointer',
    WebkitAppearance: 'none', appearance: 'none',
  },
  // CTA button
  cta: (ready, loading) => ({
    width: '100%', padding: '16px',
    borderRadius: 14, border: 'none',
    background: !ready
      ? '#c7c7cc'
      : loading
      ? 'linear-gradient(90deg, #0055cc, #0066ee)'
      : 'linear-gradient(90deg, #007aff, #0a84ff)',
    color: '#fff', fontWeight: 700,
    fontSize: 16, cursor: ready ? 'pointer' : 'not-allowed',
    fontFamily: 'inherit', letterSpacing: 0.1,
    boxShadow: ready ? '0 6px 20px rgba(0,122,255,0.38)' : 'none',
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  }),
  // Chips
  chip: (active) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: active ? 'rgba(0,122,255,0.12)' : '#f2f2f7',
    border: `1px solid ${active ? 'rgba(0,122,255,0.3)' : 'transparent'}`,
    borderRadius: 30, padding: '6px 13px',
    fontSize: 12.5, cursor: 'pointer',
    color: active ? '#007aff' : '#3c3c43',
    fontWeight: active ? 600 : 500,
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  }),
  // Journey header
  journeyHeader: {
    background: 'linear-gradient(135deg, #0a0f1e 0%, #0d2040 100%)',
    borderRadius: 20, padding: '20px',
    color: '#fff', marginBottom: 12,
  },
  // Tab bar
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    borderRadius: '20px 20px 0 0',
    background: '#fff',
  },
  tab: (active) => ({
    flex: 1, minWidth: 72, padding: '13px 8px',
    border: 'none', background: 'none',
    fontFamily: 'inherit', fontWeight: 600,
    fontSize: 12, cursor: 'pointer',
    color: active ? '#007aff' : '#8e8e93',
    borderBottom: active ? '2px solid #007aff' : '2px solid transparent',
    transition: 'color 0.15s',
    whiteSpace: 'nowrap', outline: 'none',
    letterSpacing: 0.1,
  }),
  tabContent: {
    padding: '18px 16px 24px',
    background: '#fff',
    borderRadius: '0 0 20px 20px',
  },
  // Section heading
  sectionHead: {
    fontWeight: 700, fontSize: 17,
    color: '#1c1c1e', margin: '0 0 16px',
    letterSpacing: -0.2,
  },
  // Best route card
  bestCard: {
    border: '1.5px solid rgba(52,199,89,0.3)',
    borderRadius: 18, padding: '16px',
    background: 'rgba(52,199,89,0.05)',
    marginBottom: 14,
  },
  // Avoid card
  avoidCard: {
    border: '1.5px solid rgba(255,59,48,0.25)',
    borderRadius: 18, padding: '14px 16px',
    background: 'rgba(255,59,48,0.04)',
    marginBottom: 14,
  },
  // Stat row
  statRow: {
    display: 'flex', gap: 8, marginTop: 12,
  },
  statBox: {
    flex: 1, background: 'rgba(0,0,0,0.03)',
    borderRadius: 12, padding: '10px 6px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 3,
    minWidth: 0,
  },
  // Risk bar bg
  barBg: {
    height: 6, background: 'rgba(0,0,0,0.07)',
    borderRadius: 6, overflow: 'hidden',
    marginBottom: 6,
  },
}

// ── Sub-components ────────────────────────────────────────────
function RiskDot({ score, size = 9 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      borderRadius: '50%', background: riskColor(score),
      flexShrink: 0, marginRight: 5,
      boxShadow: `0 0 5px ${riskColor(score)}80`,
    }} />
  )
}

function RiskBadge({ score }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: riskBg(score), color: riskColor(score),
      borderRadius: 30, padding: '4px 11px',
      fontSize: 12, fontWeight: 700,
      border: `1px solid ${riskColor(score)}30`,
      whiteSpace: 'nowrap', letterSpacing: 0.1,
    }}>
      <RiskDot score={score} size={7} />
      {riskLabel(score)}
    </span>
  )
}

function StatBox({ icon, label, value }) {
  return (
    <div style={S.statBox}>
      <span style={{ fontSize: 17 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#1c1c1e' }}>{value}</span>
      <span style={{ fontSize: 10, color: '#8e8e93', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
    </div>
  )
}

function RouteCard({ route }) {
  const [expanded, setExpanded] = useState(false)
  const isRec  = route.recommended
  const isAvoid = !isRec && route.avg_risk_score >= 0.65
  const risk   = route.avg_risk_score ?? 0

  return (
    <div style={{
      border: `1.5px solid ${isAvoid ? 'rgba(255,59,48,0.25)' : isRec ? 'rgba(52,199,89,0.30)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius: 18, padding: '14px 16px',
      background: isAvoid ? 'rgba(255,59,48,0.04)' : isRec ? 'rgba(52,199,89,0.04)' : '#fafafa',
      marginBottom: 12,
    }}>
      {isAvoid && (
        <div style={{ fontSize: 11, fontWeight: 700, color: '#ff3b30', marginBottom: 8, letterSpacing: 0.2 }}>
          🔴 AVOID — HIGHEST RISK
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1c1c1e', marginBottom: 4, lineHeight: 1.3 }}>
            {route.label ?? route.variant?.toUpperCase()}
          </div>
          {isRec && (
            <span style={{
              display: 'inline-block', background: 'rgba(52,199,89,0.12)',
              color: '#34c759', fontSize: 11, fontWeight: 700,
              borderRadius: 8, padding: '2px 9px', marginBottom: 6,
              border: '1px solid rgba(52,199,89,0.25)',
            }}>✅ Recommended</span>
          )}
          <div style={{ fontSize: 12, color: '#8e8e93', lineHeight: 1.6 }}>
            {route.path?.slice(0, 4).join(' → ')}
            {route.path?.length > 4 ? ' → …' : ''}
          </div>
        </div>
        <RiskBadge score={risk} />
      </div>
      <div style={S.statRow}>
        <StatBox icon="📏" label="Distance" value={`${route.distance_km} km`} />
        <StatBox icon="⏱" label="Est. Time" value={`${route.duration_min} min`} />
        <StatBox icon="🎯" label="Risk" value={risk.toFixed(3)} />
        <StatBox icon="📍" label="Hotspots" value={route.hotspots?.length ?? 0} />
      </div>
      {route.hotspots?.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#ff3b30', display: 'flex', alignItems: 'center', gap: 5 }}>
          ⚠️ {route.hotspots.length} fatal hotspot{route.hotspots.length > 1 ? 's' : ''} on this route
        </div>
      )}
      {route.path?.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              marginTop: 10, background: 'none', border: 'none',
              color: '#007aff', fontSize: 12, cursor: 'pointer',
              fontWeight: 600, padding: 0, fontFamily: 'inherit',
            }}
          >
            {expanded ? '▲ Hide segments' : `▼ Show all ${route.path.length} segments`}
          </button>
          {expanded && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {route.coordinates?.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 11px', background: '#f2f2f7', borderRadius: 10, fontSize: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <RiskDot score={c.risk_score} size={8} />
                    <span style={{ color: '#1c1c1e' }}>{c.name}</span>
                    {c.is_hotspot && <span style={{ marginLeft: 5, color: '#ff3b30', fontSize: 10 }}>★</span>}
                  </div>
                  <span style={{ color: riskColor(c.risk_score), fontWeight: 700 }}>
                    {(c.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function RiskSegmentRow({ seg }) {
  const pct = Math.round((seg.risk_score ?? 0) * 100)
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 7 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1c1c1e', flex: 1, minWidth: 0, marginRight: 8 }}>
          {seg.name}
          {seg.is_hotspot && (
            <span style={{ marginLeft: 6, color: '#ff3b30', fontSize: 10, fontWeight: 700 }}>★ HOTSPOT</span>
          )}
        </span>
        <span style={{ fontSize: 18, fontWeight: 800, color: riskColor(seg.risk_score), flexShrink: 0 }}>
          {(seg.risk_score ?? 0).toFixed(2)}
        </span>
      </div>
      <div style={S.barBg}>
        <div style={{
          height: '100%', borderRadius: 6,
          width: `${Math.max(pct, 2)}%`,
          background: riskColor(seg.risk_score),
          transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#8e8e93' }}>
          {pct}% · {seg.road_type} · {seg.mandal}
        </span>
        <RiskBadge score={seg.risk_score} />
      </div>
    </div>
  )
}

function SegmentFactorCard({ seg }) {
  return (
    <div style={{
      border: `1.5px solid ${riskColor(seg.risk_score)}22`,
      borderRadius: 16, padding: '14px 16px',
      background: riskBg(seg.risk_score),
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 14, gap: 6, flex: 1, minWidth: 0 }}>
          <RiskDot score={seg.risk_score} size={11} />
          <span style={{ color: '#1c1c1e' }}>{seg.name}</span>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
          <div style={{ color: riskColor(seg.risk_score), fontWeight: 800, fontSize: 20, lineHeight: 1 }}>
            {Math.round((seg.risk_score ?? 0) * 100)}%
          </div>
          <div style={{ fontSize: 10, color: '#8e8e93' }}>accident risk</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 10 }}>
        {seg.weather ?? 'clear'} · {seg.road_type} · {seg.mandal}
      </div>
      {seg.factors?.length > 0 ? (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#3c3c43' }}>
            Contributing factors (ML detected):
          </div>
          {seg.factors.map((f, i) => (
            <div key={i} style={{
              fontSize: 12, color: '#3c3c43',
              paddingLeft: 10, lineHeight: 1.7,
              borderLeft: `2px solid ${riskColor(seg.risk_score)}40`,
              marginBottom: 2,
            }}>
              {f}
            </div>
          ))}
        </>
      ) : (
        <div style={{ fontSize: 12, color: '#8e8e93', fontStyle: 'italic' }}>
          No dominant single factor — moderate combined conditions.
        </div>
      )}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [source,     setSource]     = useState('')
  const [dest,       setDest]       = useState('')
  const [weather,    setWeather]    = useState('')
  const [time,       setTime]       = useState('now')
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState(null)
  const [error,      setError]      = useState(null)
  const [activeTab,  setActiveTab]  = useState('recommendation')
  const [modelReady, setModelReady] = useState(false)
  const [activeField,setActiveField]= useState(null)
  const resultRef = useRef(null)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get(`${API}/health`)
        if (res.data.model_ready) { setModelReady(true) }
        else { setTimeout(check, 3000) }
      } catch { setTimeout(check, 4000) }
    }
    check()
  }, [])

  const handleChipClick = (val) => {
    if (activeField === 'dest' || (!activeField && source)) {
      setDest(val); setActiveField(null)
    } else {
      setSource(val); setActiveField('dest')
    }
  }

  const handleSubmit = async () => {
    if (!source.trim() || !dest.trim()) { setError('Enter both origin and destination.'); return }
    setLoading(true); setError(null); setResult(null); setActiveTab('recommendation')
    try {
      const res = await axios.post(`${API}/predict-route`, {
        origin: source.trim(),
        destination: dest.trim(),
        weather_condition: weather || null,
        time_of_day: time || 'now',
      })
      setResult(res.data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to compute route. Backend may be waking up — try again.')
    } finally { setLoading(false) }
  }

  const WEATHER_OPTIONS = [
    { value: '', label: '🌐 Auto (Live Weather)' },
    { value: 'clear', label: '☀️ Clear' },
    { value: 'cloudy', label: '⛅ Cloudy' },
    { value: 'rainy', label: '🌧️ Rainy' },
    { value: 'foggy', label: '🌫️ Foggy / Night' },
  ]

  const TABS = [
    { id: 'recommendation', label: '✅ Routes' },
    { id: 'routes',         label: '🗺 Details' },
    { id: 'risk',           label: '📊 Risk' },
    { id: 'explain',        label: '⚠️ Explain' },
  ]

  const bestRoute  = result?.routes?.find(r => r.recommended)
  const worstRoute = result?.routes?.reduce(
    (a, b) => (a.avg_risk_score > b.avg_risk_score ? a : b),
    result?.routes?.[0]
  )
  const riskCutPct = bestRoute && worstRoute && worstRoute.avg_risk_score > 0
    ? Math.round((1 - bestRoute.avg_risk_score / worstRoute.avg_risk_score) * 100)
    : 0

  return (
    <>
      {/* Global keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
        body { background: #f2f2f7; }
        ::-webkit-scrollbar { display: none; }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .fade-up { animation: fadeSlideUp 0.4s cubic-bezier(0.4,0,0.2,1) both; }
        .fade-up-d1 { animation-delay: 0.05s; }
        .fade-up-d2 { animation-delay: 0.10s; }
        .fade-up-d3 { animation-delay: 0.15s; }
        .tab-bar::-webkit-scrollbar { display: none; }
        input::placeholder { color: #c7c7cc; }
        select option { background: #fff; color: #1c1c1e; }
        button:active { transform: scale(0.97); }
      `}</style>

      <div style={S.page}>

        {/* ── HERO ── */}
        <div style={S.hero}>
          <div style={S.heroGlow} />
          <span style={S.heroIcon}>🛣️</span>
          <h1 style={S.heroTitle}>Peddapalli Road Risk AI</h1>
          <p style={S.heroSub}>ML Risk Scoring · Dijkstra Routing · Telangana</p>
          <div style={S.pillRow}>
            {['Random Forest', 'Gradient Boosting', '14-Factor Model', '68 Segments'].map(t => (
              <span key={t} style={S.pill}>{t}</span>
            ))}
          </div>
          <div>
            <div style={S.statusBadge(modelReady)}>
              <span style={S.statusDot(modelReady)} />
              {modelReady ? 'ML Model Ready' : 'Model Training… (~30–60s)'}
            </div>
          </div>
        </div>

        {/* ── PLANNER CARD ── */}
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 14px 80px' }}>
          <div style={{
            ...S.card,
            padding: '22px 18px 20px',
            marginTop: -22,
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          }} className="fade-up">

            <div style={{ fontWeight: 700, fontSize: 18, color: '#1c1c1e', marginBottom: 18, letterSpacing: -0.3 }}>
              Plan Your Journey
            </div>

            {/* Origin */}
            <div style={{ marginBottom: 13 }}>
              <label style={{ ...S.label, color: '#ff3b30' }}>📍 Origin</label>
              <input
                list="loc-list"
                value={source}
                onChange={e => setSource(e.target.value)}
                onFocus={() => setActiveField('source')}
                onBlur={() => setActiveField(f => f === 'source' ? null : f)}
                placeholder="e.g. peddapalli, ramagundam…"
                style={S.input(activeField === 'source')}
              />
            </div>

            {/* Swap button + destination */}
            <div style={{ position: 'relative', marginBottom: 13 }}>
              {/* Swap icon */}
              <button
                onClick={() => { const t = source; setSource(dest); setDest(t) }}
                style={{
                  position: 'absolute', top: -10, right: 14,
                  zIndex: 2, background: '#fff',
                  border: '1.5px solid rgba(0,0,0,0.10)',
                  borderRadius: 30, width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 15,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
                title="Swap origin & destination"
              >⇅</button>
              <label style={{ ...S.label, color: '#8e8e93' }}>🏁 Destination</label>
              <input
                list="loc-list"
                value={dest}
                onChange={e => setDest(e.target.value)}
                onFocus={() => setActiveField('dest')}
                onBlur={() => setActiveField(f => f === 'dest' ? null : f)}
                placeholder="e.g. godavarikhani, ntpc…"
                style={S.input(activeField === 'dest')}
              />
            </div>

            <datalist id="loc-list">
              {['peddapalli','ramagundam','godavarikhani','manthani','sultanabad',
                'kamanpur','ramagiri','dharmaram','srirampur','eligaid','julapalli',
                'palakurthy','odela','mutharam','anthergaon','ntpc','yellampalli','katnapalli'
              ].map(l => <option key={l} value={l} />)}
            </datalist>

            {/* Weather + Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              <div>
                <label style={{ ...S.label, color: '#8e8e93' }}>🌤 Weather</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={weather}
                    onChange={e => setWeather(e.target.value)}
                    style={S.select}
                  >
                    {WEATHER_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <span style={{
                    position: 'absolute', right: 11, top: '50%',
                    transform: 'translateY(-50%)', pointerEvents: 'none',
                    fontSize: 11, color: '#8e8e93',
                  }}>▾</span>
                </div>
              </div>
              <div>
                <label style={{ ...S.label, color: '#8e8e93' }}>⏱ Departure</label>
                <input
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  placeholder="now · 08:30 · 22:00"
                  style={S.input(false)}
                />
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={loading || !modelReady}
              style={S.cta(modelReady, loading)}
            >
              {loading
                ? <><span style={{ animation: 'pulse 1s infinite' }}>⏳</span> Computing Routes…</>
                : '🔍 Get ML Route Recommendation'}
            </button>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 12, background: 'rgba(255,59,48,0.07)',
                color: '#ff3b30', borderRadius: 12, padding: '11px 14px',
                fontSize: 13, border: '1px solid rgba(255,59,48,0.2)',
              }}>
                ❌ {error}
              </div>
            )}

            {/* Location chips */}
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 12, color: '#8e8e93', margin: '0 0 10px', fontWeight: 500 }}>
                Tap to set origin → destination:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {CHIPS.map(chip => {
                  const isOrig = source === chip.val
                  const isDest = dest === chip.val
                  return (
                    <button
                      key={chip.val}
                      onClick={() => handleChipClick(chip.val)}
                      style={S.chip(isOrig || isDest)}
                    >
                      {chip.icon} {chip.label}
                      {isOrig && <span style={{ color: '#ff3b30', fontWeight: 700 }}>·A</span>}
                      {isDest && <span style={{ color: '#007aff', fontWeight: 700 }}>·B</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── RESULTS ── */}
          {result && (
            <div ref={resultRef} style={{ marginTop: 14 }} className="fade-up">

              {/* Journey header */}
              <div style={S.journeyHeader}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Peddapalli District · ML Risk Analysis
                </div>
                <h2 style={{ fontWeight: 800, fontSize: 18, margin: '0 0 10px', lineHeight: 1.2, color: '#fff' }}>
                  🏘 {result.origin} → 🏘 {result.destination}
                </h2>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>
                  <span>⏰ {time || 'now'}</span>
                  <span>🌤 {result.weather?.condition?.toUpperCase()}</span>
                  {result.weather?.temperature_c !== 'N/A' && (
                    <span>🌡 {result.weather.temperature_c}°C</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#34c759', flexWrap: 'wrap' }}>
                  <span>🗺 {result.routes?.length} routes computed</span>
                  <span>🤖 {result.model_name} · {(result.model_accuracy * 100).toFixed(1)}% acc</span>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ ...S.card, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div className="tab-bar" style={S.tabBar}>
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={S.tab(activeTab === tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={S.tabContent}>

                  {/* ── RECOMMENDATION TAB ── */}
                  {activeTab === 'recommendation' && (
                    <div className="fade-up">
                      <p style={S.sectionHead}>ML Recommendation</p>

                      {bestRoute && (
                        <div style={S.bestCard}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#34c759', marginBottom: 6, letterSpacing: 0.3 }}>
                            ✅ TAKE THIS ROUTE
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 17, color: '#1c1c1e', marginBottom: 8, lineHeight: 1.3 }}>
                            {bestRoute.label}
                          </div>
                          {bestRoute.path?.length > 0 && (
                            <div style={{
                              background: '#fff', borderRadius: 11, padding: '9px 13px',
                              fontSize: 12.5, color: '#3c3c43', lineHeight: 1.7, marginBottom: 12,
                            }}>
                              <span style={{ color: '#8e8e93', fontWeight: 500 }}>Via: </span>
                              {bestRoute.path.join(' → ')}
                            </div>
                          )}
                          <div style={S.statRow}>
                            <StatBox icon="📏" label="Distance"  value={`${bestRoute.distance_km} km`} />
                            <StatBox icon="⏱" label="Est. Time" value={`${bestRoute.duration_min} min`} />
                            <StatBox icon="🎯" label="Risk Score" value={(bestRoute.avg_risk_score ?? 0).toFixed(3)} />
                            <StatBox icon="✂️" label="Risk Cut"  value={`-${riskCutPct}%`} />
                          </div>
                          {result.recommendation && (
                            <div style={{
                              marginTop: 12, background: '#fff', borderRadius: 12,
                              padding: '11px 14px', fontSize: 13, color: '#1c1c1e', lineHeight: 1.7,
                              border: '1px solid rgba(0,0,0,0.06)',
                            }}>
                              💡 {result.recommendation}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Worst route */}
                      {worstRoute && worstRoute.label !== bestRoute?.label && (
                        <div style={S.avoidCard}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#ff3b30', marginBottom: 6, letterSpacing: 0.3 }}>
                            🔴 AVOID — HIGHEST RISK
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#1c1c1e', marginBottom: 4 }}>
                            {worstRoute.label}
                          </div>
                          <div style={{ fontSize: 12, color: '#8e8e93' }}>
                            Risk: {worstRoute.avg_risk_score?.toFixed(3)} · {worstRoute.distance_km} km · {worstRoute.duration_min} min
                          </div>
                        </div>
                      )}

                      {/* Comparison table */}
                      {result.routes?.length > 0 && (
                        <div style={{
                          background: '#fff', borderRadius: 16,
                          border: '1px solid rgba(0,0,0,0.07)',
                          overflowX: 'auto',
                        }}>
                          <div style={{ padding: '13px 16px', fontWeight: 700, fontSize: 14, borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#1c1c1e' }}>
                            All Routes Compared
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: '#f9f9fb' }}>
                                {['Route', 'km', 'min', 'Risk'].map((h, i) => (
                                  <th key={h} style={{
                                    padding: '8px 12px', fontSize: 11, color: '#8e8e93',
                                    textAlign: i === 0 ? 'left' : i === 3 ? 'right' : 'center',
                                    fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase',
                                  }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {result.routes.map((r, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                  <td style={{ padding: '11px 12px', fontSize: 13, color: '#1c1c1e' }}>
                                    {r.recommended && <span style={{ marginRight: 4 }}>✅</span>}
                                    {r.label}
                                  </td>
                                  <td style={{ padding: '11px 6px', fontSize: 13, color: '#3c3c43', textAlign: 'center' }}>{r.distance_km}</td>
                                  <td style={{ padding: '11px 6px', fontSize: 13, color: '#3c3c43', textAlign: 'center' }}>{r.duration_min}</td>
                                  <td style={{ padding: '11px 12px', textAlign: 'right' }}>
                                    <RiskBadge score={r.avg_risk_score} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── ROUTES TAB ── */}
                  {activeTab === 'routes' && (
                    <div className="fade-up">
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#1c1c1e' }}>
                        {result.origin} → {result.destination}
                      </div>
                      <div style={{ fontSize: 13, color: '#8e8e93', marginBottom: 16 }}>
                        {result.routes?.length} route variants computed
                      </div>
                      {result.routes?.map((route, i) => (
                        <RouteCard key={i} route={route} />
                      ))}
                    </div>
                  )}

                  {/* ── RISK TAB ── */}
                  {activeTab === 'risk' && (
                    <div className="fade-up">
                      <p style={S.sectionHead}>Top Risk Segments</p>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 11, fontWeight: 600, color: '#8e8e93',
                        letterSpacing: 0.3, textTransform: 'uppercase',
                        padding: '0 2px', marginBottom: 16,
                      }}>
                        <span>Segment</span>
                        <span>Score · Level</span>
                      </div>
                      {result.top_risk_segments?.map((seg, i) => (
                        <RiskSegmentRow key={i} seg={seg} />
                      ))}
                      {(!result.top_risk_segments || result.top_risk_segments.length === 0) && (
                        <div style={{ color: '#8e8e93', fontSize: 13 }}>No risk breakdown available.</div>
                      )}
                    </div>
                  )}

                  {/* ── EXPLAIN TAB ── */}
                  {activeTab === 'explain' && (
                    <div className="fade-up">
                      <p style={S.sectionHead}>Risk Explanation</p>
                      <p style={{ fontSize: 13, color: '#8e8e93', marginBottom: 16 }}>
                        14-factor ML model analysis per segment
                      </p>
                      {result.top_risk_segments?.map((seg, i) => (
                        <SegmentFactorCard key={i} seg={seg} />
                      ))}
                      {(!result.top_risk_segments || result.top_risk_segments.length === 0) && (
                        <div style={{ color: '#8e8e93', fontSize: 13 }}>No explanation available.</div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            textAlign: 'center', fontSize: 11,
            color: '#c7c7cc', marginTop: 32, lineHeight: 2,
            paddingBottom: 20,
          }}>
            Peddapalli Road Risk AI · Data: NCRB 2023 · Telangana Police<br />
            68 Road Segments · Peddapalli District, Telangana
          </div>
        </div>
      </div>
    </>
  )
}
