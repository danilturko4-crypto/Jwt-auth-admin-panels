import React, { useContext, useEffect, useState, useCallback, type FC } from "react";
import { Context } from "../main";
import { observer } from "mobx-react-lite";
import CreateFightForm from "./CreateFightForm";
import FightList from "./FightList";
import CreateFighterForm from "./CreateFighterForm";
import FighterList from "./FighterList";
import '../styles/admin.css';
import { AlertTriangle, Building2, Shield, User, Swords } from 'lucide-react';

const AdminPanel: FC = () => {
    const { store } = useContext(Context)
    const [activeTab, setActiveTab] = useState<'fighters' | 'fights'>('fighters')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadData = useCallback(async () => {
        setError('')
        try {
            // Загружаем татами и бойцов параллельно
            await Promise.all([
                store.loadMyTatami(),
                store.loadFighters()
            ])
            // Бои зависят от татами — загружаем после
            if (store.myTatami) {
                await store.loadFightsByTatami(store.myTatami._id)
            }
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Ошибка загрузки данных')
        } finally {
            setLoading(false)
        }
    }, [store])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleCreateFight = async (fighter1Id: string, fighter2Id: string) => {
        if (!store.myTatami) return
        try {
            await store.createFight(store.myTatami._id, fighter1Id, fighter2Id)
            // Обновляем список боёв после создания
            await store.loadFightsByTatami(store.myTatami._id)
        } catch (e: any) {
            console.error('Ошибка создания боя:', e)
        }
    }

    if (loading) {
        return (
            <div style={s.centered}>
                <div style={s.spinner} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span style={{ color: '#8890aa', fontSize: 14, fontWeight: 600 }}>Загрузка...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div style={s.centered}>
                <AlertTriangle size={32} color="#e63946" style={{ marginBottom: 12 }} />
                <p style={{ color: '#e63946', fontWeight: 600, marginBottom: 16 }}>{error}</p>
                <button style={s.btnSecondary} onClick={loadData}>Попробовать снова</button>
            </div>
        )
    }

    if (!store.myTatami) {
        return (
            <div style={s.centered}>
                <Building2 size={32} color="#8890aa" style={{ marginBottom: 12 }} />
                <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Татами не привязано</h2>
                <p style={{ color: '#8890aa', marginBottom: 8 }}>Обратитесь к главному администратору</p>
                <p style={{ color: '#aaa', fontSize: 13, marginBottom: 20 }}>
                    Вы вошли как <strong>{store.user.email}</strong>
                </p>
                <button style={s.btnDanger} onClick={() => store.logout()}>Выйти</button>
            </div>
        )
    }

    return (
        <div style={s.page}>
            {/* HEADER */}
            <div className="admin-header" style={s.header}>
                <div>
                    <h1 style={s.title}>Панель администратора</h1>
                    <div style={s.tatamiPill}>
                        <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Shield size={14} /> №{store.myTatami.number} — {store.myTatami.name}
                        </span>
                        <span style={store.myTatami.isActive ? s.statusActive : s.statusInactive}>
                            {store.myTatami.isActive ? '● Активно' : '● Неактивно'}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={s.emailBadge}>{store.user.email}</span>
                    <button style={s.btnDanger} onClick={() => store.logout()}>Выйти</button>
                </div>
            </div>

            {/* TABS */}
            <div className="admin-tabs" style={s.tabs}>
                {([
                    { key: 'fighters' as const, label: 'Бойцы', icon: <User size={14} /> },
                    { key: 'fights'   as const, label: 'Бои',   icon: <Swords size={14} /> },
                ]).map(({ key, label, icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        style={activeTab === key ? s.tabActive : s.tab}
                    >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{icon}{label}</span>
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            {activeTab === 'fighters' ? (
                <div>
                    <CreateFighterForm onFighterCreated={() => store.loadFighters()} />
                    <div style={s.divider} />
                    <FighterList
                        fighters={store.fighters}
                        canEdit={true}
                        onFighterUpdated={() => store.loadFighters()}
                    />
                </div>
            ) : (
                <div>
                    <CreateFightForm
                        tatamiId={store.myTatami._id}
                        onCreateFight={handleCreateFight}
                    />
                    <div style={s.divider} />
                    <FightList
                        fights={store.fights}
                        canEdit={true}
                        fighters={store.fighters}
                        onStatusChange={(id, status) => store.updateFightStatus(id, status)}
                        onResultChange={(id, winner, score) => store.updateFightResult(id, winner, score)}
                        onEditFight={(id, f1, f2) => store.editFight(id, f1, f2)}
                    />
                </div>
            )}
        </div>
    )
}

// ── Стили ──────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
    page: {
        padding: '24px 20px 48px',
        maxWidth: 1200,
        margin: '0 auto',
        fontFamily: "'Manrope', -apple-system, sans-serif",
    },
    centered: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: "'Manrope', sans-serif",
        textAlign: 'center',
        padding: 20,
    },
    spinner: {
        width: 40,
        height: 40,
        border: '3px solid #e4e8f4',
        borderTopColor: '#1d6fe5',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        marginBottom: 14,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 24,
        paddingBottom: 20,
        borderBottom: '1px solid #e4e8f4',
    },
    title: {
        margin: '0 0 10px 0',
        fontSize: 22,
        fontWeight: 800,
        color: '#14172b',
    },
    tatamiPill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 14px',
        backgroundColor: '#eff6ff',
        borderRadius: 8,
        border: '1.5px solid #c7d9fd',
        fontSize: 14,
    },
    statusActive: {
        color: '#2cb67d',
        fontSize: 12,
        fontWeight: 600,
    },
    statusInactive: {
        color: '#e63946',
        fontSize: 12,
        fontWeight: 600,
    },
    emailBadge: {
        fontSize: 13,
        color: '#555',
        backgroundColor: '#fff',
        border: '1px solid #e4e8f4',
        borderRadius: 6,
        padding: '6px 12px',
    },
    tabs: {
        display: 'flex',
        gap: 8,
        marginBottom: 24,
    },
    tab: {
        padding: '10px 20px',
        backgroundColor: '#f4f6fb',
        color: '#8890aa',
        border: '1.5px solid #e4e8f4',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "'Manrope', sans-serif",
        transition: 'all 0.15s',
        display: 'inline-flex',
        alignItems: 'center',
    },
    tabActive: {
        padding: '10px 20px',
        backgroundColor: '#1d6fe5',
        color: '#fff',
        border: '1.5px solid #1d6fe5',
        borderRadius: 8,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "'Manrope', sans-serif",
        boxShadow: '0 4px 14px rgba(29,111,229,0.25)',
    },
    btnDanger: {
        padding: '8px 18px',
        fontSize: 14,
        cursor: 'pointer',
        backgroundColor: '#e63946',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        fontWeight: 600,
        fontFamily: "'Manrope', sans-serif",
    },
    btnSecondary: {
        padding: '8px 18px',
        fontSize: 14,
        cursor: 'pointer',
        backgroundColor: '#1d6fe5',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        fontWeight: 600,
        fontFamily: "'Manrope', sans-serif",
    },
    divider: {
        border: 'none',
        borderTop: '1px solid #e4e8f4',
        margin: '28px 0',
    },
}

export default observer(AdminPanel)