import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        avatarUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(req: any, body: {
        name?: string;
        avatarUrl?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        avatarUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
