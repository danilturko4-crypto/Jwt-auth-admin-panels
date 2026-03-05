import React, { type FC } from "react";
import type { ITatami } from "../models/ITatami";

interface Props {
    tatamis: ITatami[];
    onStatusChange?: (tatamiId: string, isActive: boolean) => void;
    onDelete?: (tatamiId: string) => void;
    canEdit?: boolean;
}

const TatamiList: FC<Props> = ({ tatamis, onStatusChange, onDelete, canEdit = false }) => {
    if (tatamis.length === 0) {
        return (
            <div style={s.empty}>
                <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.35 }}>🥋</div>
                <div style={s.emptyText}>Татами ещё не созданы</div>
            </div>
        )
    }

    return (
        <div>
            <h3 style={s.title}>📋 Список татами ({tatamis.length})</h3>
            <div style={{ display: 'grid', gap: 8 }}>
                {tatamis.map(tatami => (
                    <div key={tatami._id} style={s.row}>
                        <div style={s.rowInner}>

                            {/* Иконка статуса */}
                            <div style={{
                                ...s.statusDot,
                                background: tatami.isActive ? '#2cb67d' : '#e63946'
                            }} />

                            {/* Инфо */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={s.tatamiName}>
                                    🥋 Татами №{tatami.number} — {tatami.name}
                                </div>
                                <div style={s.meta}>
                                    <span>👤 {tatami.admin.email}</span>
                                    <span style={{ color: tatami.isActive ? '#2cb67d' : '#e63946' }}>
                                        {tatami.isActive ? '● Активно' : '● Неактивно'}
                                    </span>
                                </div>
                            </div>

                            {/* Кнопки */}
                            {canEdit && (
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    {onStatusChange && (
                                        <button
                                            onClick={() => onStatusChange(tatami._id, !tatami.isActive)}
                                            style={{
                                                ...s.btn,
                                                background: tatami.isActive ? '#e63946' : '#2cb67d'
                                            }}
                                        >
                                            {tatami.isActive ? 'Деактивировать' : 'Активировать'}
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(tatami._id)}
                                            style={{ ...s.btn, background: '#8890aa' }}
                                        >
                                            🗑️ Удалить
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const s: Record<string, React.CSSProperties> = {
    title: {
        margin: '0 0 14px 0',
        fontSize: 15,
        fontWeight: 700,
        color: '#14172b',
        fontFamily: "'Manrope', sans-serif",
    },
    row: {
        backgroundColor: '#fff',
        borderRadius: 12,
        border: '1.5px solid #e4e8f4',
        padding: '14px 16px',
        fontFamily: "'Manrope', sans-serif",
    },
    rowInner: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap' as const,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        flexShrink: 0,
    },
    tatamiName: {
        fontSize: 14,
        fontWeight: 700,
        color: '#14172b',
        marginBottom: 3,
    },
    meta: {
        display: 'flex',
        gap: 12,
        fontSize: 12,
        color: '#8890aa',
        fontWeight: 500,
        flexWrap: 'wrap' as const,
    },
    btn: {
        padding: '7px 14px',
        fontSize: 12,
        color: '#fff',
        border: 'none',
        borderRadius: 7,
        cursor: 'pointer',
        fontWeight: 600,
        fontFamily: "'Manrope', sans-serif",
        whiteSpace: 'nowrap' as const,
    },
    empty: {
        padding: '32px 20px',
        textAlign: 'center',
        border: '1.5px dashed #e4e8f4',
        borderRadius: 12,
        backgroundColor: '#f4f6fb',
    },
    emptyText: {
        fontSize: 13,
        fontWeight: 600,
        color: '#8890aa',
        fontFamily: "'Manrope', sans-serif",
    },
}

export default TatamiList