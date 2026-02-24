import React, { useState, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { IFight } from "../models/IFight";

interface Props {
    fight: IFight;
    canEdit: boolean;
    onStatusChange: (fightId: string, status: string) => void;
    onResultChange: (fightId: string, winner: string, score: any) => void;
}

const FightCard: FC<Props> = ({ fight, canEdit, onStatusChange, onResultChange }) => {
    const [showScoreForm, setShowScoreForm] = useState(false)
    const [score1, setScore1] = useState(fight.score.fighter1.toString())
    const [score2, setScore2] = useState(fight.score.fighter2.toString())

    const getStatusColor = () => {
        switch (fight.status) {
            case 'scheduled': return '#ffc107';
            case 'in_progress': return '#2196F3';
            case 'completed': return '#4caf50';
            case 'cancelled': return '#f44336';
            default: return '#999';
        }
    }

    const getStatusText = () => {
        switch (fight.status) {
            case 'scheduled': return '⏰ Ожидает';
            case 'in_progress': return '▶️ Идет';
            case 'completed': return '✅ Завершен';
            case 'cancelled': return '❌ Отменен';
            default: return '';
        }
    }

    const handleSaveResult = () => {
        const s1 = parseInt(score1) || 0
        const s2 = parseInt(score2) || 0
        
        let winner: string = 'draw'
        if (s1 > s2) winner = 'fighter1'
        else if (s2 > s1) winner = 'fighter2'

        onResultChange(fight._id, winner, { fighter1: s1, fighter2: s2 })
        setShowScoreForm(false)
    }

    return (
        <div style={{ 
            padding: '20px', 
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: `3px solid ${getStatusColor()}`,
            marginBottom: '15px'
        }}>
            {/* Заголовок */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                    <h4 style={{ margin: 0 }}>🥋 Татами №{fight.tatami.number} - {fight.tatami.name}</h4>
                    <span style={{ 
                        color: getStatusColor(), 
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}>
                        {getStatusText()}
                    </span>
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(fight.createdAt).toLocaleString('ru-RU')}
                </div>
            </div>

            {/* Бойцы */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center' }}>
                {/* Боец 1 */}
                <div style={{ 
                    padding: '15px', 
                    backgroundColor: fight.winner === 'fighter1' ? '#c8e6c9' : '#f5f5f5',
                    borderRadius: '8px',
                    border: fight.winner === 'fighter1' ? '2px solid #4caf50' : 'none'
                }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                        {fight.winner === 'fighter1' && '👑 '}
                        🔴 {fight.fighter1.name}
                    </div>
                    {fight.fighter1.team && (
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            Команда: {fight.fighter1.team}
                        </div>
                    )}
                    {fight.fighter1.weight && (
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            Вес: {fight.fighter1.weight}
                        </div>
                    )}
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', color: '#f44336' }}>
                        {fight.score.fighter1}
                    </div>
                </div>

                {/* VS */}
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#999' }}>
                    VS
                </div>

                {/* Боец 2 */}
                <div style={{ 
                    padding: '15px', 
                    backgroundColor: fight.winner === 'fighter2' ? '#c8e6c9' : '#f5f5f5',
                    borderRadius: '8px',
                    border: fight.winner === 'fighter2' ? '2px solid #4caf50' : 'none'
                }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                        {fight.winner === 'fighter2' && '👑 '}
                        🔵 {fight.fighter2.name}
                    </div>
                    {fight.fighter2.team && (
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            Команда: {fight.fighter2.team}
                        </div>
                    )}
                    {fight.fighter2.weight && (
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            Вес: {fight.fighter2.weight}
                        </div>
                    )}
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', color: '#2196F3' }}>
                        {fight.score.fighter2}
                    </div>
                </div>
            </div>

            {/* Управление */}
            {canEdit && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {fight.status === 'scheduled' && (
                        <button
                            onClick={() => onStatusChange(fight._id, 'in_progress')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            ▶️ Начать бой
                        </button>
                    )}
                    
                    {fight.status === 'in_progress' && (
                        <>
                            <button
                                onClick={() => setShowScoreForm(!showScoreForm)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                ✅ Завершить бой
                            </button>
                            <button
                                onClick={() => onStatusChange(fight._id, 'cancelled')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                ❌ Отменить
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Форма ввода счета */}
            {showScoreForm && (
                <div style={{ 
                    marginTop: '15px', 
                    padding: '15px', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '8px' 
                }}>
                    <h4 style={{ marginTop: 0 }}>Введите результат боя:</h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="number"
                            placeholder="Счет 1"
                            value={score1}
                            onChange={e => setScore1(e.target.value)}
                            style={{ padding: '10px', fontSize: '16px', width: '100px' }}
                        />
                        <span>:</span>
                        <input
                            type="number"
                            placeholder="Счет 2"
                            value={score2}
                            onChange={e => setScore2(e.target.value)}
                            style={{ padding: '10px', fontSize: '16px', width: '100px' }}
                        />
                        <button
                            onClick={handleSaveResult}
                            style={{
                                padding: '10px 20px',
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
                            onClick={() => setShowScoreForm(false)}
                            style={{
                                padding: '10px 20px',
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
            )}

            {/* Результат */}
            {fight.status === 'completed' && fight.winner && (
                <div style={{ 
                    marginTop: '15px', 
                    padding: '10px', 
                    backgroundColor: '#c8e6c9',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                }}>
                    🏆 Победитель: {
                        fight.winner === 'fighter1' ? fight.fighter1.name :
                        fight.winner === 'fighter2' ? fight.fighter2.name :
                        'Ничья'
                    }
                </div>
            )}
        </div>
    )
}

export default observer(FightCard)