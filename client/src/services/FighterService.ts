import type { AxiosResponse } from "axios";
import $api from "../http";
import type { IFighter } from "../models/IFighter";

export default class FighterService {
    
    static async createFighter(
        name: string,
        team: string,
        weight: string,
        photo?: File | null
    ): Promise<AxiosResponse<IFighter>> {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('team', team)
        formData.append('weight', weight)
        if (photo) formData.append('photo', photo)
        return $api.post('/fighter/create', formData)
    }

    static async getAllFighters(): Promise<AxiosResponse<IFighter[]>> {
        return $api.get<IFighter[]>('/fighter/all')
    }

    static async getMyFighters(): Promise<AxiosResponse<IFighter[]>> {
        return $api.get<IFighter[]>('/fighter/my')
    }

    static async updateFighter(
        fighterId: string,
        name: string,
        team: string,
        weight: string
    ): Promise<AxiosResponse<IFighter>> {
        return $api.put('/fighter/update', { fighterId, name, team, weight })
    }

    static async deleteFighter(fighterId: string): Promise<AxiosResponse<any>> {
        return $api.delete('/fighter/delete', { data: { fighterId } })
    }
}