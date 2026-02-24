export interface IUser {
    email: string;
    id: string;
    role: 'superadmin' | 'admin';
    assignedTatami?: string;
}