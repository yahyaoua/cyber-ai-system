import { motion } from 'framer-motion'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const modelColors = {
  HoeffdingTree: '#378ADD',
  KNN_ADWIN: '#1D9E75',
  SGD: '#7F77DD'
}

const TooltipContent = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-3 text-sm text-slate-100 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{item.name}</p>
      <p className="mt-2 text-lg font-semibold text-white">{item.value}%</p>
    </div>
  )
}

export default function ModelsBarChart({ models = [], activeModel }) {
  const data = models.map((model) => ({
    name: model.name,
    score: Math.round((Number(model.score) || 0) * 100),
    active: model.name === activeModel
  }))

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-violet-300/80">Scores modèles</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Performance en pourcentage</h2>
        </div>
        <span className="rounded-full bg-slate-900/60 px-3 py-2 text-xs uppercase tracking-[0.35em] text-slate-300">Actif: {activeModel}</span>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 13 }} width={110} />
            <Tooltip content={<TooltipContent />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="score" barSize={20} radius={[20, 20, 20, 20]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={modelColors[entry.name] ?? '#8b5cf6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 space-y-3">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: modelColors[entry.name] }} />
              <span>{entry.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{entry.score}%</span>
              {entry.active && <span className="inline-flex rounded-full bg-cyan-400/15 px-2 py-1 text-xs uppercase tracking-[0.25em] text-cyan-100">ACTIF</span>}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
