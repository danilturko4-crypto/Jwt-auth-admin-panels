import React, { useState, useEffect, useRef, useCallback, type FC } from "react";
import type { IFighter } from "../models/IFighter";
import FighterService from "../services/FighterService";
import '../styles/admin.css';

interface Props {
    tatamiId: string;
    onCreateFight: (fighter1Id: string, fighter2Id: string) => Promise<void>;
}

// ── Превью выбранного бойца ──────────────────────────
const FighterPreview: FC<{ fighter: IFighter; corner: 'red' | 'blue' }> = ({ fighter, corner }) => (
    <div style={{ ...s.preview, borderColor: corner === 'red' ? '#ffc9cc' : '#c7d9fd' }}>
        {fighter.photo ? (
            <img src={fighter.photo} alt={fighter.name} style={s.avatar} />
        ) : (
            <div style={{ ...s.avatarPlaceholder, background: corner === 'red' ? '#ffebee' : '#eff6ff' }}>
                👤
            </div>
        )}
        <div style={s.previewInfo}>
            <div style={s.previewName}>{fighter.name}</div>
            {fighter.team && <div style={s.previewMeta}>📍 {fighter.team}</div>}
            {fighter.weight && <div style={s.previewMeta}>⚖️ {fighter.weight}</div>}
        </div>
    </div>
)

// ── Селект с поиском ─────────────────────────────────
const FighterSelect: FC<{
    value: string
    onChange: (id: string) => void
    fighters: IFighter[]
    disabledId?: string
    corner: 'red' | 'blue'
    disabled?: boolean
}> = ({ value, onChange, fighters, disabledId, corner, disabled }) => {
    const [search, setSearch] = useState('')

    const filtered = fighters
        .filter(f => f._id !== disabledId)
        .filter(f => f.name.toLowerCase().includes(search.toLowerCase()) ||
                     f.team?.toLowerCase().includes(search.toLowerCase()) || false)
        .sort((a, b) => a.name.localeCompare(b.name))

    const selected = fighters.find(f => f._id === value)

    return (
        <div>
            <input
                type="text"
                placeholder="Поиск по имени или команде..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={disabled}
                style={s.searchInput}
            />
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                style={{ ...s.select, borderColor: corner === 'red' ? '#ffc9cc' : '#c7d9fd' }}
                size={Math.min(filtered.length + 1, 5)}
            >
                <option value="">— Выберите бойца —</option>
                {filtered.map(fighter => (
                    <option key={fighter._id} value={fighter._id}>
                        {fighter.name}{fighter.team ? ` (${fighter.team})` : ''}{fighter.weight ? ` · ${fighter.weight}` : ''}
                    </option>
                ))}
            </select>
            {filtered.length === 0 && search && (
                <div style={s.noResults}>Ничего не найдено</div>
            )}
            {selected && <FighterPreview fighter={selected} corner={corner} />}
        </div>
    )
}

// ── Основной компонент ───────────────────────────────
const CreateFightForm: FC<Props> = ({ onCreateFight }) => {
    const [fighters, setFighters] = useState<IFighter[]>([])
    const [fighter1Id, setFighter1Id] = useState('')
    const [fighter2Id, setFighter2Id] = useState('')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (successTimerRef.current) clearTimeout(successTimerRef.current)
            if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
        }
    }, [])

    const loadFighters = useCallback(async () => {
        try {
            const response = await FighterService.getAllFighters()
            setFighters(response.data)
        } catch (e) {
            console.error('Ошибка загрузки бойцов:', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadFighters()
    }, [loadFighters])

    const handleSubmit = async () => {
        if (submitting || !fighter1Id || !fighter2Id || fighter1Id === fighter2Id) return
        setError('')
        setSuccess('')
        setSubmitting(true)

        try {
            await onCreateFight(fighter1Id, fighter2Id)

            const f1 = fighters.find(f => f._id === fighter1Id)
            const f2 = fighters.find(f => f._id === fighter2Id)
            setSuccess(`Бой ${f1?.name} vs ${f2?.name} создан!`)
            setFighter1Id('')
            setFighter2Id('')

            successTimerRef.current = setTimeout(() => setSuccess(''), 3000)
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'Ошибка создания боя'
            setError(msg)
            errorTimerRef.current = setTimeout(() => setError(''), 5000)
        } finally {
            setSubmitting(false)
        }
    }

    const canSubmit = fighter1Id && fighter2Id && fighter1Id !== fighter2Id && !submitting

    if (loading) {
        return (
            <div style={s.loadingWrap}>
                <div style={s.spinner} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span style={{ color: '#8890aa', fontSize: 13, fontWeight: 600 }}>Загрузка бойцов...</span>
            </div>
        )
    }

    if (fighters.length < 2) {
        return (
            <div style={s.emptyWrap}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
                <div style={s.emptyText}>
                    {fighters.length === 0
                        ? 'Сначала создайте бойцов в разделе «Бойцы»'
                        : 'Нужно минимум 2 бойца для создания боя'
                    }
                </div>
            </div>
        )
    }

    return (
        <div style={s.wrap}>
            <h3 style={s.title}>⚔️ Создать новый бой</h3>

            <div className="fight-form-grid">
                {/* Красный угол */}
                <div style={{ ...s.corner, borderColor: '#ffc9cc', background: '#fff8f8' }}>
                    <div style={{ ...s.cornerLabel, color: '#e63946' }}>🔴 Красный угол</div>
                    <FighterSelect
                        value={fighter1Id}
                        onChange={setFighter1Id}
                        fighters={fighters}
                        disabledId={fighter2Id}
                        corner="red"
                        disabled={submitting}
                    />
                </div>

                {/* VS разделитель */}
                <div className="fight-form-vs" style={s.vs}>
                    <div style={s.vsLine} />
                    <span style={s.vsText}>VS</span>
                    <div style={s.vsLine} />
                </div>

                {/* Синий угол */}
                <div style={{ ...s.corner, borderColor: '#c7d9fd', background: '#f8fbff' }}>
                    <div style={{ ...s.cornerLabel, color: '#1d6fe5' }}>🔵 Синий угол</div>
                    <FighterSelect
                        value={fighter2Id}
                        onChange={setFighter2Id}
                        fighters={fighters}
                        disabledId={fighter1Id}
                        corner="blue"
                        disabled={submitting}
                    />
                </div>
            </div>

            {error && <div style={s.errorBox}>❌ {error}</div>}
            {success && <div style={s.successBox}>✅ {success}</div>}

            <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{ ...s.btn, opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
            >
                {submitting ? 'Создание...' : 'Создать бой'}
            </button>
        </div>
    )
}

const s: Record<string, React.CSSProperties> = {
    wrap: {
        padding: '20px',
        border: '1.5px solid #e4e8f4',
        borderRadius: 12,
        backgroundColor: '#f4f6fb',
    },
    title: {
        margin: '0 0 18px 0',
        fontSize: 16,
        fontWeight: 700,
        color: '#14172b',
        fontFamily: "'Manrope', sans-serif",
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 12,
        alignItems: 'start',
        marginBottom: 14,
    },
    corner: {
        padding: '14px',
        borderRadius: 10,
        border: '1.5px solid',
    },
    cornerLabel: {
        fontSize: 13,
        fontWeight: 700,
        marginBottom: 10,
        fontFamily: "'Manrope', sans-serif",
    },
    vs: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 40,
        gap: 6,
    },
    vsLine: {
        width: 1,
        height: 20,
        background: '#e4e8f4',
    },
    vsText: {
        fontFamily: "'Unbounded', sans-serif",
        fontSize: 13,
        fontWeight: 900,
        color: '#8890aa',
    },
    searchInput: {
        width: '100%',
        padding: '8px 10px',
        fontSize: 13,
        border: '1.5px solid #e4e8f4',
        borderRadius: 7,
        marginBottom: 6,
        boxSizing: 'border-box' as const,
        fontFamily: "'Manrope', sans-serif",
        outline: 'none',
        backgroundColor: '#fff',
    },
    select: {
        width: '100%',
        padding: '6px 8px',
        fontSize: 13,
        border: '1.5px solid',
        borderRadius: 7,
        backgroundColor: '#fff',
        fontFamily: "'Manrope', sans-serif",
        outline: 'none',
        marginBottom: 8,
        boxSizing: 'border-box' as const,
    },
    noResults: {
        fontSize: 12,
        color: '#8890aa',
        padding: '6px 0',
        fontFamily: "'Manrope', sans-serif",
    },
    preview: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: 8,
        border: '1.5px solid',
        marginTop: 4,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        objectFit: 'cover' as const,
        flexShrink: 0,
        border: '2px solid #e4e8f4',
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        flexShrink: 0,
        border: '2px solid #e4e8f4',
    },
    previewInfo: {
        flex: 1,
        minWidth: 0,
    },
    previewName: {
        fontSize: 13,
        fontWeight: 700,
        color: '#14172b',
        fontFamily: "'Manrope', sans-serif",
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    previewMeta: {
        fontSize: 11,
        color: '#8890aa',
        fontFamily: "'Manrope', sans-serif",
        marginTop: 2,
    },
    loadingWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '20px',
        border: '1.5px solid #e4e8f4',
        borderRadius: 12,
        backgroundColor: '#f4f6fb',
    },
    spinner: {
        width: 24,
        height: 24,
        border: '2px solid #e4e8f4',
        borderTopColor: '#1d6fe5',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
    },
    emptyWrap: {
        padding: '24px 20px',
        backgroundColor: '#fff8f0',
        borderRadius: 12,
        border: '1.5px solid #fdd5ae',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 13,
        fontWeight: 600,
        color: '#f4802a',
        fontFamily: "'Manrope', sans-serif",
    },
    errorBox: {
        color: '#e63946',
        marginBottom: 10,
        padding: '10px 12px',
        backgroundColor: '#fff1f2',
        borderRadius: 8,
        border: '1px solid #ffc9cc',
        fontSize: 13,
        fontFamily: "'Manrope', sans-serif",
    },
    successBox: {
        color: '#2cb67d',
        marginBottom: 10,
        padding: '10px 12px',
        backgroundColor: '#f0faf5',
        borderRadius: 8,
        border: '1px solid #b2e8d0',
        fontSize: 13,
        fontFamily: "'Manrope', sans-serif",
    },
    btn: {
        width: '100%',
        padding: '11px',
        fontSize: 14,
        backgroundColor: '#1d6fe5',
        color: 'white',
        border: 'none',
        borderRadius: 8,
        fontWeight: 700,
        fontFamily: "'Manrope', sans-serif",
        transition: 'opacity 0.15s',
    },
}

export default CreateFightForm