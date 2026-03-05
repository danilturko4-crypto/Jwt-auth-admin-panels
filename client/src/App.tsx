import { useContext, useEffect, type FC } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import SuperAdminPanel from "./components/SuperAdminPanel";
import AdminPanel from "./components/AdminPanel";
import PublicView from "./components/PublicView";
import { Context } from "./main";
import { observer } from "mobx-react-lite";

const App: FC = () => {
    const { store } = useContext(Context)
    const isAdminPath = window.location.pathname === '/admin'

    useEffect(() => {
        if (localStorage.getItem('token')) {
            store.checkAuth()
        }
    }, [])

    // Единый лоадер на всё приложение — показывается только пока идёт checkAuth
    if (store.isLoading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                gap: 14,
                fontFamily: "'Manrope', sans-serif",
                background: '#f4f6fb'
            }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid #e4e8f4',
                    borderTopColor: '#1d6fe5',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span style={{ color: '#8890aa', fontSize: 14, fontWeight: 600 }}>
                    Загрузка...
                </span>
            </div>
        )
    }

    // Публичный режим для зрителей
    if (!isAdminPath && !store.isAuth) {
        return <PublicView />
    }

    // Страница входа для админов
    if (isAdminPath && !store.isAuth) {
        return (
            <>
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    zIndex: 100
                }}>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#1d6fe5',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600,
                            fontFamily: "'Manrope', sans-serif"
                        }}
                    >
                        ← На главную
                    </button>
                </div>
                <LoginForm />
            </>
        )
    }

    // Роутинг по ролям
    if (store.isSuperAdmin) return <SuperAdminPanel />
    if (store.isAdmin) return <AdminPanel />

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: "'Manrope', sans-serif",
            color: '#8890aa',
            fontSize: 14,
            fontWeight: 600
        }}>
            Неизвестная роль
        </div>
    )
}

export default observer(App)