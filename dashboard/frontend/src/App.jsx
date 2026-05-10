import { useMetrics } from './hooks/useMetrics'
import Sidebar from './components/Sidebar'
import StatusBar from './components/StatusBar'
import PrecisionAreaChart from './components/PrecisionAreaChart'
import ModelsRadarChart from './components/ModelsRadarChart'
import ModelsBarChart from './components/ModelsBarChart'
import SystemGauges from './components/SystemGauges'
import DriftTimeline from './components/DriftTimeline'
import PredictionDonut from './components/PredictionDonut'
import LatenceLineChart from './components/LatenceLineChart'

export default function App() {
  const {
    metrics,
    status,
    online,
    error,
    loading,
    refresh,
    historiquePrecisions,
    historiqueLatences,
    statsLocales,
    driftHistory
  } = useMetrics()

  const currentModel = metrics.modele_actif || status.modele || '-'
  const totalPred = metrics.total_predictions || 0
  const totalDrifts = metrics.total_dérives || 0
  const donutData = [
    {
      name: 'Normal',
      value: Math.max(totalPred - totalDrifts, 0),
      color: '#1D9E75'
    },
    {
      name: 'Attaque',
      value: totalDrifts,
      color: '#E24B4A'
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f0c29] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.2),_transparent_18%),radial-gradient(circle_at_10%_20%,_rgba(255,107,157,0.16),_transparent_18%)]" />
      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar online={online} averageAccuracy={statsLocales.precisionMoyenne} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <StatusBar
            online={online}
            currentModel={currentModel}
            step={status.step}
            uptimeSeconds={metrics.uptime_secondes}
            totalPredictions={metrics.total_predictions}
            totalDrifts={metrics.total_dérives}
            loading={loading}
            averagePrecision={statsLocales.precisionMoyenne}
            onReset={refresh}
          />

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
            <PrecisionAreaChart data={historiquePrecisions} />
            <div className="grid gap-6">
              <ModelsBarChart models={metrics.scores_modeles} activeModel={currentModel} />
              <ModelsRadarChart models={metrics.scores_modeles} />
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <SystemGauges metrics={metrics} latencyHistory={historiqueLatences} stats={statsLocales} />
            <div className="grid gap-6">
              <DriftTimeline events={driftHistory} />
              <PredictionDonut data={donutData} total={metrics.total_predictions} />
              <LatenceLineChart data={historiqueLatences} />
            </div>
          </div>
        </main>
      </div>

      {error && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#020617]/95 px-4 py-6">
          <div className="w-full max-w-xl rounded-[32px] border border-rose-500/20 bg-[#08101f]/95 p-8 text-center shadow-[0_30px_80px_rgba(239,68,68,0.18)] backdrop-blur-xl">
            <p className="mb-4 text-5xl">⚠️</p>
            <h2 className="text-3xl font-semibold text-white">API hors ligne</h2>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Lance <code className="rounded-xl bg-slate-900 px-2 py-1 text-sm text-slate-200">python src/api/main.py</code>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
