import axios from "axios";
import type { ITatami } from "../models/ITatami";
import type { IFight } from "../models/IFight";
import type { IFighter } from "../models/IFighter";

const API_URL = 'http://localhost:5000/api'

export interface IFightHistory {
    _id: string;
    tatami: {
        _id: string;
        number: number;
        name: string;
    };
    opponent: IFighter;  // ← Теперь полный объект
    myScore: number;
    opponentScore: number;
    result: 'win' | 'loss' | 'draw';
    createdAt: string;
}

export interface IFighterStats {
    fighter: IFighter;  // ← Добавили полный объект бойца
    totalFights: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: string;
    totalScore: number;
    opponentScore: number;
    averageScore: string;
    fightHistory: IFightHistory[];
}

export default class PublicService {
    
    static async getActiveTatamis() {
        return axios.get<ITatami[]>(`${API_URL}/public/tatamis`)
    }

    static async getActiveFights() {
        return axios.get<IFight[]>(`${API_URL}/public/fights/active`)
    }

    static async getFightsByTatami(tatamiId: string) {
        return axios.get<IFight[]>(`${API_URL}/public/fights/tatami/${tatamiId}`)
    }

    static async getAllFighters() {
        return axios.get<IFighter[]>(`${API_URL}/public/fighters`)
    }

    // ← Изменили: теперь по ID бойца, без role
    static async getFighterStats(fighterId: string) {
        return axios.get<IFighterStats>(`${API_URL}/public/fighter/stats/${fighterId}`)
    }
}