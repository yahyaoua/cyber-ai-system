import { Cpu, Database, Zap, Clock } from 'lucide-react'

const latencyColor = (latency) => {
  if (latency < 50) return 'text-emerald-400'
  if (latency < 200) return 'text-amber-400'
  return 'text-rose-400'
}

const formatUptime = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
}

export default function SystemCard({ metrics }) {
  const cpu = Number(metrics.cpu ?? 0)
  const ram = Number(metrics.ram ?? 0)
  const latency = Number(metrics.latency ?? 0)
  const uptime = formatUptime(Number(metrics.uptime ?? 0))

  return (
    <section className="rounded-[32px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.55)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Statut système</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Performance serveur</h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-[28px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.65)] p-5 shadow-[0_20px_50px_rgba(59,130,246,0.12)]">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/15 text-blue-300">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">CPU</p>
              <p className="mt-2 text-3xl font-semibold text-white font-mono">{cpu.toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-900">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.min(cpu, 100)}%` }} />
          </div>
        </article>

        <article className="rounded-[28px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.65)] p-5 shadow-[0_20px_50px_rgba(34,197,94,0.12)]">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-300">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">RAM</p>
              <p className="mt-2 text-3xl font-semibold text-white font-mono">{ram.toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-900">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" style={{ width: `${Math.min(ram, 100)}%` }} />
          </div>
        </article>

        <article className="rounded-[28px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.65)] p-5 shadow-[0_20px_50px_rgba(239,68,68,0.12)]">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-rose-500/15 text-rose-300">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Latence moyenne</p>
              <p className={`mt-2 text-3xl font-semibold font-mono ${latencyColor(latency)}`}>{latency.toFixed(0)} ms</p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.65)] p-5 shadow-[0_20px_50px_rgba(6,182,212,0.12)]">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/15 text-cyan-300">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Uptime</p>
              <p className="mt-2 text-3xl font-semibold text-white font-mono">{uptime}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
