import type { IFighter } from "./IFighter";

export interface IFightTatami {
    _id: string;
    number: number;
    name: string;
}

export interface IFight {
    _id: string;
    tatami: IFightTatami;
    fighter1: IFighter;  // ← Теперь полный объект Fighter
    fighter2: IFighter;  // ← Теперь полный объект Fighter
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    startTime?: string;
    endTime?: string;
    winner?: 'fighter1' | 'fighter2' | 'draw' | null;
    score: {
        fighter1: number;
        fighter2: number;
    };
    createdAt: string;
}