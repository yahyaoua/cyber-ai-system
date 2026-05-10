import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

export default function DriftTimeline({ events = [] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18 }}
      className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-rose-300/80">Dérives détectées</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Timeline des anomalies</h2>
        </div>
        <span className="rounded-full bg-rose-500/10 px-3 py-2 text-xs uppercase tracking-[0.35em] text-rose-200">Alert</span>
      </div>

      {events.length === 0 ? (
        <div className="mt-8 rounded-[24px] border border-white/10 bg-slate-950/40 p-8 text-center text-sm text-slate-300">
          <p className="text-lg font-semibold text-white">Système stable</p>
          <p className="mt-3 text-slate-400">Aucune dérive récente n'a été détectée.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4 max-h-[420px] overflow-y-auto pr-2">
          {events.map((event, index) => (
            <motion.div
              key={event.id ?? `${event.step}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="flex items-start gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4"
            >
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/15 text-rose-300 shadow-[0_0_20px_rgba(226,75,74,0.25)]">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{event.label || `Étape ${event.step}`}</p>
                  <span className="rounded-full bg-rose-500/10 px-2 py-1 text-[11px] uppercase tracking-[0.3em] text-rose-200">DÉRIVE</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">Heure : {event.time ?? '—'}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  )
}
