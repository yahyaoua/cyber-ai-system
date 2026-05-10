import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const api = axios.create({ baseURL: API_BASE, timeout: 6000 })

const MAX_PRECISION_POINTS = 100
const MAX_LATENCY_POINTS = 50
const MAX_DRIFT_LOG = 8

const formatTime = (date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`

const normalizeModelScores = (payload) => {
  if (Array.isArray(payload.scores_modeles)) {
    return payload.scores_modeles.map((item) => ({
      name: item.name ?? String(item[0] ?? 'unknown'),
      score: Number(item.score ?? item[1] ?? 0),
      active: item.name === payload.modele_actif || String(item[0]) === payload.modele_actif
    }))
  }

  return Object.entries(payload.scores_modeles ?? {}).map(([name, value]) => ({
    name,
    score: Number(value ?? 0),
    active: name === payload.modele_actif
  }))
}

const normalizeMetrics = (payload) => ({
  ...payload,
  modele_actif: payload.modele_actif ?? '-',
  scores_modeles: normalizeModelScores(payload),
  total_predictions: Number(payload.total_predictions ?? 0),
  total_dérives: Number(payload.total_dérives ?? 0),
  latence_moy_ms: Number(payload.latence_moy_ms ?? 0),
  step_actuel: Number(payload.step_actuel ?? 0),
  uptime_secondes: Number(payload.uptime_secondes ?? 0),
  cpu_percent: Number(payload.cpu_percent ?? 0),
  ram_percent: Number(payload.ram_percent ?? 0),
  ram_utilisee_mb: Number(payload.ram_utilisee_mb ?? 0),
  historique_dérives: Array.isArray(payload.historique_dérives) ? payload.historique_dérives : [],
  precisions_recentes: Array.isArray(payload.precisions_recentes) ? payload.precisions_recentes : []
})

const normalizeStatus = (payload) => ({
  status: payload.status ?? 'inconnu',
  modele: payload.modele ?? payload.modele_actif ?? '-',
  step: Number(payload.step ?? payload.step_actuel ?? 0)
})

const buildPrecisionPoints = (values = []) =>
  values
    .map((value) => Number(value ?? 0))
    .filter((value) => !Number.isNaN(value))
    .map((value, index, array) => ({
      time: formatTime(new Date(Date.now() - (array.length - index - 1) * 2000)),
      value: Math.min(Math.max(value, 0), 1)
    }))

const mergePrecisionHistory = (current, values = []) => {
  const newPoints = buildPrecisionPoints(values)
  if (newPoints.length === 0) return current
  const merged = [...current, ...newPoints]
  return merged.slice(-MAX_PRECISION_POINTS)
}

const mergeLatencyHistory = (current, latency = 0) => {
  const value = Number(latency ?? 0)
  if (Number.isNaN(value)) return current
  return [...current, { time: formatTime(new Date()), value: Math.max(value, 0) }].slice(-MAX_LATENCY_POINTS)
}

const buildDriftHistory = (steps = []) =>
  [...new Set(steps.map((step) => Number(step)).filter((step) => !Number.isNaN(step)))]
    .slice(-MAX_DRIFT_LOG)
    .reverse()
    .map((step, index) => ({
      id: `drift-${step}-${index}`,
      step,
      label: `Étape ${step}`,
      time: formatTime(new Date(Date.now() - index * 4000))
    }))

const computeStats = (precisionHistory = [], latencyHistory = [], metrics) => {
  const precisionValues = precisionHistory.map((point) => Number(point.value) ?? 0).filter((v) => !Number.isNaN(v))
  const averagePrecision = precisionValues.length ? precisionValues.reduce((sum, next) => sum + next, 0) / precisionValues.length : 0
  return {
    precisionMoyenne: averagePrecision,
    precisionMin: precisionValues.length ? Math.min(...precisionValues) : 0,
    precisionMax: precisionValues.length ? Math.max(...precisionValues) : 0,
    totalAttack: Number(metrics.total_dérives ?? 0),
    totalNormal: Math.max(Number(metrics.total_predictions ?? 0) - Number(metrics.total_dérives ?? 0), 0),
    lastLatency: latencyHistory.length ? latencyHistory[latencyHistory.length - 1].value : 0
  }
}

const initialMetrics = {
  modele_actif: '-',
  scores_modeles: [],
  total_predictions: 0,
  total_dérives: 0,
  latence_moy_ms: 0,
  step_actuel: 0,
  uptime_secondes: 0,
  cpu_percent: 0,
  ram_percent: 0,
  ram_utilisee_mb: 0,
  historique_dérives: [],
  precisions_recentes: []
}

const initialStatus = {
  status: 'inconnu',
  modele: '-',
  step: 0
}

export function useMetrics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState(initialMetrics)
  const [status, setStatus] = useState(initialStatus)
  const [precisionHistory, setPrecisionHistory] = useState([])
  const [latencyHistory, setLatencyHistory] = useState([])
  const [driftHistory, setDriftHistory] = useState([])
  const [online, setOnline] = useState(true)
  const [statsLocales, setStatsLocales] = useState({
    precisionMoyenne: 0,
    precisionMin: 0,
    precisionMax: 0,
    totalAttack: 0,
    totalNormal: 0,
    lastLatency: 0
  })

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await api.get('/metrics')
      const normalized = normalizeMetrics(response.data)

      setMetrics({
        ...normalized,
        _ts: Date.now()
      })

      setPrecisionHistory((current) => mergePrecisionHistory(current, normalized.precisions_recentes))
      setLatencyHistory((current) => mergeLatencyHistory(current, normalized.latence_moy_ms))
      setDriftHistory(buildDriftHistory(normalized.historique_dérives))
      setOnline(true)
      setError(null)
    } catch (err) {
      console.error('❌ metrics error', err)
      setError('API hors ligne')
      setOnline(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStatus = useCallback(async () => {
    try {
      const response = await api.get('/status')
      setStatus(normalizeStatus(response.data))
      setOnline(true)
    } catch (err) {
      console.error('❌ status error', err)
      setOnline(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 2000)
    return () => clearInterval(interval)
  }, [fetchMetrics])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  useEffect(() => {
    setStatsLocales(computeStats(precisionHistory, latencyHistory, metrics))
  }, [precisionHistory, latencyHistory, metrics])

  return {
    metrics,
    status,
    historiquePrecisions: precisionHistory,
    historiqueLatences: latencyHistory,
    driftHistory,
    online,
    error,
    loading,
    statsLocales,
    refresh: () => {
      fetchMetrics()
      fetchStatus()
    }
  }
}
