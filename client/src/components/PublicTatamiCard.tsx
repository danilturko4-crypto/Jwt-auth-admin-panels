import React, { useState, useEffect, type FC } from "react";
import type { IFight } from "../models/IFight";

interface Props {
    fight: IFight;
    onFighterClick: (fighterId: string) => void;
    fightIndex: number;
    totalFights: number;
    onCardClick?: () => void;
}

const PublicTatamiCard: FC<Props> = ({ fight, onFighterClick, fightIndex, totalFights, onCardClick }) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const TOTAL_ROUND_TIME = 180; // 3 minutes

    useEffect(() => {
        if (fight.status !== 'in_progress') return;

        const timer = setInterval(() => {
            if (fight.startTime) {
                const start = new Date(fight.startTime).getTime();
                const now = new Date().getTime();
                const elapsed = Math.floor((now - start) / 1000);
                setElapsedTime(Math.min(elapsed, TOTAL_ROUND_TIME));
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [fight.status, fight.startTime]);

    if (!fight.fighter1 || !fight.fighter2) {
        return (
            <div className="fight-card">
                <div className="fight-inner">
                    <div className="fight-stripe"></div>
                    <div className="fight-content">
                        ⚠️ Этот бой использует старую структуру данных
                    </div>
                </div>
            </div>
        );
    }

    const getStripeClass = () => {
        switch (fight.status) {
            case 'in_progress': return '';
            case 'scheduled': return 'upcoming';
            case 'completed': return 'finished';
            default: return '';
        }
    };

    const getStatusBadgeClass = () => {
        switch (fight.status) {
            case 'in_progress': return 'badge-live';
            case 'scheduled': return 'badge-next';
            case 'completed': return 'badge-done';
            default: return '';
        }
    };

    const getStatusText = () => {
        switch (fight.status) {
            case 'in_progress': return 'LIVE';
            case 'scheduled': return 'Следующий';
            case 'completed': return 'Завершён';
            default: return '';
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const progressPercent = (elapsedTime / TOTAL_ROUND_TIME) * 100;

    const getRoundLabel = () => `Бой ${fightIndex} / ${totalFights}`;

    const getWeightLabel = () => {
        if (fight.fighter1.weight && fight.fighter1.team) {
            return `${fight.fighter1.weight} · ${fight.fighter1.team}`;
        }
        return fight.fighter1.weight || fight.fighter1.team || '';
    };
    
    return (
        <div className="fight-card" onClick={onCardClick} style={onCardClick ? { cursor: 'pointer' } : undefined}>
            <div className="fight-inner">
                <div className={`fight-stripe ${getStripeClass()}`}></div>
                <div className="fight-content">
                    {/* Top row with badge and info */}
                    <div className="fight-top">
                        <span className={`badge ${getStatusBadgeClass()}`}>
                            {getStatusText()}
                        </span>
                        <span className="fight-round-label">{getRoundLabel()}</span>
                        {getWeightLabel() && <span className="fight-weight">{getWeightLabel()}</span>}
                    </div>

                    {/* Matchup grid */}
                    <div className="matchup">
                        {/* Fighter 1 */}
                        <div className="fighter">
                            <div className="fighter-flag-name" onClick={(e) => { e.stopPropagation(); onFighterClick(fight.fighter1._id); }}>
                                <span className="fighter-flag">🔴</span>
                                <span>{fight.fighter1.name}</span>
                            </div>
                            <div className="fighter-country">
                                {fight.fighter1.team}
                            </div>
                            <div className="fighter-score-wrap">
                                <span className={`score ${
                                    fight.winner === 'fighter1' ? 'win' :
                                    fight.winner === 'fighter2' ? 'lose' : 'neutral'
                                }`}>
                                    {fight.score.fighter1}
                                </span>
                                {fight.winner === 'fighter1' && <span className="win-tag">Победа</span>}
                            </div>
                        </div>

                        {/* VS Center */}
                        <div className="vs-center">
                            <div className="vs-line"></div>
                            <div className="vs-text">VS</div>
                            <div className="vs-line"></div>
                        </div>

                        {/* Fighter 2 */}
                        <div className="fighter right">
                            <div className="fighter-flag-name" onClick={(e) => { e.stopPropagation(); onFighterClick(fight.fighter2._id); }}>
                                <span>{fight.fighter2.name}</span>
                                <span className="fighter-flag">🔵</span>
                            </div>
                            <div className="fighter-country">
                                {fight.fighter2.team}
                            </div>
                            <div className="fighter-score-wrap">
                                <span className="win-tag" style={{ marginLeft: 'auto', marginRight: '8px' }}>
                                    {fight.winner === 'fighter2' && 'Победа'}
                                </span>
                                <span className={`score ${
                                    fight.winner === 'fighter2' ? 'win' :
                                    fight.winner === 'fighter1' ? 'lose' : 'neutral'
                                }`}>
                                    {fight.score.fighter2}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timer and progress for in_progress fights */}
                    {fight.status === 'in_progress' && fight.startTime && (
                        <div className="fight-footer">
                            <div className="timer-block">
                                <span className="timer-icon">⏱</span>
                                <span className="timer-text">{formatTime(elapsedTime)}</span>
                                <span className="timer-sub">Время раунда</span>
                            </div>
                            <div className="progress-wrap">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                                <div className="progress-label">Прогресс раунда</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicTatamiCard;

    