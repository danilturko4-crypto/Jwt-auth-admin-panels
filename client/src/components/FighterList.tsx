import React, { useState, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { IFighter } from "../models/IFighter";
import FighterService from "../services/FighterService";

interface Props {
    fighters: IFighter[];
    canEdit: boolean;
    onFighterUpdated: () => void;
}

const FighterList: FC<Props> = ({ fighters, canEdit, onFighterUpdated }) => {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editTeam, setEditTeam] = useState('')
    const [editWeight, setEditWeight] = useState('')

    const handleEdit = (fighter: IFighter) => {
        setEditingId(fighter._id)
        setEditName(fighter.name)
        setEditTeam(fighter.team || '')
        setEditWeight(fighter.weight || '')
    }

    const handleSave = async (fighterId: string) => {
        try {
            await FighterService.updateFighter(fighterId, editName, editTeam, editWeight)
            setEditingId(null)
            onFighterUpdated()
        } catch (error) {
            console.error('Ошибка обновления:', error)
            alert('Ошибка обновления бойца')
        }
    }

    const handleDelete = async (fighterId: string, name: string) => {
        if (confirm(`Удалить бойца ${name}?`)) {
            try {
                await FighterService.deleteFighter(fighterId)
                onFighterUpdated()
            } catch (error) {
                console.error('Ошибка удаления:', error)
                alert('Ошибка удаления бойца')
            }
        }
    }

    if (fighters.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Бойцы еще не созданы
            </div>
        )
    }

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>📋 Список бойцов ({fighters.length})</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
                {fighters.map(fighter => (
                    <div
                        key={fighter._id}
                        style={{
                            padding: '15px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            border: '1px solid #ddd'
                        }}
                    >
                        {editingId === fighter._id ? (
                            // Режим редактирования
                            <div>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        marginBottom: '8px',
                                        fontSize: '16px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Команда"
                                    value={editTeam}
                                    onChange={e => setEditTeam(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Вес"
                                    value={editWeight}
                                    onChange={e => setEditWeight(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => handleSave(fighter._id)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Сохранить
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#999',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Режим просмотра
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                                        🥊 {fighter.name}
                                    </div>
                                    {fighter.team && (
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            📍 Команда: {fighter.team}
                                        </div>
                                    )}
                                    {fighter.weight && (
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            ⚖️ Вес: {fighter.weight}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                                        Создан: {new Date(fighter.createdAt).toLocaleDateString('ru-RU')}
                                    </div>
                                </div>

                                {canEdit && (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleEdit(fighter)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#2196f3',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ✏️ Изменить
                                        </button>
                                        <button
                                            onClick={() => handleDelete(fighter._id, fighter.name)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#f44336',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🗑️ Удалить
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default observer(FighterList)