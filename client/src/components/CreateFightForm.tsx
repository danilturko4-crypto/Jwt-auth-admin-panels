import React, { useState, useEffect, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { IFighter } from "../models/IFighter";
import FighterService from "../services/FighterService";

interface Props {
    tatamiId: string;
    onCreateFight: (fighter1Id: string, fighter2Id: string) => Promise<void>;
}

const CreateFightForm: FC<Props> = ({ tatamiId, onCreateFight }) => {
    const [fighters, setFighters] = useState<IFighter[]>([])
    const [fighter1Id, setFighter1Id] = useState('')
    const [fighter2Id, setFighter2Id] = useState('')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadFighters()
    }, [])

    const loadFighters = async () => {
        try {
            const response = await FighterService.getAllFighters()
            setFighters(response.data)
        } catch (error) {
            console.error('Ошибка загрузки бойцов:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        setError('')
        setSuccess('')

        if (!fighter1Id || !fighter2Id) {
            setError('Выберите обоих бойцов')
            return
        }

        if (fighter1Id === fighter2Id) {
            setError('Бойцы должны быть разными')
            return
        }

        try {
            await onCreateFight(fighter1Id, fighter2Id)
            
            const f1 = fighters.find(f => f._id === fighter1Id)
            const f2 = fighters.find(f => f._id === fighter2Id)
            setSuccess(`Бой ${f1?.name} vs ${f2?.name} создан!`)
            setFighter1Id('')
            setFighter2Id('')
            
            setTimeout(() => setSuccess(''), 3000)
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Ошибка создания боя')
            setTimeout(() => setError(''), 5000)
        }
    }

    if (loading) {
        return <div style={{ padding: '20px' }}>Загрузка бойцов...</div>
    }

    if (fighters.length === 0) {
        return (
            <div style={{
                padding: '20px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                border: '1px solid #ffc107',
                color: '#856404'
            }}>
                ⚠️ Сначала создайте бойцов в разделе "Бойцы"
            </div>
        )
    }

    return (
        <div style={{
            padding: '20px',
            border: '2px solid #2196F3',
            borderRadius: '8px',
            marginTop: '20px',
            backgroundColor: '#f5f5f5'
        }}>
            <h3>⚔️ Создать новый бой</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Боец 1 */}
                <div style={{ padding: '15px', backgroundColor: '#ffebee', borderRadius: '8px' }}>
                    <h4 style={{ marginTop: 0 }}>🔴 Боец 1 (Красный угол)</h4>
                    <select
                        value={fighter1Id}
                        onChange={e => setFighter1Id(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="">Выберите бойца</option>
                        {fighters.map(fighter => (
                            <option key={fighter._id} value={fighter._id}>
                                {fighter.name}
                                {fighter.team && ` (${fighter.team})`}
                                {fighter.weight && ` - ${fighter.weight}`}
                            </option>
                        ))}
                    </select>
                    
                    {fighter1Id && (
                        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                            {(() => {
                                const f = fighters.find(f => f._id === fighter1Id)
                                return f ? (
                                    <>
                                        <div><strong>{f.name}</strong></div>
                                        {f.team && <div>📍 {f.team}</div>}
                                        {f.weight && <div>⚖️ {f.weight}</div>}
                                    </>
                                ) : null
                            })()}
                        </div>
                    )}
                </div>

                {/* Боец 2 */}
                <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
                    <h4 style={{ marginTop: 0 }}>🔵 Боец 2 (Синий угол)</h4>
                    <select
                        value={fighter2Id}
                        onChange={e => setFighter2Id(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="">Выберите бойца</option>
                        {fighters.map(fighter => (
                            <option 
                                key={fighter._id} 
                                value={fighter._id}
                                disabled={fighter._id === fighter1Id}
                            >
                                {fighter.name}
                                {fighter.team && ` (${fighter.team})`}
                                {fighter.weight && ` - ${fighter.weight}`}
                            </option>
                        ))}
                    </select>
                    
                    {fighter2Id && (
                        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                            {(() => {
                                const f = fighters.find(f => f._id === fighter2Id)
                                return f ? (
                                    <>
                                        <div><strong>{f.name}</strong></div>
                                        {f.team && <div>📍 {f.team}</div>}
                                        {f.weight && <div>⚖️ {f.weight}</div>}
                                    </>
                                ) : null
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div style={{ color: 'red', marginTop: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                    ❌ {error}
                </div>
            )}

            {success && (
                <div style={{ color: 'green', marginTop: '10px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
                    ✅ {success}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={!fighter1Id || !fighter2Id || fighter1Id === fighter2Id}
                style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '18px',
                    marginTop: '15px',
                    cursor: (!fighter1Id || !fighter2Id || fighter1Id === fighter2Id) ? 'not-allowed' : 'pointer',
                    backgroundColor: (!fighter1Id || !fighter2Id || fighter1Id === fighter2Id) ? '#ccc' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                }}
            >
                Создать бой
            </button>
        </div>
    )
}

export default observer(CreateFightForm)