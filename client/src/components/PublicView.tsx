import React, { useEffect, useState, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { ITatami } from "../models/ITatami";
import type { IFight } from "../models/IFight";
import PublicService from "../services/PublicService";
import PublicTatamiCard from "./PublicTatamiCard";
import FighterStatsModal from "./FighterStatsModal";

const PublicView: FC = () => {
    const [tatamis, setTatamis] = useState<ITatami[]>([])
    const [activeFights, setActiveFights] = useState<IFight[]>([])
    const [selectedTatami, setSelectedTatami] = useState<ITatami | null>(null)
    const [selectedTatamisFights, setSelectedTatamisFights] = useState<IFight[]>([])
    const [selectedFighterId, setSelectedFighterId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
        const interval = setInterval(loadData, 10000)
        return () => clearInterval(interval)
    }, [])

    const loadData = async () => {
        try {
            const [tatamisRes, fightsRes] = await Promise.all([
                PublicService.getActiveTatamis(),
                PublicService.getActiveFights()
            ])

            setTatamis(tatamisRes.data)
            setActiveFights(fightsRes.data)
        } catch (error) {
            console.error('Ошибка загрузки данных:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectTatami = async (tatami: ITatami) => {
        setSelectedTatami(tatami)
        try {
            const response = await PublicService.getFightsByTatami(tatami._id)
            setSelectedTatamisFights(response.data)
        } catch (error) {
            console.error('Ошибка загрузки боев татами:', error)
        }
    }

    const handleSelectAll = () => {
        setSelectedTatami(null)
        setSelectedTatamisFights([])
    }

    const getFightsForTatami = (tatamiId: string): IFight[] => {
        return activeFights.filter(fight => {
            const fightTatamiId = fight.tatami._id.toString()
            return fightTatamiId === tatamiId.toString()
        })
    }

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '24px'
            }}>
                ⏳ Загрузка...
            </div>
        )
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Шапка */}
            <div style={{
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '30px',
                borderRadius: '8px',
                marginBottom: '30px',
                textAlign: 'center'
            }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '36px' }}>
                    🥋 Турнир по боевым искусствам
                </h1>
                <p style={{ margin: 0, fontSize: '18px' }}>
                    Следите за боями в реальном времени
                </p>
                <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
                    🔄 Обновляется автоматически каждые 10 секунд
                </p>
            </div>

            {/* Фильтр по татами */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={handleSelectAll}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: selectedTatami === null ? '#1976d2' : '#e0e0e0',
                        color: selectedTatami === null ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    Все татами
                </button>

                {tatamis.map(tatami => (
                    <button
                        key={tatami._id}
                        onClick={() => handleSelectTatami(tatami)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: selectedTatami?._id === tatami._id ? '#1976d2' : '#e0e0e0',
                            color: selectedTatami?._id === tatami._id ? 'white' : 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        🥋 Татами №{tatami.number}
                    </button>
                ))}
            </div>

            {/* Контент */}
            {selectedTatami ? (
                <div>
                    <h2 style={{
                        padding: '15px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1976d2'
                    }}>
                        🥋 Татами №{selectedTatami.number} - {selectedTatami.name}
                    </h2>

                    {selectedTatamisFights.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#999', fontSize: '18px', padding: '40px' }}>
                            Нет боев на этом татами
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {selectedTatamisFights.map(fight => (
                                <PublicTatamiCard
                                    key={fight._id}
                                    fight={fight}
                                    onFighterClick={setSelectedFighterId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {tatamis.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#999', fontSize: '18px' }}>
                            Нет активных татами
                        </p>
                    )}

                    {tatamis.map(tatami => {
                        const tatamiFights = getFightsForTatami(tatami._id)

                        return (
                            <div key={tatami._id} style={{ marginBottom: '30px' }}>
                                <h2
                                    onClick={() => handleSelectTatami(tatami)}
                                    style={{
                                        padding: '15px',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '8px',
                                        borderLeft: '5px solid #1976d2',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span>🥋 Татами №{tatami.number} - {tatami.name}</span>
                                    <span style={{ 
                                        fontSize: '14px', 
                                        color: '#1976d2',
                                        fontWeight: 'normal'
                                    }}>
                                        Все бои →
                                    </span>
                                </h2>

                                {tatamiFights.length === 0 ? (
                                    <p style={{ 
                                        padding: '20px', 
                                        textAlign: 'center', 
                                        color: '#999',
                                        backgroundColor: '#fafafa',
                                        borderRadius: '8px',
                                        margin: '10px 0'
                                    }}>
                                        Нет активных боев
                                    </p>
                                ) : (
                                    <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
                                        {tatamiFights.map(fight => (
                                            <PublicTatamiCard
                                                key={fight._id}
                                                fight={fight}
                                                onFighterClick={setSelectedFighterId}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Модальное окно со статистикой */}
            {selectedFighterId && (
                <FighterStatsModal
                    fighterId={selectedFighterId}
                    onClose={() => setSelectedFighterId(null)}
                />
            )}
        </div>
    )
}

export default observer(PublicView)