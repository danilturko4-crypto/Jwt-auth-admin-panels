import { useEffect, useState, type FC } from "react";
import PublicService, { type IFighterStats } from "../services/PublicService";
import { MapPin, Scale, Search, Clock, Trophy } from 'lucide-react';

interface Props {
    fighterId: string;
    onClose: () => void;
}

const styles = `
  .fsm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(20, 23, 43, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
    animation: fsm-fadeIn 0.2s ease;
  }

  @keyframes fsm-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes fsm-slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .fsm-modal {
    background: #ffffff;
    border: 1.5px solid #e4e8f4;
    border-radius: 20px;
    max-width: 780px;
    width: 100%;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 48px rgba(29, 111, 229, 0.13);
    animation: fsm-slideUp 0.25s ease;
    font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* ── HEADER ── */
  .fsm-header {
    padding: 24px 28px 18px;
    border-bottom: 1px solid #e4e8f4;
    flex-shrink: 0;
  }

  .fsm-header-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .fsm-fighter-photo {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border-radius: 14px;
    border: 2px solid #e4e8f4;
    flex-shrink: 0;
  }

  .fsm-fighter-name {
    font-family: 'Unbounded', sans-serif;
    font-size: 24px;
    font-weight: 900;
    color: #14172b;
    line-height: 1.1;
    margin: 0 0 10px 0;
    text-transform: uppercase;
  }

  .fsm-fighter-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .fsm-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    background: #eff6ff;
    border: 1px solid #c7d9fd;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #1d6fe5;
  }

  .fsm-close {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: #f4f6fb;
    border: 1.5px solid #e4e8f4;
    color: #8890aa;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
    line-height: 1;
  }

  .fsm-close:hover {
    background: #fff1f2;
    border-color: #ffc9cc;
    color: #e63946;
  }

  /* ── BODY ── */
  .fsm-body {
    padding: 22px 28px 28px;
    overflow-y: auto;
    flex: 1;
  }

  .fsm-body::-webkit-scrollbar { width: 5px; }
  .fsm-body::-webkit-scrollbar-track { background: transparent; }
  .fsm-body::-webkit-scrollbar-thumb {
    background: #c7d9fd;
    border-radius: 3px;
  }

  /* ── MAIN STATS GRID ── */
  .fsm-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 14px;
  }

  @media (max-width: 560px) {
    .fsm-stats-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .fsm-stat-card {
    background: #f4f6fb;
    border: 1.5px solid #e4e8f4;
    border-radius: 14px;
    padding: 16px 14px;
    text-align: center;
    transition: box-shadow 0.15s;
  }

  .fsm-stat-card:hover {
    box-shadow: 0 4px 16px rgba(29,111,229,0.09);
  }

  .fsm-stat-card.total  { border-top: 3px solid #1d6fe5; }
  .fsm-stat-card.wins   { border-top: 3px solid #2cb67d; }
  .fsm-stat-card.losses { border-top: 3px solid #e63946; }
  .fsm-stat-card.draws  { border-top: 3px solid #f4802a; }

  .fsm-stat-value {
    font-family: 'Unbounded', sans-serif;
    font-size: 36px;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 5px;
  }

  .fsm-stat-card.total  .fsm-stat-value { color: #1d6fe5; }
  .fsm-stat-card.wins   .fsm-stat-value { color: #2cb67d; }
  .fsm-stat-card.losses .fsm-stat-value { color: #e63946; }
  .fsm-stat-card.draws  .fsm-stat-value { color: #f4802a; }

  .fsm-stat-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #8890aa;
  }

  /* ── WIN RATE BAR ── */
  .fsm-winrate-wrap {
    background: #f4f6fb;
    border: 1.5px solid #e4e8f4;
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 14px;
  }

  .fsm-winrate-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .fsm-winrate-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #8890aa;
  }

  .fsm-winrate-pct {
    font-family: 'Unbounded', sans-serif;
    font-size: 16px;
    font-weight: 900;
    color: #1d6fe5;
  }

  .fsm-winrate-track {
    height: 6px;
    background: #e4e8f4;
    border-radius: 3px;
    overflow: hidden;
  }

  .fsm-winrate-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, #1d6fe5, #5b9cff);
    transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── SECONDARY STATS ── */
  .fsm-secondary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 24px;
  }

  @media (max-width: 560px) {
    .fsm-secondary-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .fsm-info-cell {
    background: #f4f6fb;
    border: 1.5px solid #e4e8f4;
    border-radius: 12px;
    padding: 12px 14px;
  }

  .fsm-info-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #8890aa;
    margin-bottom: 4px;
  }

  .fsm-info-value {
    font-family: 'Unbounded', sans-serif;
    font-size: 18px;
    font-weight: 900;
    color: #14172b;
  }

  .fsm-info-value.positive { color: #2cb67d; }
  .fsm-info-value.negative { color: #e63946; }

  /* ── SECTION TITLE ── */
  .fsm-section-title {
    font-family: 'Unbounded', sans-serif;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #8890aa;
    margin: 0 0 12px 0;
  }

  /* ── FIGHT HISTORY ── */
  .fsm-history-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .fsm-fight-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    background: #ffffff;
    border: 1.5px solid #e4e8f4;
    border-radius: 14px;
    transition: box-shadow 0.15s, transform 0.15s;
    overflow: hidden;
    position: relative;
  }

  .fsm-fight-row::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    border-radius: 14px 0 0 14px;
  }

  .fsm-fight-row.win::before   { background: #2cb67d; }
  .fsm-fight-row.loss::before  { background: #e63946; }
  .fsm-fight-row.draw::before  { background: #f4802a; }

  .fsm-fight-row:hover {
    box-shadow: 0 4px 16px rgba(29,111,229,0.1);
    transform: translateX(2px);
  }

  .fsm-result-badge {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.03em;
    flex-shrink: 0;
    font-family: 'Unbounded', sans-serif;
  }

  .fsm-fight-row.win  .fsm-result-badge { background: #f0faf5; color: #2cb67d; border: 1px solid #b2e8d0; }
  .fsm-fight-row.loss .fsm-result-badge { background: #fff1f2; color: #e63946; border: 1px solid #ffc9cc; }
  .fsm-fight-row.draw .fsm-result-badge { background: #fff8f0; color: #f4802a; border: 1px solid #fdd5ae; }

  .fsm-fight-info {
    flex: 1;
    min-width: 0;
  }

  .fsm-fight-opponent {
    font-size: 14px;
    font-weight: 700;
    color: #14172b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fsm-fight-meta {
    display: flex;
    gap: 10px;
    margin-top: 2px;
    font-size: 11px;
    color: #8890aa;
    font-weight: 500;
  }

  .fsm-fight-score {
    font-family: 'Unbounded', sans-serif;
    font-size: 18px;
    font-weight: 900;
    color: #14172b;
    white-space: nowrap;
    letter-spacing: 1px;
  }

  /* ── EMPTY / LOADING ── */
  .fsm-empty {
    text-align: center;
    padding: 48px 20px;
    color: #8890aa;
    font-size: 13px;
    font-weight: 600;
  }

  .fsm-empty-icon {
    font-size: 30px;
    margin-bottom: 10px;
    opacity: 0.35;
  }

  .fsm-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 56px;
    gap: 14px;
    color: #8890aa;
    font-size: 13px;
    font-weight: 600;
  }

  .fsm-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #e4e8f4;
    border-top-color: #1d6fe5;
    border-radius: 50%;
    animation: fsm-spin 0.7s linear infinite;
  }

  @keyframes fsm-spin { to { transform: rotate(360deg); } }
`;

const FighterStatsModal: FC<Props> = ({ fighterId, onClose }) => {
    const [stats, setStats] = useState<IFighterStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setStats(null);
        loadStats();
    }, [fighterId]);

    const loadStats = async () => {
        try {
            const response = await PublicService.getFighterStats(fighterId);
            setStats(response.data);
        } catch (error) {
            console.error("Ошибка загрузки статистики:", error);
        } finally {
            setLoading(false);
        }
    };

    const diff = stats ? stats.totalScore - stats.opponentScore : 0;

    return (
        <>
            <style>{styles}</style>
            <div className="fsm-overlay" onClick={onClose}>
                <div className="fsm-modal" onClick={(e) => e.stopPropagation()}>

                    {loading ? (
                        <div className="fsm-loading">
                            <div className="fsm-spinner" />
                            Загрузка статистики...
                        </div>
                    ) : stats ? (
                        <>
                            {/* Header */}
                            <div className="fsm-header">
                                <div className="fsm-header-top">
                                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                        {stats.fighter.photo && (
                                            <img
                                                className="fsm-fighter-photo"
                                                src={stats.fighter.photo}
                                                alt={stats.fighter.name}
                                            />
                                        )}
                                        <div>
                                            <h2 className="fsm-fighter-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Trophy size={22} /> {stats.fighter.name}</h2>
                                            <div className="fsm-fighter-meta">
                                                {stats.fighter.team && (
                                                    <span className="fsm-badge"><MapPin size={11} /> {stats.fighter.team}</span>
                                                )}
                                                {stats.fighter.weight && (
                                                    <span className="fsm-badge"><Scale size={11} /> {stats.fighter.weight}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="fsm-close" onClick={onClose}>×</button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="fsm-body">

                                {/* Main stats */}
                                <div className="fsm-stats-grid">
                                    <div className="fsm-stat-card total">
                                        <div className="fsm-stat-value">{stats.totalFights}</div>
                                        <div className="fsm-stat-label">Боёв</div>
                                    </div>
                                    <div className="fsm-stat-card wins">
                                        <div className="fsm-stat-value">{stats.wins}</div>
                                        <div className="fsm-stat-label">Побед</div>
                                    </div>
                                    <div className="fsm-stat-card losses">
                                        <div className="fsm-stat-value">{stats.losses}</div>
                                        <div className="fsm-stat-label">Поражений</div>
                                    </div>
                                    <div className="fsm-stat-card draws">
                                        <div className="fsm-stat-value">{stats.draws}</div>
                                        <div className="fsm-stat-label">Ничьих</div>
                                    </div>
                                </div>

                                {/* Win rate */}
                                <div className="fsm-winrate-wrap">
                                    <div className="fsm-winrate-header">
                                        <span className="fsm-winrate-label">Процент побед</span>
                                        <span className="fsm-winrate-pct">{stats.winRate}%</span>
                                    </div>
                                    <div className="fsm-winrate-track">
                                        <div className="fsm-winrate-fill" style={{ width: `${stats.winRate}%` }} />
                                    </div>
                                </div>

                                {/* Secondary */}
                                <div className="fsm-secondary-grid">
                                    <div className="fsm-info-cell">
                                        <div className="fsm-info-label">Ср. счёт</div>
                                        <div className="fsm-info-value">{stats.averageScore}</div>
                                    </div>
                                    <div className="fsm-info-cell">
                                        <div className="fsm-info-label">Всего очков</div>
                                        <div className="fsm-info-value">{stats.totalScore}</div>
                                    </div>
                                    <div className="fsm-info-cell">
                                        <div className="fsm-info-label">Пропущено</div>
                                        <div className="fsm-info-value">{stats.opponentScore}</div>
                                    </div>
                                    <div className="fsm-info-cell">
                                        <div className="fsm-info-label">Разность</div>
                                        <div className={`fsm-info-value ${diff > 0 ? 'positive' : diff < 0 ? 'negative' : ''}`}>
                                            {diff > 0 ? '+' : ''}{diff}
                                        </div>
                                    </div>
                                </div>

                                {/* History */}
                                <p className="fsm-section-title">История боёв</p>

                                {stats.fightHistory.length === 0 ? (
                                    <div className="fsm-empty">
                                        <div className="fsm-empty-icon"><Clock size={30} /></div>
                                        Нет завершённых боёв
                                    </div>
                                ) : (
                                    <div className="fsm-history-list">
                                        {stats.fightHistory.map((fight, index) => (
                                            <div key={index} className={`fsm-fight-row ${fight.result}`}>
                                                <div className="fsm-result-badge">
                                                    {fight.result === 'win' ? 'W' : fight.result === 'loss' ? 'L' : 'D'}
                                                </div>
                                                <div className="fsm-fight-info">
                                                    <div className="fsm-fight-opponent">
                                                        {fight.opponent.name}
                                                        {fight.opponent.team && ` · ${fight.opponent.team}`}
                                                    </div>
                                                    <div className="fsm-fight-meta">
                                                        <span>Татами №{fight.tatami?.number}</span>
                                                        <span>{new Date(fight.createdAt).toLocaleDateString('ru-RU')}</span>
                                                    </div>
                                                </div>
                                                <div className="fsm-fight-score">
                                                    {fight.myScore} : {fight.opponentScore}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="fsm-empty" style={{ padding: '56px' }}>
                            <div className="fsm-empty-icon"><Search size={30} /></div>
                            Статистика не найдена
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FighterStatsModal;