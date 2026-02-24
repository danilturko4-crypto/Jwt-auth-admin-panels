import { useContext, useEffect, useState, type FC } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import SuperAdminPanel from "./components/SuperAdminPanel";
import AdminPanel from "./components/AdminPanel";
import PublicView from "./components/PublicView";
import { Context } from "./main";
import { observer } from "mobx-react-lite";

const App: FC = () => {
    const { store } = useContext(Context)
    const [isAdminMode, setIsAdminMode] = useState(false)

    useEffect(() => {
        if (localStorage.getItem('token')) {
            store.checkAuth()
            setIsAdminMode(true)
        }
    }, [])

    if (store.isLoading) {
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

    // Публичный режим (для зрителей)
    if (!isAdminMode) {
        return (
            <>
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 100
                }}>
                    <button
                        onClick={() => setIsAdminMode(true)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        🔐 Вход для админов
                    </button>
                </div>
                <PublicView />
            </>
        )
    }

    // Админский режим
    if (!store.isAuth) {
        return (
            <>
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    zIndex: 100
                }}>
                    <button
                        onClick={() => setIsAdminMode(false)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#666',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        ← Вернуться к публичному виду
                    </button>
                </div>
                <LoginForm />
            </>
        )
    }

    // Роутинг по ролям
    if (store.isSuperAdmin) {
        return <SuperAdminPanel/>
    }

    if (store.isAdmin) {
        return <AdminPanel />
    }

    return <div>Неизвестная роль</div>
}

export default observer(App);