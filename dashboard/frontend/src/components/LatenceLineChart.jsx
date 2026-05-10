import { motion } from 'framer-motion'
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const TooltipContent = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0]
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-3 text-sm text-slate-100 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Latence</p>
      <p className="mt-2 text-lg font-semibold text-orange-300">{Math.round(point.value)} ms</p>
    </div>
  )
}

export default function LatenceLineChart({ data = [] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.28 }}
      className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-orange-300/80">Latence</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Historique réseau</h2>
        </div>
        <span className="rounded-full bg-rose-500/10 px-3 py-2 text-xs uppercase tracking-[0.35em] text-rose-200">Danger 200ms</span>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="4 8" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(value) => `${Math.round(value)}ms`} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TooltipContent />} cursor={{ stroke: '#FF8C42', strokeWidth: 2, opacity: 0.25 }} />
            <ReferenceArea y1={200} y2={data.length ? Math.max(...data.map((item) => item.value), 220) : 220} fill="rgba(226,75,74,0.14)" />
            <Line type="monotone" dataKey="value" stroke="#FF8C42" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  )
}
