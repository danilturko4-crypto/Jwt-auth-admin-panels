import React, { useEffect, useState, type FC } from "react";
import PublicService, { type IFighterStats } from "../services/PublicService";

interface Props {
    fighterId: string;  // ← Изменили: теперь ID, а не имя и роль
    onClose: () => void;
}

const FighterStatsModal: FC<Props> = ({ fighterId, onClose }) => {
    const [stats, setStats] = useState<IFighterStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        setStats(null)
        loadStats()
    }, [fighterId])

    const loadStats = async () => {
        try {
            const response = await PublicService.getFighterStats(fighterId)
            setStats(response.data)
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    padding: '30px',
                    position: 'relative'
                }}
            >
                {/* Кнопка закрытия */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '30px',
                        cursor: 'pointer',
                        color: '#999'
                    }}
                >
                    ×
                </button>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        ⏳ Загрузка статистики...
                    </div>
                ) : stats ? (
                    <>
                        {/* Заголовок */}
                        <h2 style={{ marginTop: 0, marginBottom: '30px', fontSize: '32px' }}>
                            🥊 {stats.fighter.name}
                        </h2>

                        {/* Информация о бойце */}
                        <div style={{
                            padding: '15px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            {stats.fighter.team && (
                                <div style={{ marginBottom: '5px' }}>
                                    <strong>Команда:</strong> {stats.fighter.team}
                                </div>
                            )}
                            {stats.fighter.weight && (
                                <div>
                                    <strong>Весовая категория:</strong> {stats.fighter.weight}
                                </div>
                            )}
                        </div>

                        {/* Основная статистика */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '15px',
                            marginBottom: '30px'
                        }}>
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1976d2' }}>
                                    {stats.totalFights}
                                </div>
                                <div style={{ color: '#666', marginTop: '5px' }}>Всего боев</div>
                            </div>

                            <div style={{
                                padding: '20px',
                                backgroundColor: '#c8e6c9',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#388e3c' }}>
                                    {stats.wins}
                                </div>
                                <div style={{ color: '#666', marginTop: '5px' }}>Побед</div>
                            </div>

                            <div style={{
                                padding: '20px',
                                backgroundColor: '#ffcdd2',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#d32f2f' }}>
                                    {stats.losses}
                                </div>
                                <div style={{ color: '#666', marginTop: '5px' }}>Поражений</div>
                            </div>

                            <div style={{
                                padding: '20px',
                                backgroundColor: '#fff9c4',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f57f17' }}>
                                    {stats.draws}
                                </div>
                                <div style={{ color: '#666', marginTop: '5px' }}>Ничьих</div>
                            </div>
                        </div>

                        {/* Дополнительная статистика */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '15px',
                            marginBottom: '30px'
                        }}>
                            <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                                <strong>Процент побед:</strong> {stats.winRate}%
                            </div>
                            <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                                <strong>Средний счет:</strong> {stats.averageScore}
                            </div>
                            <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                                <strong>Всего очков:</strong> {stats.totalScore}
                            </div>
                            <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                                <strong>Пропущено очков:</strong> {stats.opponentScore}
                            </div>
                        </div>

                        {/* История боев */}
                        <h3>История боев</h3>
                        {stats.fightHistory.length === 0 ? (
                            <p style={{ color: '#999', textAlign: 'center' }}>
                                Нет завершенных боев
                            </p>
                        ) : (
                            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                                {stats.fightHistory.map((fight, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '15px',
                                            marginBottom: '10px',
                                            backgroundColor:
                                                fight.result === 'win' ? '#c8e6c9' :
                                                fight.result === 'loss' ? '#ffcdd2' : '#fff9c4',
                                            borderRadius: '8px',
                                            border:
                                                fight.result === 'win' ? '1px solid #4caf50' :
                                                fight.result === 'loss' ? '1px solid #f44336' : '1px solid #ffc107'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <strong style={{ fontSize: '16px' }}>
                                                    vs {fight.opponent.name}
                                                </strong>
                                                {fight.opponent.team && (
                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                        {fight.opponent.team}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                                    Татами №{fight.tatami?.number} • {new Date(fight.createdAt).toLocaleDateString('ru-RU')}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                    {fight.result === 'win' ? '🏆 Победа' :
                                                     fight.result === 'loss' ? '❌ Поражение' : '🤝 Ничья'}
                                                </div>
                                                <div style={{ fontSize: '18px', color: '#555', marginTop: '4px' }}>
                                                    {fight.myScore} : {fight.opponentScore}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        Статистика не найдена
                    </div>
                )}
            </div>
        </div>
    )
}

export default FighterStatsModal