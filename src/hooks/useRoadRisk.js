// src/hooks/useRoadRisk.js
import { useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

if (!API_BASE) {
  console.warn('[useRoadRisk] VITE_API_URL is not set — requests will use relative URLs.')
}

export function useRoadRisk() {
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [routeData,   setRouteData]   = useState(null)
  const [heatmapData, setHeatmapData] = useState(null)

  const predictRoute = useCallback(async ({ origin, destination, weather_condition, time_of_day }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/predict-route`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          weather_condition: weather_condition || null,
          time_of_day:       time_of_day       || 'now',
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setRouteData(data)
      return data
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHeatmap = useCallback(async (weather = 'clear') => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/heatmap?weather=${weather}`)
      if (!res.ok) throw new Error('Heatmap fetch failed')
      const data = await res.json()
      setHeatmapData(data.segments)
      return data.segments
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/locations`)
      if (!res.ok) throw new Error('Locations fetch failed')
      return await res.json()
    } catch (e) {
      setError(e.message)
      return null
    }
  }, [])

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`)
      return await res.json()
    } catch (e) {
      // Silently return null — caller handles offline state
      return null
    }
  }, [])

  return {
    loading, error, routeData, heatmapData,
    predictRoute, fetchHeatmap, fetchLocations, checkHealth,
    clearError: () => setError(null),
  }
}
