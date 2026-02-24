import type { AxiosResponse } from "axios";
import $api from "../http";
import type { IFight } from "../models/IFight";

export default class FightService {
    
    static async createFight(
        tatamiId: string,
        fighter1Id: string,
        fighter2Id: string
    ): Promise<AxiosResponse<IFight>> {
        return $api.post('/fight/create', { tatamiId, fighter1Id, fighter2Id })
    }

    static async getFightsByTatami(tatamiId: string): Promise<AxiosResponse<IFight[]>> {
        return $api.get<IFight[]>(`/fight/tatami/${tatamiId}`)
    }

    static async getAllFights(): Promise<AxiosResponse<IFight[]>> {
        return $api.get<IFight[]>('/fight/all')
    }

    static async updateFightStatus(
        fightId: string,
        status: string
    ): Promise<AxiosResponse<IFight>> {
        return $api.put('/fight/status', { fightId, status })
    }

    static async updateFightResult(
        fightId: string,
        winner: string,
        score: { fighter1: number; fighter2: number }
    ): Promise<AxiosResponse<IFight>> {
        return $api.put('/fight/result', { fightId, winner, score })
    }
}