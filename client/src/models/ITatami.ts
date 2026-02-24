export interface ITatami {
    _id: string;
    number: number;
    name: string;
    admin: {
        _id: string;
        email: string;
    };
    isActive: boolean;
    createdAt: string;
}