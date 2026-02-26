import React, { useContext, useEffect, useState, type FC } from "react";
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

const SuperAdminPanel: FC = () => {
    const { store } = useContext(Context)
    const [admins, setAdmins] = useState<IUser[]>([])
    const [activeTab, setActiveTab] = useState<'admins' | 'tatamis' | 'fighters' | 'fights'>('admins')

    useEffect(() => {
        loadAdmins()
        store.loadTatamis()
        store.loadFighters()
        store.loadAllFights()
    }, [])

    async function loadAdmins() {
        try {
            const response = await UserService.fetchAdmins()
            setAdmins(response.data)
        } catch (error) {
            console.log('Ошибка загрузки админов', error);
        }
    }

    const handleTatamiStatusChange = async (tatamiId: string, isActive: boolean) => {
        try {
            await store.updateTatamiStatus(tatamiId, isActive)
        } catch (error) {
            console.log('Ошибка изменения статуса', error);
        }
    }

    const handleTatamiDelete = async (tatamiId: string) => {
        if (!confirm('Удалить татами? Привязка администратора также будет снята.')) return
        try {
            await store.deleteTatami(tatamiId)
            await loadAdmins()
        } catch (error) {
            console.log('Ошибка удаления татами', error);
        }
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h1>👑 Панель главного администратора</h1>
                <p><strong>Email:</strong> {store.user.email}</p>
                <button 
                    onClick={() => store.logout()}
                    style={{ 
                        padding: '10px 20px', 
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    Выйти
                </button>
            </div>

            {/* Табы */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setActiveTab('admins')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'admins' ? '#2196F3' : '#e0e0e0',
                        color: activeTab === 'admins' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    👥 Админы
                </button>
                <button
                    onClick={() => setActiveTab('tatamis')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'tatamis' ? '#2196F3' : '#e0e0e0',
                        color: activeTab === 'tatamis' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🥋 Татами
                </button>
                <button
                    onClick={() => setActiveTab('fighters')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'fighters' ? '#2196F3' : '#e0e0e0',
                        color: activeTab === 'fighters' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    👤 Бойцы
                </button>
                <button
                    onClick={() => setActiveTab('fights')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'fights' ? '#2196F3' : '#e0e0e0',
                        color: activeTab === 'fights' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ⚔️ Все бои
                </button>
            </div>

            {/* Контент табов */}
            {activeTab === 'admins' && (
                <>
                    <CreateAdminForm onAdminCreated={loadAdmins} />
                    <div style={{ marginTop: '20px' }}>
                        <h3>📋 Список администраторов ({admins.length})</h3>
                        {admins.map(admin => (
                            <div 
                                key={admin.id}
                                style={{ 
                                    padding: '15px', 
                                    marginBottom: '10px',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd'
                                }}
                            >
                                <strong>{admin.email}</strong>
                                {admin.assignedTatami && (
                                    <span style={{ marginLeft: '10px', color: '#4caf50' }}>
                                        ✅ Привязан к татами
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'tatamis' && (
                <>
                    <CreateTatamiForm admins={admins} />
                    <TatamiList
                        tatamis={store.tatamis}
                        onStatusChange={handleTatamiStatusChange}
                        onDelete={handleTatamiDelete}
                        canEdit={true}
                    />
                </>
            )}

            {activeTab === 'fighters' && (
                <>
                    <CreateFighterForm onFighterCreated={() => store.loadFighters()} />
                    <FighterList
                        fighters={store.fighters}
                        canEdit={true}
                        onFighterUpdated={() => store.loadFighters()}
                    />
                </>
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

export default observer(SuperAdminPanel)