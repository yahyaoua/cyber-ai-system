import { AlertTriangle } from 'lucide-react'

export default function DriftCard({ driftHistory }) {
  return (
    <section className="rounded-[32px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.55)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Dérives détectées</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Historique des alertes</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 shadow-[0_0_30px_rgba(239,68,68,0.18)]">
          <AlertTriangle className="h-4 w-4" /> {driftHistory.length} dérive(s)
        </div>
      </div>

      <div className="space-y-4">
        {driftHistory.length > 0 ? (
          driftHistory.map((item, index) => (
            <div
              key={item.id || index}
              className="animate-fadeIn rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-4 shadow-[inset_0_0_20px_rgba(239,68,68,0.08)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-rose-500/20 text-rose-200 shadow-[0_0_20px_rgba(239,68,68,0.22)]">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Dérive réseau</p>
                    <p className="mt-1 text-lg font-semibold text-white">{item.label || `Étape ${item.step}`}</p>
                  </div>
                </div>
                <span className="rounded-full bg-rose-500/15 px-3 py-2 text-xs uppercase tracking-[0.3em] text-rose-200">DÉRIVE</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/10 p-6 text-center text-sm text-emerald-100 shadow-[0_0_25px_rgba(34,197,94,0.12)]">
            Aucune dérive détectée. Le flux reste stable.
          </div>
        )}
      </div>
    </section>
  )
}
