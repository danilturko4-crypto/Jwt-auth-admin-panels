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

    // Публичный режим (для зрителей) - если не на пути /admin и не авторизован
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
                            backgroundColor: '#666',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
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
    if (store.isSuperAdmin) {
        return <SuperAdminPanel/>
    }

    if (store.isAdmin) {
        return <AdminPanel />
    }

    return <div>Неизвестная роль</div>
}

export default observer(App);