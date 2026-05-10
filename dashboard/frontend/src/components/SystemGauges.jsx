import { Clock3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Line, LineChart, PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'

const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const getLatencyTone = (latency) => {
  if (latency >= 200) return { label: 'Critique', color: '#E24B4A' }
  if (latency >= 120) return { label: 'Tension', color: '#FF8C42' }
  return { label: 'Stable', color: '#1D9E75' }
}

export default function SystemGauges({ metrics = {}, latencyHistory = [], stats = {} }) {
  const cpuData = [{ name: 'cpu', value: Math.min(100, Math.max(0, metrics.cpu_percent || 0)) }]
  const ramData = [{ name: 'ram', value: Math.min(100, Math.max(0, metrics.ram_percent || 0)) }]
  const latencyTone = getLatencyTone(metrics.latence_moy_ms)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">CPU</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Utilisation</h3>
          </div>
          <span className="text-sm text-slate-400">Seuil 80%</span>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="72%" outerRadius="100%" data={cpuData} startAngle={180} endAngle={0}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={20} fill="#00D4FF" background={{ fill: 'rgba(255,255,255,0.08)' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-6 text-3xl font-semibold text-white">{Math.round(metrics.cpu_percent || 0)}%</p>
        <p className="mt-2 text-sm text-slate-400">Charge processeur moyenne en temps réel.</p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-violet-300/80">RAM</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Consommation</h3>
          </div>
          <span className="text-sm text-slate-400">Seuil 85%</span>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="72%" outerRadius="100%" data={ramData} startAngle={180} endAngle={0}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={20} fill="#7F77DD" background={{ fill: 'rgba(255,255,255,0.08)' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-6 text-3xl font-semibold text-white">{Math.round(metrics.ram_percent || 0)}%</p>
        <p className="mt-2 text-sm text-slate-400">Utilisation mémoire en temps réel.</p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16 }}
        className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Latence</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Temps de réponse</h3>
          </div>
          <span className="text-sm font-semibold uppercase" style={{ color: latencyTone.color }}>
            {latencyTone.label}
          </span>
        </div>
        <p className="text-5xl font-semibold text-white">{Math.round(metrics.latence_moy_ms || 0)}<span className="text-base font-medium text-slate-400"> ms</span></p>
        <p className="mt-3 text-sm text-slate-400">Temps moyen de traitement des prédictions.</p>

        <div className="mt-6 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latencyHistory.slice(-20)} margin={{ top: 5, right: 6, left: 0, bottom: 0 }}>
              <Line type="monotone" dataKey="value" stroke="#FF8C42" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-teal-300/80">Uptime</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Disponibilité</h3>
          </div>
          <Clock3 className="h-5 w-5 text-cyan-300" />
        </div>
        <p className="text-5xl font-semibold text-white">{formatDuration(metrics.uptime_secondes)}</p>
        <p className="mt-3 text-sm text-slate-400">Durée totale depuis le démarrage du service.</p>
      </motion.section>
    </div>
  )
}
