import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea
} from 'recharts'

const TooltipContent = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null
  const value = payload[0].value ?? 0
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-3 text-sm text-slate-100 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Précision</p>
      <p className="mt-2 text-lg font-semibold text-cyan-300">{Math.round(value * 100)}%</p>
    </div>
  )
}

export default function PrecisionAreaChart({ data = [] }) {
  const chartData = data.map((item, index) => ({
    ...item,
    value: Number(item.value ?? 0)
  }))

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Précision glissante</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Temps réel</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Derniers points de performance du modèle auto-adaptatif.</p>
        </div>
        <span className="rounded-full bg-cyan-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100">Derniers 100 points</span>
      </div>

      <div className="mt-6 h-[420px] min-h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 24, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="precisionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#00D4FF" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} strokeDasharray="4 8" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={16} />
            <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<TooltipContent />} cursor={{ stroke: '#00D4FF', strokeWidth: 2, opacity: 0.25 }} />
            <ReferenceArea y1={0.95} y2={1} fill="rgba(29,158,117,0.08)" />
            <ReferenceArea y1={0.85} y2={0.95} fill="rgba(255,140,66,0.08)" />
            <ReferenceArea y1={0} y2={0.85} fill="rgba(226,75,74,0.08)" />
            <ReferenceLine y={0.9} stroke="#FF8C42" strokeDasharray="4 4" strokeWidth={2} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00D4FF"
              strokeWidth={3}
              fill="url(#precisionGradient)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: '#00D4FF' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  )
}
