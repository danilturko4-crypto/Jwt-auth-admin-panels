import React, { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { IFight } from "../models/IFight";
import type { IFighter } from "../models/IFighter";
import FightCard from "./FightCard";

interface Props {
    fights: IFight[];
    canEdit: boolean;
    fighters?: IFighter[];
    groupByTatami?: boolean;
    onStatusChange: (fightId: string, status: string) => void;
    onResultChange: (fightId: string, winner: string, score: any) => void;
    onEditFight?: (fightId: string, fighter1Id: string, fighter2Id: string) => void;
}

const FightList: FC<Props> = ({ fights, canEdit, fighters = [], groupByTatami = false, onStatusChange, onResultChange, onEditFight }) => {

    if (fights.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Бои еще не созданы
            </div>
        )
    }

    if (groupByTatami) {
        const groups = fights.reduce<Record<string, { label: string; fights: IFight[] }>>((acc, fight) => {
            const key = fight.tatami._id
            if (!acc[key]) {
                acc[key] = { label: `Татами №${fight.tatami.number} — ${fight.tatami.name}`, fights: [] }
            }
            acc[key].fights.push(fight)
            return acc
        }, {})

        return (
            <div style={{ marginTop: '20px' }}>
                <h3>⚔️ Все бои ({fights.length})</h3>
                {Object.entries(groups).map(([tatamiId, group]) => (
                    <div key={tatamiId} style={{ marginBottom: '24px' }}>
                        <div style={{
                            padding: '10px 16px',
                            backgroundColor: '#1565c0',
                            color: 'white',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            marginBottom: '10px'
                        }}>
                            🥋 {group.label} — {group.fights.length} {group.fights.length === 1 ? 'бой' : 'боёв'}
                        </div>
                        {group.fights.map(fight => (
                            <FightCard
                                key={fight._id}
                                fight={fight}
                                canEdit={canEdit}
                                fighters={fighters}
                                onStatusChange={onStatusChange}
                                onResultChange={onResultChange}
                                onEditFight={onEditFight}
                            />
                        ))}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>⚔️ Список боев ({fights.length})</h3>
            {fights.map(fight => (
                <FightCard
                    key={fight._id}
                    fight={fight}
                    canEdit={canEdit}
                    fighters={fighters}
                    onStatusChange={onStatusChange}
                    onResultChange={onResultChange}
                    onEditFight={onEditFight}
                />
            ))}
        </div>
    )
}

export default observer(FightList)
