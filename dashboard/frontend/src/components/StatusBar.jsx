import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import ResetButton from './ResetButton'

const formatUptime = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
}

export default function StatusBar({ online, currentModel, step, uptimeSeconds, totalPredictions, totalDrifts, loading, averagePrecision, onReset }) {
  const [clock, setClock] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 shadow-[0_0_20px_rgba(0,212,255,0.12)]">
            <Clock3 className="h-4 w-4" /> Rapidité / Monitoring
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Tableau de bord</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">Surveillance AutoML</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Visualisez les KPI courants, l'état des modèles, les dérives réseau et la santé système en temps réel.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {[
            { label: 'Précision moyenne', value: `${Math.round((averagePrecision || 0) * 100)}%`, glow: 'text-cyan-200' },
            { label: 'Étape actuelle', value: step.toLocaleString(), glow: 'text-violet-200' },
            { label: 'Prédictions', value: totalPredictions.toLocaleString(), glow: 'text-rose-200' },
            { label: 'Dérives', value: totalDrifts.toLocaleString(), glow: 'text-orange-200' }
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 shadow-[0_15px_45px_rgba(15,23,42,0.22)]">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{item.label}</p>
              <p className={`mt-3 text-3xl font-semibold ${item.glow}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 shadow-[0_15px_45px_rgba(15,23,42,0.18)]">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Heure</p>
          <p className="mt-2 text-2xl font-semibold text-white">{clock.toLocaleTimeString()}</p>
        </div>
        <div className="flex flex-col items-start gap-4 sm:items-end">
          <ResetButton onReset={onReset} />
          <p className="text-sm text-slate-400">Statut API : {loading ? 'Mise à jour...' : online ? 'Connectée' : 'Hors ligne'}</p>
        </div>
      </div>
    </section>
  )
}
