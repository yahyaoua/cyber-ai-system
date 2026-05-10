import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

const modelStyles = {
  HoeffdingTree: { stroke: '#378ADD', fill: '#378ADD44' },
  KNN_ADWIN: { stroke: '#1D9E75', fill: '#1D9E7544' },
  SGD: { stroke: '#7F77DD', fill: '#7F77DD44' }
}

const buildRadarData = (models = []) => {
  const stats = models.reduce((acc, model) => {
    const base = Math.round((Number(model.score ?? 0) || 0) * 100)
    acc[model.name] = {
      precision: base,
      vitesse: Math.min(100, 70 + Math.round(base * 0.12)),
      stabilite: Math.min(100, 65 + Math.round(base * 0.16)),
      adaptabilite: Math.min(100, 60 + Math.round(base * 0.18))
    }
    return acc
  }, {})

  const statsFields = [
    { subject: 'Précision', key: 'precision' },
    { subject: 'Vitesse', key: 'vitesse' },
    { subject: 'Stabilité', key: 'stabilite' },
    { subject: 'Adaptabilité', key: 'adaptabilite' }
  ]

  return statsFields.map((item) => ({
    subject: item.subject,
    HoeffdingTree: stats.HoeffdingTree?.[item.key] ?? 20,
    KNN_ADWIN: stats.KNN_ADWIN?.[item.key] ?? 20,
    SGD: stats.SGD?.[item.key] ?? 20
  }))
}

export default function ModelsRadarChart({ models = [] }) {
  const data = buildRadarData(models)

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-violet-300/80">Radar modèle</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Comparaison des compétences</h2>
        </div>
      </div>

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="80%">
            <PolarGrid stroke="rgba(148,163,184,0.12)" radialLines={false} />
            <PolarAngleAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} stroke="rgba(148,163,184,0.18)" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="HoeffdingTree" dataKey="HoeffdingTree" stroke={modelStyles.HoeffdingTree.stroke} fill={modelStyles.HoeffdingTree.fill} fillOpacity={0.8} />
            <Radar name="KNN_ADWIN" dataKey="KNN_ADWIN" stroke={modelStyles.KNN_ADWIN.stroke} fill={modelStyles.KNN_ADWIN.fill} fillOpacity={0.8} />
            <Radar name="SGD" dataKey="SGD" stroke={modelStyles.SGD.stroke} fill={modelStyles.SGD.fill} fillOpacity={0.8} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
          <span className="h-2.5 w-2.5 rounded-full bg-[#378ADD]" /> HoeffdingTree
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1D9E75]" /> KNN_ADWIN
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
          <span className="h-2.5 w-2.5 rounded-full bg-[#7F77DD]" /> SGD
        </span>
      </div>
    </motion.section>
  )
}
