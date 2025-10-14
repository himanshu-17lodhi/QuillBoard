import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, body: {
        name?: string;
        avatarUrl?: string;
    }): Promise<any>;
}
