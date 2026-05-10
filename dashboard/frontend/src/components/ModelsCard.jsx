import { Activity } from 'lucide-react'

const cardStyles = {
  HoeffdingTree: 'from-blue-500 to-cyan-400 text-blue-300 border-blue-500/30 bg-blue-500/5',
  KNN_ADWIN: 'from-emerald-500 to-teal-400 text-emerald-300 border-emerald-500/30 bg-emerald-500/5',
  SGD: 'from-violet-500 to-fuchsia-500 text-violet-300 border-violet-500/30 bg-violet-500/5'
}

const normalizeScore = (score) => {
  const value = Number(score ?? 0)
  return value > 1 ? Math.min(value, 100) : Math.round(value * 100)
}

export default function ModelsCard({ models = [], activeModel }) {
  return (
    <section className="rounded-[32px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.55)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Ensemble de modèles</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Performances des algorithmes</h2>
        </div>
        <span className="rounded-full border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.65)] px-4 py-2 text-sm font-semibold text-slate-300">Mode Auto-ML</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {models.map((model) => {
          const percentage = normalizeScore(model.score)
          const colorClass = cardStyles[model.name] ?? 'from-slate-500 to-slate-700 text-slate-200 border-slate-500/20'
          const isActive = model.name === activeModel || model.active

          return (
            <article
              key={model.name}
              className="group rounded-[28px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.65)] p-5 shadow-[0_20px_40px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(59,130,246,0.25)]"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{model.name}</p>
                  <p className="mt-3 text-4xl font-semibold text-white font-mono">{percentage}%</p>
                </div>
                {isActive && (
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-[0.65rem] uppercase tracking-[0.3em] text-emerald-300 shadow-[0_0_22px_rgba(34,197,94,0.18)] group-hover:shadow-[0_0_24px_rgba(34,197,94,0.3)]">
                    <Activity className="h-4 w-4" /> ACTIF
                  </span>
                )}
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[rgba(148,163,184,0.12)]">
                <div className={`h-full rounded-full bg-gradient-to-r ${colorClass}`} style={{ width: `${percentage}%` }} />
              </div>

              <p className="mt-4 text-sm text-slate-400">
                Précision projetée <span className="font-medium text-white">{percentage}%</span>
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
