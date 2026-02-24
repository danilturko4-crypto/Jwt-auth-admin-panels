import type { AxiosResponse } from "axios";
import $api from "../http";
import type { ITatami } from "../models/ITatami";

export default class TatamiService {
    
    static async createTatami(
        number: number, 
        name: string, 
        adminId: string
    ): Promise<AxiosResponse<ITatami>> {
        console.log('📤 TatamiService: Отправка запроса:', { number, name, adminId })
        return $api.post('/tatami/create', { number, name, adminId })
    }

    static async getAllTatami(): Promise<AxiosResponse<ITatami[]>> {
        return $api.get<ITatami[]>('/tatami/all')
    }

    static async getMyTatami(): Promise<AxiosResponse<ITatami>> {
        return $api.get<ITatami>('/tatami/my')
    }

    static async updateTatamiStatus(
        tatamiId: string, 
        isActive: boolean
    ): Promise<AxiosResponse<ITatami>> {
        return $api.put('/tatami/status', { tatamiId, isActive })
    }
}