import type { IUser } from "../IUsers";


export interface AuthResponce {
    accessToken: string;
    refreshToken: string;
    user: IUser
}