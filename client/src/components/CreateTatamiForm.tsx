import React, { useContext, useState, useRef, useEffect, useCallback, type FC } from "react";
import { Context } from "../main";

interface Admin {
    id: string;
    email: string;
    assignedTatami?: any[];
}

interface Props {
    admins: Admin[];
}

const CreateTatamiForm: FC<Props> = ({ admins }) => {
    const [number, setNumber] = useState('')
    const [name, setName] = useState('')
    const [adminId, setAdminId] = useState('')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { store } = useContext(Context)
    const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (successTimerRef.current) clearTimeout(successTimerRef.current)
            if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
        }
    }, [])

    const selectedAdmin = admins.find(a => a.id === adminId) || null

    const handleCreateTatami = useCallback(async () => {
        if (loading) return
        setError('')
        setSuccess('')

        const num = parseInt(number)
        if (!number || isNaN(num) || num <= 0) {
            setError('Введите корректный номер татами')
            return
        }
        if (!name.trim()) {
            setError('Введите название татами')
            return
        }
        if (!adminId) {
            setError('Выберите администратора')
            return
        }

        setLoading(true)
        try {
            await store.createTatami(num, name.trim(), adminId)
            setSuccess(`Татами №${number} «${name.trim()}» успешно создано!`)
            setNumber('')
            setName('')
            setAdminId('')
            successTimerRef.current = setTimeout(() => setSuccess(''), 3000)
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'Ошибка создания татами'
            setError(msg)
            errorTimerRef.current = setTimeout(() => setError(''), 5000)
        } finally {
            setLoading(false)
        }
    }, [loading, number, name, adminId, store])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) handleCreateTatami()
    }

    const canSubmit = number && name.trim() && adminId && !loading
    const tatamiCount = Array.isArray(selectedAdmin?.assignedTatami) ? selectedAdmin!.assignedTatami.length : 0

    return (
        <div style={s.wrap}>
            <h3 style={s.title}>🥋 Создать татами</h3>

            <div style={s.row}>
                <input
                    type="number"
                    placeholder="Номер *"
                    value={number}
                    min={1}
                    onChange={e => { setNumber(e.target.value); setError('') }}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    style={{ ...s.input, flex: '0 0 120px' }}
                />
                <input
                    type="text"
                    placeholder="Название татами *"
                    value={name}
                    onChange={e => { setName(e.target.value); setError('') }}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    style={{ ...s.input, flex: 1 }}
                />
            </div>

            <select
                value={adminId}
                onChange={e => { setAdminId(e.target.value); setError('') }}
                disabled={loading}
                style={s.select}
            >
                <option value="">— Выберите администратора —</option>
                {[...admins]
                    .sort((a, b) => a.email.localeCompare(b.email))
                    .map(admin => {
                        const count = Array.isArray(admin.assignedTatami) ? admin.assignedTatami.length : 0
                        return (
                            <option key={admin.id} value={admin.id}>
                                {admin.email}{count > 0 ? ` · ${count} татами` : ''}
                            </option>
                        )
                    })
                }
            </select>

            {/* Предупреждение если у админа уже есть татами */}
            {selectedAdmin && tatamiCount > 0 && (
                <div style={s.warningBox}>
                    ⓘ У {selectedAdmin.email} уже привязано {tatamiCount} {tatamiCount === 1 ? 'татами' : 'татами'}
                </div>
            )}

            {error && <div style={s.errorBox}>❌ {error}</div>}
            {success && <div style={s.successBox}>✅ {success}</div>}

            <button
                onClick={handleCreateTatami}
                disabled={!canSubmit}
                style={{ ...s.btn, opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
            >
                {loading ? 'Создание...' : 'Создать татами'}
            </button>
        </div>
    )
}

const s: Record<string, React.CSSProperties> = {
    wrap: {
        padding: '20px',
        border: '1.5px solid #e4e8f4',
        borderRadius: 12,
        backgroundColor: '#f4f6fb',
    },
    title: {
        margin: '0 0 16px 0',
        fontSize: 16,
        fontWeight: 700,
        color: '#14172b',
        fontFamily: "'Manrope', sans-serif",
    },
    row: {
        display: 'flex',
        gap: 10,
        marginBottom: 10,
    },
    input: {
        padding: '10px 12px',
        fontSize: 14,
        border: '1.5px solid #e4e8f4',
        borderRadius: 8,
        backgroundColor: '#fff',
        fontFamily: "'Manrope', sans-serif",
        outline: 'none',
        boxSizing: 'border-box' as const,
        width: '100%',
    },
    select: {
        width: '100%',
        padding: '10px 12px',
        fontSize: 14,
        border: '1.5px solid #e4e8f4',
        borderRadius: 8,
        backgroundColor: '#fff',
        fontFamily: "'Manrope', sans-serif",
        outline: 'none',
        boxSizing: 'border-box' as const,
        marginBottom: 10,
    },
    warningBox: {
        color: '#f4802a',
        marginBottom: 10,
        padding: '10px 12px',
        backgroundColor: '#fff8f0',
        borderRadius: 8,
        border: '1px solid #fdd5ae',
        fontSize: 13,
        fontFamily: "'Manrope', sans-serif",
    },
    errorBox: {
        color: '#e63946',
        marginBottom: 10,
        padding: '10px 12px',
        backgroundColor: '#fff1f2',
        borderRadius: 8,
        border: '1px solid #ffc9cc',
        fontSize: 13,
        fontFamily: "'Manrope', sans-serif",
    },
    successBox: {
        color: '#2cb67d',
        marginBottom: 10,
        padding: '10px 12px',
        backgroundColor: '#f0faf5',
        borderRadius: 8,
        border: '1px solid #b2e8d0',
        fontSize: 13,
        fontFamily: "'Manrope', sans-serif",
    },
    btn: {
        width: '100%',
        padding: '11px',
        fontSize: 14,
        backgroundColor: '#1d6fe5',
        color: 'white',
        border: 'none',
        borderRadius: 8,
        fontWeight: 700,
        fontFamily: "'Manrope', sans-serif",
        transition: 'opacity 0.15s',
    },
}

export default CreateTatamiForm