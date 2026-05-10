import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { useMemo } from 'react'

const tooltipFormatter = (value) => [`${Math.round(value * 100)}%`, 'Précision']
const labelFormatter = (label) => `Heure ${label}`

export default function PrecisionChart({ data = [] }) {

  // 🔥 FIX : nouvelle référence + sécurité
  const chartData = useMemo(() => {
    return Array.isArray(data) ? [...data] : []
  }, [data])

  return (
    <section className="rounded-[32px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.6)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
      
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-slate-500">
            Précision glissante
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Précision en temps réel
          </h2>
        </div>

        <span className="rounded-full bg-rose-500/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-rose-300">
          Seuil 90%
        </span>
      </div>

      <div className="h-[360px] w-full rounded-[24px] border border-[rgba(56,189,248,0.12)] bg-[#020617]/70 p-3 shadow-[0_0_40px_rgba(56,189,248,0.16)]">
        
        <ResponsiveContainer width="100%" height="100%">
          
          {/* 🔥 UTILISER chartData */}
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 20, left: 0, bottom: 0 }}
          >
            
            <defs>
              <linearGradient id="precisionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.84} />
                <stop offset="90%" stopColor="#06b6d4" stopOpacity={0.08} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#334155" vertical={false} strokeDasharray="4 4" />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />

            <YAxis
              domain={[0, 1]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${Math.round(value * 100)}%`}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />

            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={labelFormatter}
              contentStyle={{
                background: '#020617',
                border: '1px solid rgba(56, 189, 248, 0.22)',
                color: '#f8fafc'
              }}
              labelStyle={{ color: '#94a3b8' }}
            />

            <ReferenceLine
              y={0.9}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{
                position: 'insideTop',
                value: 'ALERTE 0.90',
                fill: '#ef4444',
                fontSize: 12
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              fill="url(#precisionGradient)"
              strokeWidth={3}
              activeDot={{
                r: 6,
                stroke: '#020617',
                strokeWidth: 3,
                fill: '#38bdf8'
              }}
              animationDuration={600} // 🔥 plus fluide
              isAnimationActive={true}
            />
          </AreaChart>

        </ResponsiveContainer>
      </div>
    </section>
  )
}