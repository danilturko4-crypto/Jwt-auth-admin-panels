import React, { type FC } from "react";
import type { IFight } from "../models/IFight";

interface Props {
    fight: IFight;
    onFighterClick: (fighterId: string) => void;  // ← Теперь передаём ID
}

const PublicTatamiCard: FC<Props> = ({ fight, onFighterClick }) => {
    
    // Проверка что бойцы существуют (старые бои могут иметь null)
    if (!fight.fighter1 || !fight.fighter2) {
        return (
            <div style={{
                padding: '20px',
                backgroundColor: '#ffebee',
                borderRadius: '8px',
                border: '1px solid #f44336'
            }}>
                ⚠️ Этот бой использует старую структуру данных и не может быть отображен. Пожалуйста, удалите старые бои.
            </div>
        )
    }
    
    const getStatusBadge = () => {
        switch (fight.status) {
            case 'scheduled':
                return <span style={{ 
                    backgroundColor: '#ffc107', 
                    color: 'white', 
                    padding: '5px 15px', 
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>⏰ Ожидает</span>
            case 'in_progress':
                return <span style={{ 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    padding: '5px 15px', 
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>🔴 LIVE</span>
            case 'completed':
                return <span style={{ 
                    backgroundColor: '#4caf50', 
                    color: 'white', 
                    padding: '5px 15px', 
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>✅ Завершен</span>
            default:
                return null
        }
    }

    return (
        <div style={{
            backgroundColor: 'white',
            border: fight.status === 'in_progress' ? '3px solid #f44336' : '1px solid #ddd',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: fight.status === 'in_progress' 
                ? '0 4px 20px rgba(244, 67, 54, 0.3)' 
                : '0 2px 10px rgba(0,0,0,0.1)'
        }}>
            {/* Статус */}
            <div style={{ 
                marginBottom: '15px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
                {getStatusBadge()}
                <span style={{ color: '#999', fontSize: '14px' }}>
                    {new Date(fight.createdAt).toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })}
                </span>
            </div>

            {/* Бойцы */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr auto 1fr', 
                gap: '20px', 
                alignItems: 'center' 
            }}>
                {/* Боец 1 */}
                <div
                    onClick={() => onFighterClick(fight.fighter1._id)}
                    style={{
                        padding: '20px',
                        backgroundColor: fight.winner === 'fighter1' ? '#c8e6c9' : '#ffebee',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: fight.winner === 'fighter1' 
                            ? '2px solid #4caf50' 
                            : '2px solid transparent',
                        userSelect: 'none'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                    }}
                >
                    <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        marginBottom: '8px',
                        color: '#333'
                    }}>
                        {fight.winner === 'fighter1' && '👑 '}
                        🔴 {fight.fighter1.name}
                    </div>
                    {fight.fighter1.team && (
                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                            📍 {fight.fighter1.team}
                        </div>
                    )}
                    {fight.fighter1.weight && (
                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                            ⚖️ {fight.fighter1.weight}
                        </div>
                    )}
                    <div style={{ 
                        fontSize: '36px', 
                        fontWeight: 'bold', 
                        marginTop: '10px',
                        color: '#f44336'
                    }}>
                        {fight.score.fighter1}
                    </div>
                    <div style={{ 
                        fontSize: '12px', 
                        color: '#999',
                        marginTop: '5px'
                    }}>
                        👆 Нажмите для статистики
                    </div>
                </div>

                {/* VS */}
                <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#999',
                    textAlign: 'center'
                }}>
                    VS
                </div>

                {/* Боец 2 */}
                <div
                    onClick={() => onFighterClick(fight.fighter2._id)}
                    style={{
                        padding: '20px',
                        backgroundColor: fight.winner === 'fighter2' ? '#c8e6c9' : '#e3f2fd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: fight.winner === 'fighter2' 
                            ? '2px solid #4caf50' 
                            : '2px solid transparent',
                        userSelect: 'none'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                    }}
                >
                    <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        marginBottom: '8px',
                        color: '#333'
                    }}>
                        {fight.winner === 'fighter2' && '👑 '}
                        🔵 {fight.fighter2.name}
                    </div>
                    {fight.fighter2.team && (
                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                            📍 {fight.fighter2.team}
                        </div>
                    )}
                    {fight.fighter2.weight && (
                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                            ⚖️ {fight.fighter2.weight}
                        </div>
                    )}
                    <div style={{ 
                        fontSize: '36px', 
                        fontWeight: 'bold', 
                        marginTop: '10px',
                        color: '#2196f3'
                    }}>
                        {fight.score.fighter2}
                    </div>
                    <div style={{ 
                        fontSize: '12px', 
                        color: '#999',
                        marginTop: '5px'
                    }}>
                        👆 Нажмите для статистики
                    </div>
                </div>
            </div>

            {/* Результат */}
            {fight.status === 'completed' && fight.winner && (
                <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    backgroundColor: '#c8e6c9',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px'
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

export default PublicTatamiCard
    