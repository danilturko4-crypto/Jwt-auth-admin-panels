import { useContext, useState, type FC } from "react";
import { Context } from "../main";
import { observer } from "mobx-react-lite";

const LoginForm: FC = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const { store } = useContext(Context)

    const handleLogin = async () => {
        setError('')
        setLoading(true)
        try {
            await store.login(email, password)
            window.location.href = '/'
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Ошибка входа')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin()
    }

    return (
        <div className="login-page">
            <div className="login-card">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-icon">🥋</div>
                    <div className="login-logo-text">
                        Judify
                        <span>Система управления турниром</span>
                    </div>
                </div>

                <h1 className="login-title">Вход в систему</h1>
                <p className="login-sub">Введите данные для доступа к панели управления</p>

                <div className="login-fields">
                    <div className="login-field">
                        <label className="login-label">Email</label>
                        <div className="login-input-wrap">
                            <span className="login-input-icon">✉️</span>
                            <input
                                className="login-input"
                                type="text"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label className="login-label">Пароль</label>
                        <div className="login-input-wrap">
                            <span className="login-input-icon">🔒</span>
                            <input
                                className="login-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="login-error">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <button
                    className={`login-btn${loading ? ' login-btn--loading' : ''}`}
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="login-spinner" />
                    ) : (
                        'Войти'
                    )}
                </button>
            </div>

            <style>{`
                .login-page {
                    min-height: 100vh;
                    background: var(--bg, #f4f6fb);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .login-card {
                    background: #fff;
                    border: 1px solid var(--border, #e4e8f4);
                    border-radius: 24px;
                    padding: 40px 36px;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 8px 40px rgba(29,111,229,0.10);
                    animation: loginFadeUp 0.4s ease both;
                }

                @keyframes loginFadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .login-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 32px;
                }

                .login-logo-icon {
                    width: 44px; height: 44px;
                    background: var(--bg, #f4f6fb);
                    border: 1px solid var(--border, #e4e8f4);
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 22px;
                }

                .login-logo-text {
                    font-family: 'Unbounded', sans-serif;
                    font-size: 17px;
                    font-weight: 700;
                    color: #14172b;
                    line-height: 1.2;
                }

                .login-logo-text span {
                    display: block;
                    font-family: 'Manrope', sans-serif;
                    font-size: 11px;
                    font-weight: 400;
                    color: var(--muted, #8890aa);
                    margin-top: 2px;
                }

                .login-title {
                    font-family: 'Unbounded', sans-serif;
                    font-size: 22px;
                    font-weight: 900;
                    color: #14172b;
                    margin-bottom: 6px;
                }

                .login-sub {
                    font-size: 13px;
                    color: var(--muted, #8890aa);
                    margin-bottom: 28px;
                    line-height: 1.5;
                }

                .login-fields {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .login-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .login-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #14172b;
                    letter-spacing: 0.3px;
                }

                .login-input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .login-input-icon {
                    position: absolute;
                    left: 13px;
                    font-size: 15px;
                    pointer-events: none;
                    line-height: 1;
                }

                .login-input {
                    width: 100%;
                    padding: 11px 14px 11px 40px;
                    font-family: 'Manrope', sans-serif;
                    font-size: 14px;
                    color: #14172b;
                    background: var(--bg, #f4f6fb);
                    border: 1.5px solid var(--border, #e4e8f4);
                    border-radius: 12px;
                    outline: none;
                    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
                }

                .login-input::placeholder { color: #b0bac9; }

                .login-input:focus {
                    border-color: var(--blue, #1d6fe5);
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(29,111,229,0.12);
                }

                .login-error {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #fff1f2;
                    border: 1px solid #ffc9cc;
                    color: var(--red, #e63946);
                    font-size: 13px;
                    font-weight: 500;
                    padding: 10px 14px;
                    border-radius: 10px;
                    margin-bottom: 16px;
                    animation: loginFadeUp 0.2s ease both;
                }

                .login-btn {
                    width: 100%;
                    padding: 13px;
                    background: var(--blue, #1d6fe5);
                    color: #fff;
                    font-family: 'Unbounded', sans-serif;
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
                    box-shadow: 0 4px 14px rgba(29,111,229,0.28);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 46px;
                }

                .login-btn:hover:not(:disabled) {
                    background: #1560cc;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(29,111,229,0.36);
                }

                .login-btn:active:not(:disabled) {
                    transform: translateY(0);
                    box-shadow: 0 2px 8px rgba(29,111,229,0.2);
                }

                .login-btn--loading {
                    opacity: 0.8;
                    cursor: not-allowed;
                }

                .login-spinner {
                    width: 18px; height: 18px;
                    border: 2px solid rgba(255,255,255,0.35);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 480px) {
                    .login-card { padding: 28px 20px; border-radius: 20px; }
                    .login-title { font-size: 18px; }
                }
            `}</style>
        </div>
    )
}

export default observer(LoginForm)