import { Activity, Cpu, Disc3, ShieldCheck, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { label: 'Dashboard', icon: Activity },
  { label: 'Modèles', icon: Disc3 },
  { label: 'Dérives', icon: ShieldCheck },
  { label: 'Système', icon: Cpu }
]

export default function Sidebar({ online, averageAccuracy }) {
  return (
    <aside className="hidden min-h-screen w-[320px] shrink-0 border-r border-white/10 bg-[rgba(15,12,41,0.92)] backdrop-blur-2xl px-6 py-8 text-slate-200 lg:flex flex-col justify-between">
      <div className="space-y-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300 shadow-[0_0_30px_rgba(0,212,255,0.16)]">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">CYBER</p>
              <h1 className="text-3xl font-black text-white">CYBER AI</h1>
            </div>
          </div>
          <p className="max-w-[17rem] text-sm leading-6 text-slate-400">
            Monitoring temps réel du détecteur AutoML pour trafic réseau et détection d’intrusions.
          </p>
        </div>

        <nav className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-cyan-400/20 hover:bg-cyan-400/10"
              >
                <Icon className="h-5 w-5 text-cyan-300" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-cyan-400/15 bg-white/5 p-6 shadow-[0_0_45px_rgba(0,212,255,0.14)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Précision globale</p>
              <p className="mt-3 text-4xl font-semibold text-white">{Math.round((averageAccuracy || 0) * 100)}%</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 to-violet-500/20 ring-1 ring-cyan-300/20"
            >
              <span className="absolute inset-0 rounded-full border border-white/10" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#0f0c29]/90 text-sm font-semibold text-cyan-100 shadow-[0_0_20px_rgba(0,212,255,0.24)]">
                <span>{Math.round((averageAccuracy || 0) * 100)}%</span>
              </div>
            </motion.div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">Rafraîchi en continu toutes les 2 secondes.</p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.35em] text-slate-500">API</span>
            <span
              className={`inline-flex h-3.5 w-3.5 rounded-full ${
                online ? 'bg-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.35)]' : 'bg-rose-400 shadow-[0_0_20px_rgba(239,68,68,0.35)]'
              }`}
            />
          </div>
          <p className="mt-4 text-2xl font-semibold text-white">{online ? 'Connectée' : 'Hors ligne'}</p>
          <p className="mt-2 text-sm text-slate-400">Statut du backend FastAPI et connexion réseau.</p>
        </div>
      </div>
    </aside>
  )
}
