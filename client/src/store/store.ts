import { makeAutoObservable } from "mobx";
import type { ITatami } from "../models/ITatami";
import type { IFight } from "../models/IFight";
import type { IFighter } from "../models/IFighter";
import AuthService from "../services/AuthService";
import TatamiService from "../services/TatamiService";
import FightService from "../services/FightService";
import FighterService from "../services/FighterService";
import axios from "axios";
import { API_URL } from "../http";
import type { IUser } from "../models/IUsers";
import type { AuthResponce } from "../models/response/AuthResponce";

export default class Store {
    user = {} as IUser
    isAuth = false;
    isLoading = false;
    
    tatamis: ITatami[] = [];
    myTatami: ITatami | null = null;
    fights: IFight[] = [];
    fighters: IFighter[] = [];  // ← Добавили

    constructor() {
        makeAutoObservable(this)
    }

    setAuth(bool: boolean) {
        this.isAuth = bool;
    }

    setUser(user: IUser) {
        this.user = user;
    }

    setLoading(bool: boolean) {
        this.isLoading = bool
    }

    setTatamis(tatamis: ITatami[]) {
        this.tatamis = tatamis;
    }

    setMyTatami(tatami: ITatami | null) {
        this.myTatami = tatami;
    }

    setFights(fights: IFight[]) {
        this.fights = fights;
    }

    setFighters(fighters: IFighter[]) {
        this.fighters = fighters;
    }

    get isSuperAdmin() {
        return this.user.role === 'superadmin'
    }

    get isAdmin() {
        return this.user.role === 'admin'
    }

    // ============ AUTH ============
    async login(email: string, password: string) {
        try {
            const response = await AuthService.login(email, password)
            localStorage.setItem('token', response.data.accessToken)
            this.setAuth(true)
            this.setUser(response.data.user);
        } catch (e: any) {
            console.log(e?.response?.data?.message);
            throw e;
        }
    }

    async createAdmin(email: string, password: string) {
        try {
            const response = await AuthService.createAdmin(email, password)
            return response.data
        } catch (e: any) {
            console.log(e?.response?.data?.message);
            throw e;
        }
    }

    async logout() {
        try {
            await AuthService.logout()
            localStorage.removeItem('token')
            this.setAuth(false)
            this.setUser({} as IUser);
            this.setTatamis([]);
            this.setMyTatami(null);
            this.setFights([]);
            this.setFighters([]);
        } catch (e: any) {
            console.log(e?.response?.data?.message);
        }
    }

    async checkAuth() {
        this.setLoading(true)
        try {
            const response = await axios.get<AuthResponce>(`${API_URL}/refresh`, { 
                withCredentials: true 
            })
            localStorage.setItem('token', response.data.accessToken)
            this.setAuth(true)
            this.setUser(response.data.user);
        } catch (error) {
            console.log('Не авторизован');
        } finally {
            this.setLoading(false)
        }
    }

    // ============ TATAMI ============
    async createTatami(number: number, name: string, adminId: string) {
        try {
            const response = await TatamiService.createTatami(number, name, adminId)
            await this.loadTatamis();
            return response.data
        } catch (e: any) {
            console.log(e?.response?.data?.message);
            throw e;
        }
    }

    async loadTatamis() {
        try {
            const response = await TatamiService.getAllTatami()
            this.setTatamis(response.data)
        } catch (e: any) {
            console.log(e?.response?.data?.message);
        }
    }

    async loadMyTatami() {
        try {
            const response = await TatamiService.getMyTatami()
            this.setMyTatami(response.data)
        } catch (e: any) {
            console.log(e?.response?.data?.message);
        }
    }

    async deleteTatami(tatamiId: string) {
        try {
            await TatamiService.deleteTatami(tatamiId)
            await this.loadTatamis()
        } catch (e: any) {
            console.log(e?.response?.data?.message);
            throw e;
        }
    }

    async updateTatamiStatus(tatamiId: string, isActive: boolean) {
        try {
            await TatamiService.updateTatamiStatus(tatamiId, isActive)
            await this.loadTatamis();
        } catch (e: any) {
            console.log(e?.response?.data?.message);
            throw e;
        }
    }

    // ============ FIGHTERS ============
    async createFighter(name: string, team: string, weight: string) {
        try {
            const response = await FighterService.createFighter(name, team, weight)
            await this.loadFighters();
            return response.data
        } catch (e: any) {
            console.log(e?.response?.data?.message);
            throw e;
        }
    }

    async loadFighters() {
        try {
            const response = await FighterService.getAllFighters()
            this.setFighters(response.data)
        } catch (e: any) {
            console.log(e?.response?.data?.message);
        }
    }

    async loadMyFighters() {
        try {
            const response = await FighterService.getMyFighters()
            this.setFighters(response.data)
        } catch (e: any) {
            console.log(e?.response?.data?.message);
        }
    }

    // ============ FIGHTS ============
    async createFight(tatamiId: string, fighter1Id: string, fighter2Id: string) {
        try {
            const response = await FightService.createFight(tatamiId, fighter1Id, fighter2Id)
            await this.loadFightsByTatami(tatamiId);
            return response.data
        } catch (e: any) {
            console.log(e?.response?.data?.message);
            throw e;
        }
    }

    async loadFightsByTatami(tatamiId: string) {
        try {
            const response = await FightService.getFightsByTatami(tatamiId)
            this.setFights(response.data)
        } catch (e: any) {
            console.log(e?.response?.data?.message);
        }
    }

    async loadAllFights() {
        try {
            const response = await FightService.getAllFights()
            this.setFights(response.data)
        } catch (e: any) {
            console.log(e?.response?.data?.message);
        }
    }

    async editFight(fightId: string, fighter1Id: string, fighter2Id: string) {
        try {
            await FightService.editFight(fightId, fighter1Id, fighter2Id)
            if (this.myTatami) {
                await this.loadFightsByTatami(this.myTatami._id);
            } else {
                await this.loadAllFights();
            }
        } catch (e: any) {
            console.log(e?.response?.data?.message);
            throw e;
        }
    }

    async updateFightStatus(fightId: string, status: string) {
        try {
            await FightService.updateFightStatus(fightId, status)
            if (this.myTatami) {
                await this.loadFightsByTatami(this.myTatami._id);
            } else {
                await this.loadAllFights();
            }
        } catch (e: any) {
            console.log(e?.response?.data?.message);
            throw e;
        }
    }

    async updateFightResult(fightId: string, winner: string, score: any) {
        try {
            await FightService.updateFightResult(fightId, winner, score)
            if (this.myTatami) {
                await this.loadFightsByTatami(this.myTatami._id);
            } else {
                await this.loadAllFights();
            }
        } catch (e: any) {
            console.log(e?.response?.data?.message);
            throw e;
        }
    }
}