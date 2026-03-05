import React, { useState, type FC } from "react";
import type { IFighter } from "../models/IFighter";
import FighterService from "../services/FighterService";
import { User, MapPin, Scale, Pencil, Trash2, AlertCircle, ClipboardList } from 'lucide-react';

interface Props {
    fighters: IFighter[];
    canEdit: boolean;
    onFighterUpdated: () => void;
}

// ── Карточка бойца ───────────────────────────────────
const FighterRow: FC<{
    fighter: IFighter
    canEdit: boolean
    onFighterUpdated: () => void
}> = ({ fighter, canEdit, onFighterUpdated }) => {
    const [editing, setEditing] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [editName, setEditName] = useState(fighter.name)
    const [editTeam, setEditTeam] = useState(fighter.team || '')
    const [editWeight, setEditWeight] = useState(fighter.weight || '')
    const [saveError, setSaveError] = useState('')
    const [deleteError, setDeleteError] = useState('')
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleEdit = () => {
        setEditName(fighter.name)
        setEditTeam(fighter.team || '')
        setEditWeight(fighter.weight || '')
        setSaveError('')
        setEditing(true)
    }

    const handleSave = async () => {
        if (!editName.trim()) {
            setSaveError('Имя не может быть пустым')
            return
        }
        setSaving(true)
        setSaveError('')
        try {
            await FighterService.updateFighter(fighter._id, editName.trim(), editTeam.trim(), editWeight.trim())
            setEditing(false)
            onFighterUpdated()
        } catch (e: any) {
            setSaveError(e?.response?.data?.message || 'Ошибка обновления')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        setDeleteError('')
        try {
            await FighterService.deleteFighter(fighter._id)
            onFighterUpdated()
        } catch (e: any) {
            setDeleteError(e?.response?.data?.message || 'Ошибка удаления')
            setConfirmDelete(false)
        } finally {
            setDeleting(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !saving) handleSave()
        if (e.key === 'Escape') setEditing(false)
    }

    return (
        <div style={s.row}>
            {editing ? (
                // ── Режим редактирования ──
                <div>
                    <div style={s.editFields}>
                        <input
                            type="text"
                            value={editName}
                            onChange={e => { setEditName(e.target.value); setSaveError('') }}
                            onKeyDown={handleKeyDown}
                            placeholder="Имя *"
                            disabled={saving}
                            autoFocus
                            style={{ ...s.input, borderColor: saveError && !editName.trim() ? '#e63946' : '#e4e8f4' }}
                        />
                        <input
                            type="text"
                            value={editTeam}
                            onChange={e => setEditTeam(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Команда"
                            disabled={saving}
                            style={s.input}
                        />
                        <input
                            type="text"
                            value={editWeight}
                            onChange={e => setEditWeight(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Весовая категория"
                            disabled={saving}
                            style={s.input}
                        />
                    </div>
                    {saveError && <div style={{ ...s.errorText, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} />{saveError}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{ ...s.btn, background: '#2cb67d', opacity: saving ? 0.6 : 1 }}
                        >
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                            onClick={() => setEditing(false)}
                            disabled={saving}
                            style={{ ...s.btn, background: '#8890aa' }}
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            ) : (
                // ── Режим просмотра ──
                <div style={s.viewRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {fighter.photo ? (
                            <img src={fighter.photo} alt={fighter.name} style={s.avatar} />
                        ) : (
                            <div style={s.avatarPlaceholder}><User size={20} color="#8890aa" /></div>
                        )}
                        <div>
                            <div style={s.fighterName}>{fighter.name}</div>
                            <div style={s.fighterMeta}>
                                {fighter.team && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><MapPin size={10} />{fighter.team}</span>}
                                {fighter.weight && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Scale size={10} />{fighter.weight}</span>}
                                <span style={{ color: '#c7d0e0' }}>
                                    {new Date(fighter.createdAt).toLocaleDateString('ru-RU')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {canEdit && (
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <button onClick={handleEdit} style={{ ...s.btn, background: '#1d6fe5', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Pencil size={12} /> Изменить
                            </button>
                            <button onClick={() => setConfirmDelete(true)} style={{ ...s.btn, background: '#e63946', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Trash2 size={12} /> Удалить
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Подтверждение удаления */}
            {confirmDelete && (
                <div style={s.confirmBox}>
                    <span style={s.confirmText}>Удалить <strong>{fighter.name}</strong>? Это необратимо.</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{ ...s.btn, background: '#e63946', opacity: deleting ? 0.6 : 1 }}
                        >
                            {deleting ? 'Удаление...' : 'Удалить'}
                        </button>
                        <button
                            onClick={() => setConfirmDelete(false)}
                            disabled={deleting}
                            style={{ ...s.btn, background: '#8890aa' }}
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {deleteError && <div style={{ ...s.errorText, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} />{deleteError}</div>}
        </div>
    )
}

// ── Основной компонент ───────────────────────────────
const FighterList: FC<Props> = ({ fighters, canEdit, onFighterUpdated }) => {
    if (fighters.length === 0) {
        return (
            <div style={s.empty}>
                <div style={{ marginBottom: 8, opacity: 0.35 }}><User size={28} /></div>
                <div style={s.emptyText}>Бойцы ещё не созданы</div>
            </div>
        )
    }

    return (
        <div>
            <h3 style={{ ...s.title, display: 'flex', alignItems: 'center', gap: 6 }}><ClipboardList size={15} /> Список бойцов ({fighters.length})</h3>
            <div style={{ display: 'grid', gap: 8 }}>
                {fighters.map(fighter => (
                    <FighterRow
                        key={fighter._id}
                        fighter={fighter}
                        canEdit={canEdit}
                        onFighterUpdated={onFighterUpdated}
                    />
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
        padding: '14px 16px',
        backgroundColor: '#fff',
        borderRadius: 12,
        border: '1.5px solid #e4e8f4',
        fontFamily: "'Manrope', sans-serif",
    },
    viewRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap' as const,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        objectFit: 'cover' as const,
        border: '2px solid #e4e8f4',
        flexShrink: 0,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: '#f4f6fb',
        border: '2px solid #e4e8f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        flexShrink: 0,
    },
    fighterName: {
        fontSize: 15,
        fontWeight: 700,
        color: '#14172b',
        marginBottom: 3,
    },
    fighterMeta: {
        display: 'flex',
        gap: 10,
        fontSize: 12,
        color: '#8890aa',
        flexWrap: 'wrap' as const,
    },
    editFields: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
    },
    input: {
        padding: '8px 10px',
        fontSize: 13,
        border: '1.5px solid #e4e8f4',
        borderRadius: 7,
        backgroundColor: '#fff',
        fontFamily: "'Manrope', sans-serif",
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box' as const,
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
    confirmBox: {
        marginTop: 10,
        padding: '10px 12px',
        backgroundColor: '#fff1f2',
        border: '1.5px solid #ffc9cc',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap' as const,
    },
    confirmText: {
        fontSize: 13,
        color: '#14172b',
    },
    errorText: {
        fontSize: 12,
        color: '#e63946',
        fontWeight: 600,
        marginTop: 4,
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

export default FighterList