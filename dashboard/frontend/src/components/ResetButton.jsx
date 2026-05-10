import { useEffect, useState } from 'react'
import axios from 'axios'
import { AlertTriangle, CheckCircle2, Loader2, RefreshCcw } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const api = axios.create({ baseURL: API_BASE, timeout: 6000 })

export default function ResetButton({ onReset }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3800)
    return () => clearTimeout(timer)
  }, [toast])

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await api.post('/reset')
      setToast({ type: 'success', message: 'Bandit réinitialisé avec succès.' })
      onReset?.()
      setOpen(false)
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Impossible de contacter l’API de reset.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-3 rounded-3xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(239,68,68,0.22)] transition hover:scale-[1.02] hover:bg-rose-400"
      >
        <RefreshCcw className="h-5 w-5" /> Reset du Bandit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold text-white">Confirmer le reset</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Cette opération remet le bandit à zéro et relance la sélection des modèles.</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(239,68,68,0.24)] transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <AlertTriangle className="h-5 w-5" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3 text-sm text-white">
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <AlertTriangle className="h-5 w-5 text-rose-300" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  )
}
