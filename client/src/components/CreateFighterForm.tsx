import React, { useState, type FC } from "react";
import { observer } from "mobx-react-lite";
import FighterService from "../services/FighterService";

interface Props {
    onFighterCreated: () => void;
}

const CreateFighterForm: FC<Props> = ({ onFighterCreated }) => {
    const [name, setName] = useState('')
    const [team, setTeam] = useState('')
    const [weight, setWeight] = useState('')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        setError('')
        setSuccess('')

        if (!name.trim()) {
            setError('Введите имя бойца')
            return
        }

        try {
            await FighterService.createFighter(name.trim(), team.trim(), weight.trim())
            setSuccess(`Боец ${name} успешно создан!`)
            setName('')
            setTeam('')
            setWeight('')
            onFighterCreated()
            
            setTimeout(() => setSuccess(''), 3000)
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Ошибка создания бойца')
            setTimeout(() => setError(''), 5000)
        }
    }

    return (
        <div style={{
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
        }}>
            <h3>👤 Создать нового бойца</h3>

            <input
                type="text"
                placeholder="Имя бойца *"
                value={name}
                onChange={e => {
                    setName(e.target.value)
                    setError('')
                    setSuccess('')
                }}
                style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}
            />

            <input
                type="text"
                placeholder="Команда (необязательно)"
                value={team}
                onChange={e => setTeam(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}
            />

            <input
                type="text"
                placeholder="Весовая категория (необязательно)"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}
            />

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
                onClick={handleSubmit}
                disabled={!name.trim()}
                style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    cursor: !name.trim() ? 'not-allowed' : 'pointer',
                    backgroundColor: !name.trim() ? '#ccc' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                }}
            >
                Создать бойца
            </button>
        </div>
    )
}

export default observer(CreateFighterForm)