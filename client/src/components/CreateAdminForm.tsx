import React, { useContext, useState, type FC } from "react";
import { Context } from "../main";
import { observer } from "mobx-react-lite";

interface Props {
    onAdminCreated: () => void;
}

const CreateAdminForm: FC<Props> = ({ onAdminCreated }) => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [success, setSuccess] = useState<string>('')
    const [error, setError] = useState<string>('')
    const { store } = useContext(Context)

    const handleCreateAdmin = async () => {
        setError('')
        setSuccess('')
        
        if (!email || !password) {
            setError('Заполните все поля')
            return
        }

        try {
            await store.createAdmin(email, password)
            setSuccess(`Админ ${email} успешно создан!`)
            setEmail('')
            setPassword('')
            // Обновляем список админов
            onAdminCreated()
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Ошибка создания админа')
        }
    }

    return (
        <div style={{ 
            padding: '20px', 
            border: '1px solid #ccc', 
            borderRadius: '8px',
            marginTop: '20px',
            backgroundColor: '#f9f9f9'
        }}>
            <h3>👥 Создать нового администратора</h3>
            
            <input
                type="text"
                placeholder="Email нового админа"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ 
                    width: '100%', 
                    padding: '10px', 
                    marginBottom: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
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
                    fontSize: '16px',
                    boxSizing: 'border-box'
                }}
            />

            {error && (
                <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                    ❌ {error}
                </div>
            )}

            {success && (
                <div style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
                    ✅ {success}
                </div>
            )}

            <button 
                onClick={handleCreateAdmin}
                style={{ 
                    width: '100%', 
                    padding: '10px', 
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                }}
            >
                Создать админа
            </button>
        </div>
    )
}

export default observer(CreateAdminForm)