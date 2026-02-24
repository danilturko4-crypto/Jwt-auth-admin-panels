import type { AxiosResponse } from "axios";
import $api from "../http";
import type { AuthResponce } from "../models/response/AuthResponce";

export default class AuthService {
    
    static async login(email: string, password: string): Promise<AxiosResponse<AuthResponce>> {
        return $api.post('/login', { email, password })
    }

    static async logout(): Promise<void> {
        return $api.post('/logout')
    }
    
    static async createAdmin(email: string, password: string): Promise<AxiosResponse<any>> {
        return $api.post('/create-admin', { email, password })
    }
}