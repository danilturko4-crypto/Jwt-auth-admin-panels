import React, { useState, useEffect, useRef, type FC } from "react";
import FighterService from "../services/FighterService";

interface Props {
    onFighterCreated: () => void;
}

const CreateFighterForm: FC<Props> = ({ onFighterCreated }) => {
    const [name, setName] = useState('')
    const [team, setTeam] = useState('')
    const [weight, setWeight] = useState('')
    const [photo, setPhoto] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [dragOver, setDragOver] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Очищаем таймеры и object URL при анмаунте
    useEffect(() => {
        return () => {
            if (successTimerRef.current) clearTimeout(successTimerRef.current)
            if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
            if (photoPreview) URL.revokeObjectURL(photoPreview)
        }
    }, [])

    const applyPhoto = (file: File | null) => {
        if (photoPreview) URL.revokeObjectURL(photoPreview)
        setPhoto(file)
        setPhotoPreview(file ? URL.createObjectURL(file) : null)
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        applyPhoto(e.target.files?.[0] || null)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) applyPhoto(file)
    }

    const handleRemovePhoto = () => {
        applyPhoto(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async () => {
        if (loading || !name.trim()) return
        setError('')
        setSuccess('')

        setLoading(true)
        try {
            await FighterService.createFighter(name.trim(), team.trim(), weight.trim(), photo)

            setSuccess(`Боец ${name.trim()} успешно создан!`)
            setName('')
            setTeam('')
            setWeight('')
            applyPhoto(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
            onFighterCreated()

            successTimerRef.current = setTimeout(() => setSuccess(''), 3000)
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'Ошибка создания бойца'
            setError(msg)
            errorTimerRef.current = setTimeout(() => setError(''), 5000)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) handleSubmit()
    }

    const canSubmit = name.trim() && !loading

    return (
        <div style={s.wrap}>
            <h3 style={s.title}>👤 Создать нового бойца</h3>

            <div style={s.row}>
                {/* Левая колонка: поля */}
                <div style={s.fields}>
                    <input
                        type="text"
                        placeholder="Имя бойца *"
                        value={name}
                        onChange={e => { setName(e.target.value); setError('') }}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        style={{ ...s.input, borderColor: !name.trim() && error ? '#e63946' : '#e4e8f4' }}
                    />
                    <input
                        type="text"
                        placeholder="Команда (необязательно)"
                        value={team}
                        onChange={e => setTeam(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        style={s.input}
                    />
                    <input
                        type="text"
                        placeholder="Весовая категория (необязательно)"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        style={s.input}
                    />
                </div>

                {/* Правая колонка: фото */}
                <div style={s.photoCol}>
                    {photoPreview ? (
                        <div style={s.previewWrap}>
                            <img src={photoPreview} alt="preview" style={s.preview} />
                            <button onClick={handleRemovePhoto} style={s.removeBtn} title="Удалить фото">×</button>
                        </div>
                    ) : (
                        <div
                            style={{ ...s.dropZone, borderColor: dragOver ? '#1d6fe5' : '#c7d9fd', background: dragOver ? '#eff6ff' : '#f4f6fb' }}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                            <div style={s.dropText}>Нажмите или перетащите фото</div>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            {error && <div style={s.errorBox}>❌ {error}</div>}
            {success && <div style={s.successBox}>✅ {success}</div>}

            <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{ ...s.btn, opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
            >
                {loading ? 'Создание...' : 'Создать бойца'}
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
        gap: 16,
        marginBottom: 14,
        alignItems: 'flex-start',
    },
    fields: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        fontSize: 14,
        boxSizing: 'border-box' as const,
        border: '1.5px solid #e4e8f4',
        borderRadius: 8,
        backgroundColor: '#fff',
        fontFamily: "'Manrope', sans-serif",
        outline: 'none',
        transition: 'border-color 0.15s',
    },
    photoCol: {
        flexShrink: 0,
        width: 110,
    },
    dropZone: {
        width: 110,
        height: 110,
        border: '2px dashed',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'center',
        padding: 8,
    },
    dropText: {
        fontSize: 11,
        color: '#8890aa',
        fontWeight: 600,
        lineHeight: 1.3,
        fontFamily: "'Manrope', sans-serif",
    },
    previewWrap: {
        position: 'relative',
        width: 110,
        height: 110,
    },
    preview: {
        width: 110,
        height: 110,
        objectFit: 'cover',
        borderRadius: 10,
        border: '1.5px solid #c7d9fd',
        display: 'block',
    },
    removeBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: '#e63946',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        fontWeight: 700,
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

export default CreateFighterForm