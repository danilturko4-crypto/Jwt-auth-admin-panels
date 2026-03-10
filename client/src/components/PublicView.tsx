import { useEffect, useState, useRef, useMemo, useCallback, type FC } from "react";
import { observer } from "mobx-react-lite";
import type { ITatami } from "../models/ITatami";
import type { IFight } from "../models/IFight";
import PublicService from "../services/PublicService";
import PublicTatamiCard from "./PublicTatamiCard";
import FighterStatsModal from "./FighterStatsModal";
import "../styles/PublicView.css";

const PublicView: FC = () => {
    const [tatamis, setTatamis] = useState<ITatami[]>([])
    const [activeFights, setActiveFights] = useState<IFight[]>([])
    const [selectedTatami, setSelectedTatami] = useState<ITatami | null>(null)
    const [selectedTatamisFights, setSelectedTatamisFights] = useState<IFight[]>([])
    const [selectedFighterId, setSelectedFighterId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [tatamiLoading, setTatamiLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [updateError, setUpdateError] = useState(false)
    const [refreshFlash, setRefreshFlash] = useState(false)

    const isLoadingRef = useRef(false)
    const tatamiAbortRef = useRef<AbortController | null>(null)


    const loadData = useCallback(async (currentTatamiId?: string) => {
        if (isLoadingRef.current) return
        isLoadingRef.current = true

        try {
            const [tatamisRes, fightsRes] = await Promise.all([
                PublicService.getActiveTatamis(),
                PublicService.getActiveFights()
            ])

            setTatamis(tatamisRes.data)
            setActiveFights(fightsRes.data)
            setLastUpdated(new Date())
            setUpdateError(false)

         
            if (currentTatamiId) {
                const response = await PublicService.getFightsByTatami(currentTatamiId)
                setSelectedTatamisFights(response.data)
            }

            
            setRefreshFlash(true)
            setTimeout(() => setRefreshFlash(false), 800)
        } catch (error) {
            console.error('Ошибка загрузки данных:', error)
            setUpdateError(true)
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

   
    useEffect(() => {
        const interval = setInterval(() => {
            loadData(selectedTatami?._id)
        }, 10000)
        return () => clearInterval(interval)
    }, [loadData, selectedTatami])

    const handleSelectTatami = async (tatami: ITatami) => {
        
        if (tatamiAbortRef.current) {
            tatamiAbortRef.current.abort()
        }
        const controller = new AbortController()
        tatamiAbortRef.current = controller

        setSelectedTatami(tatami)
        setSelectedTatamisFights([])
        setTatamiLoading(true)

        try {
            const response = await PublicService.getFightsByTatami(tatami._id, controller.signal)
            if (!controller.signal.aborted) {
                setSelectedTatamisFights(response.data)
            }
        } catch (error: any) {
            if (error?.name !== 'AbortError') {
                console.error('Ошибка загрузки боев татами:', error)
            }
        } finally {
            if (!controller.signal.aborted) {
                setTatamiLoading(false)
            }
        }
    }

    const handleSelectAll = () => {
        if (tatamiAbortRef.current) tatamiAbortRef.current.abort()
        setSelectedTatami(null)
        setSelectedTatamisFights([])
        setTatamiLoading(false)
    }

    const getFightsForTatami = useCallback((tatamiId: string): IFight[] => {
        return activeFights.filter(f => f.tatami && String(f.tatami._id) === String(tatamiId))
    }, [activeFights])

const getPreviewFightsForTatami = useCallback((tatamiId: string) => {
    const all = getFightsForTatami(tatamiId)
    const total = all.length
    if (total === 0) return []

    const result = []

    const inProgressIdx = all.findIndex(f => f.status === 'in_progress')
    if (inProgressIdx !== -1) {
        result.push({ fight: all[inProgressIdx], fightIndex: total - inProgressIdx })
    }

    const latest = [...all]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .find(f => f.status !== 'in_progress')

    if (latest) {
        const latestIdx = all.indexOf(latest)
        if (latestIdx !== inProgressIdx) {
            result.push({ fight: latest, fightIndex: total - latestIdx })
        }
    }

    return result
}, [getFightsForTatami])

    const getActiveFightsForTatami = useCallback((tatamiId: string): number => {
        return getFightsForTatami(tatamiId).filter(f => f.status === 'in_progress').length
    }, [getFightsForTatami])

    const stats = useMemo(() => ({
        activeFights: activeFights.filter(f => f.status === 'in_progress').length,
        completed: activeFights.filter(f => f.status === 'completed').length,
        participants: new Set(
            activeFights.flatMap(f => [
                f.fighter1 ? String(f.fighter1._id) : null,
                f.fighter2 ? String(f.fighter2._id) : null,
            ].filter(Boolean))
        ).size,
    }), [activeFights])

    if (loading) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                height: '100vh', gap: '14px',
                fontFamily: "'Manrope', sans-serif",
                color: '#8890aa', fontSize: '14px', fontWeight: 600
            }}>
                <div style={{
                    width: 40, height: 40,
                    border: '3px solid #e4e8f4',
                    borderTopColor: '#1d6fe5',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                }} />
                Загрузка...
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    return (
        <>
            {/* HEADER */}
            <header className="public-header">
                <div className="header-inner">
                    <div className="logo">
                        <div className="logo-icon">🥋</div>
                        <div className="logo-text">
                            Боевые искусства
                            <span>Онлайн-трансляция турнира</span>
                        </div>
                    </div>
                    <div className="live-pill">
                        <div className="live-dot" />
                        Live
                    </div>
                    {/* Индикатор обновления: зелёный в норме, красный при ошибке, вспышка при успехе */}
                    <div className="header-update" style={{ color: updateError ? '#e63946' : undefined }}>
                        <div className="update-dot" style={{
                            background: updateError ? '#e63946' : '#2cb67d',
                            boxShadow: refreshFlash ? '0 0 0 4px rgba(44,182,125,0.2)' : undefined,
                            transition: 'box-shadow 0.4s'
                        }} />
                        {updateError
                            ? 'Ошибка обновления'
                            : lastUpdated
                                ? `Обновлено в ${lastUpdated.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                                : 'Обновление каждые 10 сек'
                        }
                    </div>
                </div>
            </header>

            <div className="public-container">

                {/* PAGE TITLE */}
                <div className="page-title">
                    <h1>Следите за боями <em>в реальном времени</em></h1>
                </div>

                {/* STATS */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-value">{stats.activeFights}</div>
                        <div className="stat-label">Активных боёв</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏟</div>
                        <div className="stat-value">{tatamis.length}</div>
                        <div className="stat-label">Татами</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🥋</div>
                        <div className="stat-value">{stats.participants}</div>
                        <div className="stat-label">Участников</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{stats.completed}</div>
                        <div className="stat-label">Завершено</div>
                    </div>
                </div>

                {/* TABS — с бейджами активных боёв на каждом татами */}
                <div className="tabs-wrap">
                    <button
                        className={`tab ${selectedTatami === null ? 'active' : ''}`}
                        onClick={handleSelectAll}
                    >
                        Все татами
                        {stats.activeFights > 0 && (
                            <span style={{
                                marginLeft: 6,
                                background: selectedTatami === null ? 'rgba(255,255,255,0.3)' : '#1d6fe5',
                                color: '#fff',
                                fontSize: 10, fontWeight: 700,
                                padding: '1px 6px', borderRadius: 10,
                                lineHeight: '16px', display: 'inline-block'
                            }}>
                                {stats.activeFights}
                            </span>
                        )}
                    </button>

                    {tatamis.map(tatami => {
                        const activeCount = getActiveFightsForTatami(tatami._id)
                        const isSelected = selectedTatami?._id === tatami._id
                        return (
                            <button
                                key={tatami._id}
                                className={`tab ${isSelected ? 'active' : ''}`}
                                onClick={() => handleSelectTatami(tatami)}
                            >
                                🥋 Татами №{tatami.number}
                                {activeCount > 0 && (
                                    <span style={{
                                        marginLeft: 6,
                                        background: isSelected ? 'rgba(255,255,255,0.3)' : '#e63946',
                                        color: '#fff',
                                        fontSize: 10, fontWeight: 700,
                                        padding: '1px 6px', borderRadius: 10,
                                        lineHeight: '16px', display: 'inline-block'
                                    }}>
                                        {activeCount}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* SELECTED TATAMI MODE */}
                {selectedTatami ? (
                    <div>
                        <div className="tatami-header">
                            <div className="tatami-left">
                                <div className="tatami-badge">🥋</div>
                                <div>
                                    <div className="tatami-name">Татами №{selectedTatami.number}</div>
                                    <div className="tatami-meta">
                                        {tatamiLoading ? 'Загрузка...' : `${selectedTatamisFights.length} боёв`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {tatamiLoading ? (
                            <div className="empty-card">
                                <div className="empty-icon">⏳</div>
                                <div className="empty-text">Загрузка боёв...</div>
                            </div>
                        ) : selectedTatamisFights.length === 0 ? (
                            <div className="empty-card">
                                <div className="empty-icon">⏸</div>
                                <div className="empty-text">Нет активных боёв</div>
                            </div>
                        ) : (
                            <div className="fights-list">
                                {selectedTatamisFights.map((fight, index) => (
                                    <PublicTatamiCard
                                        key={fight._id}
                                        fight={fight}
                                        onFighterClick={setSelectedFighterId}
                                        fightIndex={index + 1}
                                        totalFights={selectedTatamisFights.length}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ALL TATAMIS MODE */
                    <div>
                        {tatamis.length === 0 ? (
                            <div className="empty-card">
                                <div className="empty-icon">🏟</div>
                                <div className="empty-text">Нет активных татами</div>
                            </div>
                        ) : (
                            tatamis.map(tatami => {
                                const tatamiFights = getFightsForTatami(tatami._id)
                                const previewFights = getPreviewFightsForTatami(tatami._id)
                                return (
                                    <div key={tatami._id} className="tatami-section">
                                        <div className="tatami-header">
                                            <div className="tatami-left">
                                                <div className="tatami-badge">🥋</div>
                                                <div>
                                                    <div className="tatami-name">
                                                        Татами №{tatami.number} — {tatami.name}
                                                    </div>
                                                    <div className="tatami-meta">{tatamiFights.length} боёв</div>
                                                </div>
                                            </div>
                                            <button
                                                className="see-all"
                                                onClick={() => handleSelectTatami(tatami)}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                            >
                                                Все бои →
                                            </button>
                                        </div>

                                        {previewFights.length === 0 ? (
                                            <div className="empty-card">
                                                <div className="empty-icon">⏸</div>
                                                <div className="empty-text">Нет активных боёв</div>
                                            </div>
                                        ) : (
                                            <div className="fights-list">
                                                {previewFights.map(({ fight, fightIndex }) => (
                                                    <PublicTatamiCard
                                                        key={fight._id}
                                                        fight={fight}
                                                        onFighterClick={setSelectedFighterId}
                                                        fightIndex={fightIndex}
                                                        totalFights={tatamiFights.length}
                                                        onCardClick={() => handleSelectTatami(tatami)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}
            </div>

            {selectedFighterId && (
                <FighterStatsModal
                    fighterId={selectedFighterId}
                    onClose={() => setSelectedFighterId(null)}
                />
            )}
        </>
    )
}

export default observer(PublicView)
