import React, { useContext, useState, useRef, useEffect, type FC } from "react";
import { Context } from "../main";

interface Props {
    onAdminCreated: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const CreateAdminForm: FC<Props> = ({ onAdminCreated }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { store } = useContext(Context)

    const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (successTimerRef.current) clearTimeout(successTimerRef.current)
        }
    }, [])

    const handleCreateAdmin = async () => {
        setError('')
        setSuccess('')

        if (!email || !password) {
            setError('Заполните все поля')
            return
        }
        if (!EMAIL_REGEX.test(email)) {
            setError('Введите корректный email')
            return
        }

        setLoading(true)
        try {
            await store.createAdmin(email, password)
            setSuccess(`Админ ${email} успешно создан!`)
            setEmail('')
            setPassword('')
            onAdminCreated()
            successTimerRef.current = setTimeout(() => setSuccess(''), 3000)
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Ошибка создания админа')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) handleCreateAdmin()
    }

    const canSubmit = email && password && !loading

    return (
        <div style={s.wrap}>
            <h3 style={s.title}>👥 Создать нового администратора</h3>

            <div style={s.row}>
                <input
                    type="text"
                    placeholder="Email нового админа"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    style={s.input}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    style={s.input}
                />
                <button
                    onClick={handleCreateAdmin}
                    disabled={!canSubmit}
                    style={{ ...s.btn, opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
                >
                    {loading ? 'Создание...' : 'Создать'}
                </button>
            </div>

            {error && <div style={s.errorBox}>❌ {error}</div>}
            {success && <div style={s.successBox}>✅ {success}</div>}
        </div>
    )
}

const s: Record<string, React.CSSProperties> = {
    wrap: {
        padding: '20px',
        border: '1.5px solid #e4e8f4',
        borderRadius: 12,
        backgroundColor: '#f4f6fb',
        fontFamily: "'Manrope', sans-serif",
    },
    title: {
        margin: '0 0 16px 0',
        fontSize: 16,
        fontWeight: 700,
        color: '#14172b',
    },
    row: {
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexWrap: 'wrap' as const,
    },
    input: {
        flex: 1,
        minWidth: 160,
        padding: '10px 12px',
        fontSize: 14,
        border: '1.5px solid #e4e8f4',
        borderRadius: 8,
        backgroundColor: '#fff',
        fontFamily: "'Manrope', sans-serif",
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    btn: {
        padding: '10px 20px',
        fontSize: 14,
        backgroundColor: '#1d6fe5',
        color: 'white',
        border: 'none',
        borderRadius: 8,
        fontWeight: 700,
        fontFamily: "'Manrope', sans-serif",
        transition: 'opacity 0.15s',
        whiteSpace: 'nowrap' as const,
    },
    errorBox: {
        color: '#e63946',
        marginTop: 10,
        padding: '10px 12px',
        backgroundColor: '#fff1f2',
        borderRadius: 8,
        border: '1px solid #ffc9cc',
        fontSize: 13,
    },
    successBox: {
        color: '#2cb67d',
        marginTop: 10,
        padding: '10px 12px',
        backgroundColor: '#f0faf5',
        borderRadius: 8,
        border: '1px solid #b2e8d0',
        fontSize: 13,
    },
}

export default CreateAdminForm