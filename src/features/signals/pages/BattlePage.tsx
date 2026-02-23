import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import VersusGame from '../components/VersusGame'
import { signalService } from '../services/signalService'
import type { Battle } from '../types'
import { useToast } from '../../../components/ui/useToast'
import { logger } from '../../../lib/logger'

export default function BattlePage() {
    const { battleSlug } = useParams()
    const navigate = useNavigate()
    const { showToast } = useToast()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [battle, setBattle] = useState<Battle | null>(null)

    useEffect(() => {
        let mounted = true

        async function load() {
            if (!battleSlug) {
                setError('Battle slug faltante')
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)

            const ctx = await signalService.resolveBattleContext(battleSlug)

            if (!mounted) return

            if (!ctx.ok || !ctx.battle_id || !ctx.title || !ctx.options || ctx.options.length < 2) {
                setError(ctx.error || 'No se pudo cargar la batalla')
                setBattle(null)
                setLoading(false)
                return
            }

            const options = ctx.options
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .slice(0, 2)
                .map((o) => ({
                    id: o.id,
                    label: o.label,
                    image_url: o.image_url,
                    imageUrl: o.image_url,
                    type: 'brand' as const,
                    imageFit: 'contain' as const
                }))

            const built: Battle = {
                id: ctx.battle_id,
                title: ctx.title,
                subtitle: ctx.battle_slug ? ctx.battle_slug : undefined,
                options,
                category: 'battle',
                type: 'versus',
                layout: 'versus'
            }

            setBattle(built)
            setLoading(false)
        }

        load()

        return () => {
            mounted = false
        }
    }, [battleSlug])

    const battles = useMemo(() => (battle ? [battle] : []), [battle])

    const handleVote = async (battleId: string, optionId: string, _opponentId: string) => {
        // Fire-and-forget para UX rápida (el motor valida límites/backend)
        signalService.saveSignalEvent({ battle_id: battleId, option_id: optionId })
            .catch((err) => {
                logger.error('Failed to save signal:', err)
                showToast('No se pudo registrar la señal. Intenta de nuevo.', 'error')
            })

        return {}
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (error || !battle) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center">
                    <div className="text-2xl font-black text-slate-900 mb-2">No se pudo cargar</div>
                    <div className="text-slate-600 mb-6">{error || 'Error desconocido'}</div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/experience')}
                            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black"
                        >
                            Volver a Experience
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold"
                        >
                            Ir al Home
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 pt-8">
                <div className="flex items-center justify-between gap-3 mb-6">
                    <button
                        onClick={() => navigate('/experience')}
                        className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
                    >
                        ← Volver a Experience
                    </button>

                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        battle / {battleSlug}
                    </div>
                </div>

                <VersusGame
                    battles={battles}
                    onVote={handleVote}
                    enableAutoAdvance
                    hideProgress={false}
                    isQueueFinite
                    onQueueComplete={() => navigate('/results')}
                />
            </div>
        </div>
    )
}
