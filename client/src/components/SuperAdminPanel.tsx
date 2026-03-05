import React, { useContext, useEffect, useState, useCallback, type FC } from "react";
import { Context } from "../main";
import { observer } from "mobx-react-lite";
import CreateAdminForm from "./CreateAdminForm";
import CreateTatamiForm from "./CreateTatamiForm";
import TatamiList from "./TatamiList";
import FightList from "./FightList";
import CreateFighterForm from "./CreateFighterForm";
import FighterList from "./FighterList";
import UserService from "../services/UserService";
import type { IUser } from "../models/IUsers";
import '../styles/admin.css';

const SuperAdminPanel: FC = () => {
    const { store } = useContext(Context)
    const [admins, setAdmins] = useState<IUser[]>([])
    const [activeTab, setActiveTab] = useState<'admins' | 'tatamis' | 'fighters' | 'fights'>('admins')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [tatamiDeleteError, setTatamiDeleteError] = useState('')
    const [confirmDeleteTatamiId, setConfirmDeleteTatamiId] = useState<string | null>(null)

    const loadAdmins = useCallback(async () => {
        try {
            const response = await UserService.fetchAdmins()
            setAdmins(response.data)
        } catch (e: any) {
            console.error('Ошибка загрузки админов', e)
        }
    }, [])

    useEffect(() => {
        const init = async () => {
            setError('')
            try {
                // Всё параллельно
                await Promise.all([
                    loadAdmins(),
                    store.loadTatamis(),
                    store.loadFighters(),
                    store.loadAllFights(),
                ])
            } catch (e: any) {
                setError(e?.response?.data?.message || 'Ошибка загрузки данных')
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [loadAdmins, store])

    const handleTatamiStatusChange = async (tatamiId: string, isActive: boolean) => {
        try {
            await store.updateTatamiStatus(tatamiId, isActive)
        } catch (e: any) {
            console.error('Ошибка изменения статуса', e)
        }
    }

    const handleTatamiDelete = async (tatamiId: string) => {
        setTatamiDeleteError('')
        try {
            await store.deleteTatami(tatamiId)
            await loadAdmins()
            setConfirmDeleteTatamiId(null)
        } catch (e: any) {
            setTatamiDeleteError(e?.response?.data?.message || 'Ошибка удаления татами')
            setConfirmDeleteTatamiId(null)
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
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                <p style={{ color: '#e63946', fontWeight: 600, marginBottom: 16 }}>{error}</p>
                <button style={s.btnPrimary} onClick={() => window.location.reload()}>
                    Попробовать снова
                </button>
            </div>
        )
    }

    return (
        <div style={s.page}>

            {/* HEADER */}
            <div className="admin-header" style={s.header}>
                <div>
                    <h1 style={s.title}>Главный администратор</h1>
                    <span style={s.subtitle}>Полный доступ к системе</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={s.emailBadge}>{store.user.email}</span>
                    <button style={s.btnDanger} onClick={() => store.logout()}>Выйти</button>
                </div>
            </div>

            {/* TABS */}
            <div className="admin-tabs" style={s.tabs}>
                {([
                    { key: 'admins',   label: '👥 Админы',   count: admins.length },
                    { key: 'tatamis',  label: '🥋 Татами',   count: store.tatamis.length },
                    { key: 'fighters', label: '👤 Бойцы',    count: store.fighters.length },
                    { key: 'fights',   label: '⚔️ Все бои',  count: store.fights.length },
                ] as const).map(({ key, label, count }) => {
                    const isActive = activeTab === key
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            style={isActive ? s.tabActive : s.tab}
                        >
                            {label}
                            <span style={{
                                marginLeft: 6,
                                background: isActive ? 'rgba(255,255,255,0.25)' : '#e4e8f4',
                                color: isActive ? '#fff' : '#8890aa',
                                fontSize: 10, fontWeight: 700,
                                padding: '1px 6px', borderRadius: 10,
                                lineHeight: '16px', display: 'inline-block'
                            }}>
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* CONTENT */}
            {activeTab === 'admins' && (
                <div>
                    <CreateAdminForm onAdminCreated={loadAdmins} />
                    <div style={s.divider} />
                    <h3 style={s.sectionTitle}>📋 Список администраторов ({admins.length})</h3>
                    {admins.length === 0 ? (
                        <div style={s.empty}>
                            <div style={{ fontSize: 24, opacity: 0.35, marginBottom: 8 }}>👥</div>
                            <div style={s.emptyText}>Нет администраторов</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {admins.map(admin => (
                                <div key={admin.id} style={s.adminRow}>
                                    <strong style={{ fontSize: 14, color: '#14172b' }}>{admin.email}</strong>
                                    {Array.isArray(admin.assignedTatami) && admin.assignedTatami.length > 0 ? (
                                        <span style={s.tatamiPill}>
                                            ✅ {admin.assignedTatami.length} татами
                                        </span>
                                    ) : (
                                        <span style={s.noTatamiPill}>Без татами</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'tatamis' && (
                <div>
                    <CreateTatamiForm admins={admins} />
                    <div style={s.divider} />
                    {tatamiDeleteError && (
                        <div style={s.errorBox}>❌ {tatamiDeleteError}</div>
                    )}
                    {/* Подтверждение удаления татами */}
                    {confirmDeleteTatamiId && (
                        <div style={s.confirmBox}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#14172b' }}>
                                Удалить татами? Привязка администратора также будет снята.
                            </span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    style={s.btnDanger}
                                    onClick={() => handleTatamiDelete(confirmDeleteTatamiId)}
                                >
                                    Удалить
                                </button>
                                <button
                                    style={{ ...s.btnDanger, background: '#8890aa' }}
                                    onClick={() => setConfirmDeleteTatamiId(null)}
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    )}
                    <TatamiList
                        tatamis={store.tatamis}
                        onStatusChange={handleTatamiStatusChange}
                        onDelete={setConfirmDeleteTatamiId}
                        canEdit={true}
                    />
                </div>
            )}

            {activeTab === 'fighters' && (
                <div>
                    <CreateFighterForm onFighterCreated={() => store.loadFighters()} />
                    <div style={s.divider} />
                    <FighterList
                        fighters={store.fighters}
                        canEdit={true}
                        onFighterUpdated={() => store.loadFighters()}
                    />
                </div>
            )}

            {activeTab === 'fights' && (
                <FightList
                    fights={store.fights}
                    canEdit={true}
                    fighters={store.fighters}
                    groupByTatami={true}
                    onStatusChange={(id, status) => store.updateFightStatus(id, status)}
                    onResultChange={(id, winner, score) => store.updateFightResult(id, winner, score)}
                    onEditFight={(id, f1, f2) => store.editFight(id, f1, f2)}
                />
            )}
        </div>
    )
}

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
        flexWrap: 'wrap' as const,
        marginBottom: 24,
        paddingBottom: 20,
        borderBottom: '1px solid #e4e8f4',
    },
    title: {
        margin: '0 0 4px 0',
        fontSize: 22,
        fontWeight: 800,
        color: '#14172b',
    },
    subtitle: {
        fontSize: 13,
        color: '#8890aa',
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
        flexWrap: 'wrap' as const,
    },
    tab: {
        padding: '10px 16px',
        backgroundColor: '#f4f6fb',
        color: '#8890aa',
        border: '1.5px solid #e4e8f4',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'Manrope', sans-serif",
    },
    tabActive: {
        padding: '10px 16px',
        backgroundColor: '#1d6fe5',
        color: '#fff',
        border: '1.5px solid #1d6fe5',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'Manrope', sans-serif",
        boxShadow: '0 4px 14px rgba(29,111,229,0.25)',
    },
    sectionTitle: {
        margin: '0 0 14px 0',
        fontSize: 15,
        fontWeight: 700,
        color: '#14172b',
    },
    divider: {
        borderTop: '1px solid #e4e8f4',
        margin: '24px 0',
        border: 'none',
        borderTopWidth: 1,
        borderTopStyle: 'solid' as const,
        borderTopColor: '#e4e8f4',
    },
    adminRow: {
        padding: '12px 16px',
        backgroundColor: '#fff',
        borderRadius: 10,
        border: '1.5px solid #e4e8f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    tatamiPill: {
        fontSize: 12,
        color: '#2cb67d',
        backgroundColor: '#f0faf5',
        padding: '3px 10px',
        borderRadius: 20,
        border: '1px solid #b2e8d0',
        fontWeight: 600,
    },
    noTatamiPill: {
        fontSize: 12,
        color: '#8890aa',
        backgroundColor: '#f4f6fb',
        padding: '3px 10px',
        borderRadius: 20,
        border: '1px solid #e4e8f4',
        fontWeight: 600,
    },
    confirmBox: {
        marginBottom: 14,
        padding: '12px 16px',
        backgroundColor: '#fff1f2',
        border: '1.5px solid #ffc9cc',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap' as const,
    },
    errorBox: {
        marginBottom: 14,
        padding: '10px 14px',
        backgroundColor: '#fff1f2',
        border: '1.5px solid #ffc9cc',
        borderRadius: 8,
        fontSize: 13,
        color: '#e63946',
        fontWeight: 600,
    },
    btnPrimary: {
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

export default observer(SuperAdminPanel)