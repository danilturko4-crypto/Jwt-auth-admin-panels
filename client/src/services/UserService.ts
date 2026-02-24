import type { AxiosResponse } from "axios";
import $api from "../http";
import type { IUser } from "../models/IUsers";

export default class UserService {
    
    static fetchAdmins(): Promise<AxiosResponse<IUser[]>> {
        return $api.get<IUser[]>('/admins')
    }
}