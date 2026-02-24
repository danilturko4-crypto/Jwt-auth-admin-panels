import React, { useContext, useState, type FC } from "react";
import { Context } from "../main";
import { observer } from "mobx-react-lite";

const LoginForm: FC = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const { store } = useContext(Context)

    const handleLogin = async () => {
        setError('')
        try {
            await store.login(email, password)
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Ошибка входа')
        }
    }

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Вход в систему</h2>
            
            <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ 
                    width: '100%', 
                    padding: '10px', 
                    marginBottom: '10px',
                    fontSize: '16px'
                }}
            />
            
            <input
                type="password"
                value={password}
                placeholder="Пароль"
                onChange={e => setPassword(e.target.value)}
                style={{ 
                    width: '100%', 
                    padding: '10px', 
                    marginBottom: '10px',
                    fontSize: '16px'
                }}
            />

            {error && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                    {error}
                </div>
            )}

            <button 
                onClick={handleLogin}
                style={{ 
                    width: '100%', 
                    padding: '10px', 
                    fontSize: '16px',
                    cursor: 'pointer'
                }}
            >
                Войти
            </button>
        </div>
    )
}

export default observer(LoginForm)