import React, { useContext, useEffect, useState, type FC } from "react";
import { Context } from "../main";
import { observer } from "mobx-react-lite";
import CreateFightForm from "./CreateFightForm";
import FightList from "./FightList";
import CreateFighterForm from "./CreateFighterForm";
import FighterList from "./FighterList";

const AdminPanel: FC = () => {
    const { store } = useContext(Context)
    const [activeTab, setActiveTab] = useState<'fighters' | 'fights'>('fighters')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        await store.loadMyTatami()
        await store.loadMyFighters()  // ← Изменили: загружаем только своих бойцов
        if (store.myTatami) {
            await store.loadFightsByTatami(store.myTatami._id)
        }
    }

    const handleCreateFight = async (fighter1Id: string, fighter2Id: string) => {
        if (store.myTatami) {
            await store.createFight(store.myTatami._id, fighter1Id, fighter2Id)
        }
    }

    if (!store.myTatami) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>⚠️ У вас еще нет привязанного татами</h2>
                <p>Обратитесь к главному администратору</p>
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
        )
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h1>🥋 Панель администратора татами</h1>
                <p><strong>Email:</strong> {store.user.email}</p>
                <div style={{ 
                    padding: '15px', 
                    backgroundColor: '#e8f5e9',
                    borderRadius: '8px',
                    marginTop: '10px',
                    border: '2px solid #4caf50'
                }}>
                    <h3 style={{ margin: '0 0 5px 0' }}>
                        Ваше татами: №{store.myTatami.number} - {store.myTatami.name}
                    </h3>
                    <p style={{ margin: 0, color: '#666' }}>
                        Статус: {store.myTatami.isActive ? '✅ Активно' : '❌ Неактивно'}
                    </p>
                </div>
                <button 
                    onClick={() => store.logout()}
                    style={{ 
                        padding: '10px 20px', 
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        marginTop: '10px'
                    }}
                >
                    Выйти
                </button>
            </div>

            {/* Табы */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveTab('fighters')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'fighters' ? '#2196F3' : '#e0e0e0',
                        color: activeTab === 'fighters' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
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
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    ⚔️ Бои
                </button>
            </div>

            {/* Контент табов */}
            {activeTab === 'fighters' ? (
                <>
                    <CreateFighterForm onFighterCreated={() => store.loadMyFighters()} />
                    <FighterList
                        fighters={store.fighters}
                        canEdit={true}
                        onFighterUpdated={() => store.loadMyFighters()}
                    />
                </>
            ) : (
                <>
                    <CreateFightForm 
                        tatamiId={store.myTatami._id}
                        onCreateFight={handleCreateFight}
                    />

                    <FightList
                        fights={store.fights}
                        canEdit={true}
                        fighters={store.fighters}
                        onStatusChange={(id, status) => store.updateFightStatus(id, status)}
                        onResultChange={(id, winner, score) => store.updateFightResult(id, winner, score)}
                        onEditFight={(id, f1, f2) => store.editFight(id, f1, f2)}
                    />
                </>
            )}
        </div>
    )
}

export default observer(AdminPanel)
