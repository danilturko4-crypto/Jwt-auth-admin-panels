import React, { useMemo, type FC } from "react";
import type { IFight } from "../models/IFight";
import type { IFighter } from "../models/IFighter";
import FightCard from "./FightCard";
import { Swords, Shield } from 'lucide-react';

interface Props {
    fights: IFight[];
    canEdit: boolean;
    fighters?: IFighter[];
    groupByTatami?: boolean;
    onStatusChange: (fightId: string, status: string) => void;
    onResultChange: (fightId: string, winner: string, score: { fighter1: number; fighter2: number }) => void;
    onEditFight?: (fightId: string, fighter1Id: string, fighter2Id: string) => void;
}

const FightList: FC<Props> = ({
    fights,
    canEdit,
    fighters = [],
    groupByTatami = false,
    onStatusChange,
    onResultChange,
    onEditFight
}) => {
    // Группировка по татами — только если нужна, мемоизирована
    const groups = useMemo(() => {
        if (!groupByTatami) return null
        return fights.reduce<Record<string, { label: string; fights: IFight[] }>>((acc, fight) => {
            const key = fight.tatami ? String(fight.tatami._id) : 'unknown'
            if (!acc[key]) {
                acc[key] = {
                    label: fight.tatami ? `Татами №${fight.tatami.number} — ${fight.tatami.name}` : 'Татами удалено',
                    fights: []
                }
            }
            acc[key].fights.push(fight)
            return acc
        }, {})
    }, [fights, groupByTatami])

    const sharedProps = { canEdit, fighters, onStatusChange, onResultChange, onEditFight }

    if (fights.length === 0) {
        return (
            <div style={s.empty}>
                <div style={{ marginBottom: 8, opacity: 0.35 }}><Swords size={28} /></div>
                <div style={s.emptyText}>Бои ещё не созданы</div>
            </div>
        )
    }

    return (
        <div>
            <h3 style={{ ...s.title, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Swords size={15} /> {groupByTatami ? 'Все бои' : 'Список боёв'} ({fights.length})
            </h3>

            {groups ? (
                Object.entries(groups).map(([tatamiId, group]) => (
                    <div key={tatamiId} style={s.group}>
                        <div style={{ ...s.groupHeader, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Shield size={13} />{group.label}
                            <span style={s.groupCount}>
                                {group.fights.length} {group.fights.length === 1 ? 'бой' : 'боёв'}
                            </span>
                        </div>
                        {group.fights.map(fight => (
                            <FightCard key={fight._id} fight={fight} {...sharedProps} />
                        ))}
                    </div>
                ))
            ) : (
                fights.map(fight => (
                    <FightCard key={fight._id} fight={fight} {...sharedProps} />
                ))
            )}
        </div>
    )
}

const s: Record<string, React.CSSProperties> = {
    title: {
        margin: '0 0 14px 0',
        fontSize: 15,
        fontWeight: 700,
        color: '#14172b',
        fontFamily: "'Manrope', sans-serif",
    },
    empty: {
        padding: '32px 20px',
        textAlign: 'center',
        border: '1.5px dashed #e4e8f4',
        borderRadius: 12,
        backgroundColor: '#f4f6fb',
    },
    emptyText: {
        fontSize: 13,
        fontWeight: 600,
        color: '#8890aa',
        fontFamily: "'Manrope', sans-serif",
    },
    group: {
        marginBottom: 24,
    },
    groupHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        backgroundColor: '#1d6fe5',
        color: '#fff',
        borderRadius: 10,
        fontWeight: 700,
        fontSize: 14,
        marginBottom: 10,
        fontFamily: "'Manrope', sans-serif",
    },
    groupCount: {
        fontSize: 12,
        fontWeight: 600,
        background: 'rgba(255,255,255,0.2)',
        padding: '2px 10px',
        borderRadius: 20,
    },
}

export default FightList