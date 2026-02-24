import React, { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { IFight } from "../models/IFight";
import FightCard from "./FightCard";

interface Props {
    fights: IFight[];
    canEdit: boolean;
    onStatusChange: (fightId: string, status: string) => void;
    onResultChange: (fightId: string, winner: string, score: any) => void;
}

const FightList: FC<Props> = ({ fights, canEdit, onStatusChange, onResultChange }) => {
    
    if (fights.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Бои еще не созданы
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
                    onStatusChange={onStatusChange}
                    onResultChange={onResultChange}
                />
            ))}
        </div>
    )
}

export default observer(FightList)