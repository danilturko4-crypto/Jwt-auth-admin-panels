import React, { useState, type FC } from "react";
import type { IFight } from "../models/IFight";
import type { IFighter } from "../models/IFighter";

interface Props {
    fight: IFight;
    canEdit: boolean;
    fighters?: IFighter[];
    onStatusChange: (fightId: string, status: string) => void;
    onResultChange: (fightId: string, winner: string, score: { fighter1: number; fighter2: number }) => void;
    onEditFight?: (fightId: string, fighter1Id: string, fighter2Id: string) => void;
}

// ── Карточка бойца (в режиме боя) ───────────────────
const FighterScoreCard: FC<{
    fighter: IFight['fighter1']
    score: number
    corner: 'red' | 'blue'
    onIncrement: () => void
    onDecrement: () => void
}> = ({ fighter, score, corner, onIncrement, onDecrement }) => {
    const [hovered, setHovered] = useState(false)
    const color = corner === 'red' ? '#e63946' : '#1d6fe5'
    const bgHover = corner === 'red' ? '#fff1f2' : '#eff6ff'
    const borderColor = corner === 'red' ? '#ffc9cc' : '#c7d9fd'

    return (
        <div
            onClick={onIncrement}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: '20px',
                backgroundColor: hovered ? bgHover : '#fff',
                borderRadius: 12,
                border: `2px solid ${hovered ? color : borderColor}`,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.15s',
                textAlign: 'center',
                transform: hovered ? 'scale(1.02)' : 'scale(1)',
            }}
        >
            {fighter.photo ? (
                <img src={fighter.photo} alt={fighter.name} style={{
                    width: 56, height: 56, borderRadius: '50%',
                    objectFit: 'cover', border: `2px solid ${borderColor}`,
                    marginBottom: 8, display: 'block', margin: '0 auto 8px'
                }} />
            ) : (
                <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: corner === 'red' ? '#ffebee' : '#eff6ff',
                    border: `2px solid ${borderColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, margin: '0 auto 8px'
                }}>
                    {corner === 'red' ? '🔴' : '🔵'}
                </div>
            )}
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#14172b', fontFamily: "'Manrope', sans-serif" }}>
                {fighter.name}
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, color, lineHeight: 1, marginBottom: 12, fontFamily: "'Unbounded', sans-serif" }}>
                {score}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button
                    onClick={e => { e.stopPropagation(); onDecrement() }}
                    style={{ ...s.scoreBtn, background: color }}
                >
                    −
                </button>
                <button
                    onClick={e => { e.stopPropagation(); onIncrement() }}
                    style={{ ...s.scoreBtn, background: color }}
                >
                    +
                </button>
            </div>
        </div>
    )
}

// ── Карточка бойца (статичная) ───────────────────────
const FighterStaticCard: FC<{
    fighter: IFight['fighter1']
    score: number
    corner: 'red' | 'blue'
    isWinner: boolean
}> = ({ fighter, score, corner, isWinner }) => {
    const color = corner === 'red' ? '#e63946' : '#1d6fe5'
    const borderColor = corner === 'red' ? '#ffc9cc' : '#c7d9fd'

    return (
        <div style={{
            padding: '16px',
            backgroundColor: isWinner ? '#f0faf5' : '#f4f6fb',
            borderRadius: 12,
            border: `1.5px solid ${isWinner ? '#b2e8d0' : borderColor}`,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                {fighter.photo ? (
                    <img src={fighter.photo} alt={fighter.name} style={{
                        width: 44, height: 44, borderRadius: '50%',
                        objectFit: 'cover', border: `2px solid ${borderColor}`, flexShrink: 0
                    }} />
                ) : (
                    <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: corner === 'red' ? '#ffebee' : '#eff6ff',
                        border: `2px solid ${borderColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0
                    }}>
                        {corner === 'red' ? '🔴' : '🔵'}
                    </div>
                )}
                <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#14172b', fontFamily: "'Manrope', sans-serif" }}>
                        {isWinner && '👑 '}{fighter.name}
                    </div>
                    {fighter.team && <div style={s.meta}>📍 {fighter.team}</div>}
                    {fighter.weight && <div style={s.meta}>⚖️ {fighter.weight}</div>}
                </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color, fontFamily: "'Unbounded', sans-serif" }}>
                {score}
            </div>
        </div>
    )
}

// ── Основной компонент ───────────────────────────────
const FightCard: FC<Props> = ({ fight, canEdit, fighters = [], onStatusChange, onResultChange, onEditFight }) => {
    const [score1, setScore1] = useState(fight.score.fighter1)
    const [score2, setScore2] = useState(fight.score.fighter2)
    const [showEditForm, setShowEditForm] = useState(false)
    const [editFighter1, setEditFighter1] = useState(fight.fighter1._id)
    const [editFighter2, setEditFighter2] = useState(fight.fighter2._id)
    const [editError, setEditError] = useState('')
    const [confirmAction, setConfirmAction] = useState<'cancel' | 'finish' | null>(null)

    const statusConfig = {
        scheduled:   { color: '#f4802a', text: '⏰ Ожидает' },
        in_progress: { color: '#1d6fe5', text: '▶️ Идёт' },
        completed:   { color: '#2cb67d', text: '✅ Завершён' },
        cancelled:   { color: '#e63946', text: '❌ Отменён' },
    }
    const status = statusConfig[fight.status as keyof typeof statusConfig] ?? { color: '#8890aa', text: '' }

    const handleSaveResult = () => {
        const winner = score1 > score2 ? 'fighter1' : score2 > score1 ? 'fighter2' : 'draw'
        onResultChange(fight._id, winner, { fighter1: score1, fighter2: score2 })
        setConfirmAction(null)
    }

    const handleSaveEdit = () => {
        if (editFighter1 === editFighter2) {
            setEditError('Выберите разных бойцов')
            return
        }
        onEditFight?.(fight._id, editFighter1, editFighter2)
        setShowEditForm(false)
        setEditError('')
    }

    return (
        <div style={s.card}>
            {/* Цветная полоска статуса сверху */}
            <div style={{ ...s.statusStripe, background: status.color }} />

            {/* Заголовок */}
            <div style={s.cardHeader}>
                <div>
                    <div style={s.tatamiLabel}>🥋 {fight.tatami ? `Татами №${fight.tatami.number} — ${fight.tatami.name}` : 'Татами удалено'}</div>
                    <div style={{ ...s.statusText, color: status.color }}>{status.text}</div>
                </div>
                <div style={s.dateText}>{new Date(fight.createdAt).toLocaleString('ru-RU')}</div>
            </div>

            {/* Бойцы */}
            <div style={s.matchup}>
                {fight.status === 'in_progress' ? (
                    <>
                        <FighterScoreCard
                            fighter={fight.fighter1}
                            score={score1}
                            corner="red"
                            onIncrement={() => setScore1(s1 => s1 + 1)}
                            onDecrement={() => setScore1(s1 => Math.max(0, s1 - 1))}
                        />
                        <div style={s.vsBlock}>
                            <div style={s.vsLine} />
                            <span style={s.vsText}>VS</span>
                            <div style={s.vsLine} />
                        </div>
                        <FighterScoreCard
                            fighter={fight.fighter2}
                            score={score2}
                            corner="blue"
                            onIncrement={() => setScore2(s2 => s2 + 1)}
                            onDecrement={() => setScore2(s2 => Math.max(0, s2 - 1))}
                        />
                    </>
                ) : (
                    <>
                        <FighterStaticCard
                            fighter={fight.fighter1}
                            score={fight.score.fighter1}
                            corner="red"
                            isWinner={fight.winner === 'fighter1'}
                        />
                        <div style={s.vsBlock}>
                            <div style={s.vsLine} />
                            <span style={s.vsText}>VS</span>
                            <div style={s.vsLine} />
                        </div>
                        <FighterStaticCard
                            fighter={fight.fighter2}
                            score={fight.score.fighter2}
                            corner="blue"
                            isWinner={fight.winner === 'fighter2'}
                        />
                    </>
                )}
            </div>

            {/* Результат */}
            {fight.status === 'completed' && fight.winner && (
                <div style={s.winnerBox}>
                    🏆 Победитель: {
                        fight.winner === 'fighter1' ? fight.fighter1.name :
                        fight.winner === 'fighter2' ? fight.fighter2.name : 'Ничья'
                    }
                </div>
            )}

            {/* Управление */}
            {canEdit && (
                <div style={s.controls}>
                    {fight.status === 'scheduled' && (
                        <>
                            <button style={{ ...s.btn, background: '#1d6fe5' }} onClick={() => onStatusChange(fight._id, 'in_progress')}>
                                ▶️ Начать бой
                            </button>
                            {onEditFight && fighters.length > 0 && (
                                <button style={{ ...s.btn, background: '#f4802a' }} onClick={() => {
                                    setEditFighter1(fight.fighter1._id)
                                    setEditFighter2(fight.fighter2._id)
                                    setShowEditForm(v => !v)
                                    setEditError('')
                                }}>
                                    ✏️ Изменить бойцов
                                </button>
                            )}
                        </>
                    )}

                    {fight.status === 'in_progress' && (
                        <>
                            <button style={{ ...s.btn, background: '#e63946' }} onClick={() => setConfirmAction('cancel')}>
                                ❌ Отменить бой
                            </button>
                            <button style={{ ...s.btn, background: '#2cb67d' }} onClick={() => setConfirmAction('finish')}>
                                ✅ Завершить
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Подтверждение действия */}
            {confirmAction && (
                <div style={confirmAction === 'cancel' ? s.confirmDanger : s.confirmSuccess}>
                    <div style={s.confirmText}>
                        {confirmAction === 'cancel'
                            ? '❌ Отменить бой? Это действие необратимо.'
                            : `✅ Завершить бой со счётом ${score1} : ${score2}?`
                        }
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            style={{ ...s.btn, background: confirmAction === 'cancel' ? '#e63946' : '#2cb67d' }}
                            onClick={() => {
                                if (confirmAction === 'cancel') onStatusChange(fight._id, 'cancelled')
                                else handleSaveResult()
                                setConfirmAction(null)
                            }}
                        >
                            Подтвердить
                        </button>
                        <button style={{ ...s.btn, background: '#8890aa' }} onClick={() => setConfirmAction(null)}>
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {/* Форма изменения бойцов */}
            {showEditForm && (
                <div style={s.editForm}>
                    <div style={s.editTitle}>✏️ Изменить бойцов</div>
                    <div style={s.editRow}>
                        <div style={{ flex: 1 }}>
                            <div style={s.editLabel}>🔴 Боец 1</div>
                            <select
                                value={editFighter1}
                                onChange={e => { setEditFighter1(e.target.value); setEditError('') }}
                                style={s.editSelect}
                            >
                                {fighters.map(f => (
                                    <option key={f._id} value={f._id} disabled={f._id === editFighter2}>
                                        {f.name}{f.team ? ` (${f.team})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ ...s.vsText, paddingTop: 20, flexShrink: 0 }}>VS</div>
                        <div style={{ flex: 1 }}>
                            <div style={s.editLabel}>🔵 Боец 2</div>
                            <select
                                value={editFighter2}
                                onChange={e => { setEditFighter2(e.target.value); setEditError('') }}
                                style={s.editSelect}
                            >
                                {fighters.map(f => (
                                    <option key={f._id} value={f._id} disabled={f._id === editFighter1}>
                                        {f.name}{f.team ? ` (${f.team})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {editError && <div style={s.editError}>❌ {editError}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button style={{ ...s.btn, background: '#f4802a' }} onClick={handleSaveEdit}>Сохранить</button>
                        <button style={{ ...s.btn, background: '#8890aa' }} onClick={() => { setShowEditForm(false); setEditError('') }}>Отмена</button>
                    </div>
                </div>
            )}
        </div>
    )
}

const s: Record<string, React.CSSProperties> = {
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        border: '1.5px solid #e4e8f4',
        marginBottom: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(29,111,229,0.07)',
        fontFamily: "'Manrope', sans-serif",
        position: 'relative',
    },
    statusStripe: {
        height: 3,
        width: '100%',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '14px 18px 10px',
        borderBottom: '1px solid #e4e8f4',
    },
    tatamiLabel: {
        fontSize: 14,
        fontWeight: 700,
        color: '#14172b',
        marginBottom: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 700,
    },
    dateText: {
        fontSize: 11,
        color: '#8890aa',
    },
    matchup: {
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 12,
        alignItems: 'center',
        padding: '16px 18px',
    },
    vsBlock: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
    },
    vsLine: {
        width: 1,
        height: 20,
        background: '#e4e8f4',
    },
    vsText: {
        fontFamily: "'Unbounded', sans-serif",
        fontSize: 12,
        fontWeight: 900,
        color: '#8890aa',
    },
    meta: {
        fontSize: 11,
        color: '#8890aa',
        marginTop: 2,
    },
    winnerBox: {
        margin: '0 18px 14px',
        padding: '10px 14px',
        backgroundColor: '#f0faf5',
        border: '1px solid #b2e8d0',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 700,
        color: '#2cb67d',
    },
    controls: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        padding: '0 18px 16px',
    },
    btn: {
        padding: '9px 16px',
        fontSize: 13,
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontWeight: 600,
        fontFamily: "'Manrope', sans-serif",
    },
    scoreBtn: {
        padding: '8px 18px',
        fontSize: 18,
        color: '#fff',
        border: 'none',
        borderRadius: 7,
        cursor: 'pointer',
        fontWeight: 700,
        lineHeight: 1,
    },
    confirmDanger: {
        margin: '0 18px 16px',
        padding: '12px 14px',
        backgroundColor: '#fff1f2',
        border: '1.5px solid #ffc9cc',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap' as const,
    },
    confirmSuccess: {
        margin: '0 18px 16px',
        padding: '12px 14px',
        backgroundColor: '#f0faf5',
        border: '1.5px solid #b2e8d0',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap' as const,
    },
    confirmText: {
        fontSize: 13,
        fontWeight: 600,
        color: '#14172b',
    },
    editForm: {
        margin: '0 18px 16px',
        padding: '14px',
        backgroundColor: '#fff8f0',
        borderRadius: 10,
        border: '1.5px solid #fdd5ae',
    },
    editTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: '#f4802a',
        marginBottom: 12,
    },
    editRow: {
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
    },
    editLabel: {
        fontSize: 12,
        fontWeight: 600,
        color: '#8890aa',
        marginBottom: 4,
    },
    editSelect: {
        width: '100%',
        padding: '8px 10px',
        fontSize: 13,
        border: '1.5px solid #e4e8f4',
        borderRadius: 7,
        backgroundColor: '#fff',
        fontFamily: "'Manrope', sans-serif",
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    editError: {
        marginTop: 8,
        fontSize: 12,
        color: '#e63946',
        fontWeight: 600,
    },
}

export default FightCard