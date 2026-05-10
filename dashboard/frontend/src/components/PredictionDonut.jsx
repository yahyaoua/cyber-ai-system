import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'

export default function PredictionDonut({ data = [], total = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.22 }}
      className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-teal-300/80">Prédictions</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Normal vs Attaque</h2>
        </div>
        <span className="rounded-full bg-slate-900/60 px-3 py-2 text-xs uppercase tracking-[0.35em] text-slate-300">Total</span>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="85%" paddingAngle={4} startAngle={90} endAngle={-270} animationBegin={0} animationDuration={1000} animationEasing="ease-out">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center">
        <p className="text-5xl font-semibold text-white">{total.toLocaleString()}</p>
        <p className="mt-2 text-sm text-slate-400">Prédictions totales</p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-300">
        {data.map((item) => (
          <div key={item.name} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </div>
        ))}
      </div>
    </motion.section>
  )
}
