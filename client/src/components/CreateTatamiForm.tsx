import React, { useContext, useState, type FC } from "react";
import { Context } from "../main";
import { observer } from "mobx-react-lite";

interface Props {
    admins: any[];
}

const CreateTatamiForm: FC<Props> = ({ admins }) => {
    const [number, setNumber] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [adminId, setAdminId] = useState<string>('')
    const [success, setSuccess] = useState<string>('')
    const [error, setError] = useState<string>('')
    const { store } = useContext(Context)

    
    const availableAdmins = admins.filter(admin => !admin.assignedTatami)

    const handleCreateTatami = async () => {
        setError('')
        setSuccess('')
        
        if (!number || !name || !adminId) {
            setError('Заполните все поля')
            return
        }

        try {
            console.log('📤 Создание татами:', { number, name, adminId }) 
            
            await store.createTatami(parseInt(number), name, adminId)
            
            setSuccess(`Татами №${number} "${name}" успешно создано!`)
            setNumber('')
            setName('')
            setAdminId('')
            
            setTimeout(() => {
                setSuccess('')
            }, 3000)
        } catch (e: any) {
            console.error('❌ Ошибка создания татами:', e)
            setError(e?.response?.data?.message || 'Ошибка создания татами')
            
            setTimeout(() => {
                setError('')
            }, 5000)
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
            <h3>🥋 Создать татами</h3>
            
            <input
                type="number"
                placeholder="Номер татами"
                value={number}
                onChange={e => setNumber(e.target.value)}
                style={{ 
                    width: '100%', 
                    padding: '10px', 
                    marginBottom: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                }}
            />
            
            <input
                type="text"
                placeholder="Название татами"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ 
                    width: '100%', 
                    padding: '10px', 
                    marginBottom: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                }}
            />

        <select
            value={adminId}
            onChange={e => {
                const selectedId = e.target.value
                console.log('🔍 Выбран админ ID:', selectedId)
                console.log('🔍 Тип ID:', typeof selectedId)
                console.log('🔍 Длина ID:', selectedId.length)
                
                const selectedAdmin = availableAdmins.find(a => a.id === selectedId)
                console.log('🔍 Найден админ:', selectedAdmin)
                
                setAdminId(selectedId)
            }}
            style={{ 
                width: '100%', 
                padding: '10px', 
                marginBottom: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
            }}
        >
            <option value="">Выберите админа</option>
            {availableAdmins.map(admin => {
                console.log('Рендер опции:', admin.id, '->', admin.email)
                return (
                    <option key={admin.id} value={admin.id}>
                        {admin.email} (ID: {admin.id})
                    </option>
                )
            })}
        </select>

            {availableAdmins.length === 0 && (
                <div style={{ 
                    color: 'orange', 
                    marginBottom: '10px',
                    padding: '10px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '4px',
                    border: '1px solid #ffc107'
                }}>
                    ⚠️ Нет доступных админов (все уже привязаны к татами)
                </div>
            )}

            {error && (
                <div style={{ 
                    color: '#d32f2f', 
                    marginBottom: '10px', 
                    padding: '10px', 
                    backgroundColor: '#ffebee', 
                    borderRadius: '4px',
                    border: '1px solid #ef5350'
                }}>
                    ❌ {error}
                </div>
            )}

            {success && (
                <div style={{ 
                    color: '#388e3c', 
                    marginBottom: '10px', 
                    padding: '10px', 
                    backgroundColor: '#e8f5e9', 
                    borderRadius: '4px',
                    border: '1px solid #66bb6a'
                }}>
                    ✅ {success}
                </div>
            )}

            <button 
                onClick={handleCreateTatami}
                disabled={availableAdmins.length === 0 || !number || !name || !adminId}
                style={{ 
                    width: '100%', 
                    padding: '12px', 
                    fontSize: '16px',
                    cursor: (availableAdmins.length === 0 || !number || !name || !adminId) ? 'not-allowed' : 'pointer',
                    backgroundColor: (availableAdmins.length === 0 || !number || !name || !adminId) ? '#ccc' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                }}
            >
                Создать татами
            </button>
        </div>
    )
}

export default observer(CreateTatamiForm)
