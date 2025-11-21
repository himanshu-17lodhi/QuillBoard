import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
    }>;
    register(email: string, name: string): Promise<{
        id: string;
        email: string;
        name: string;
        avatarUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
