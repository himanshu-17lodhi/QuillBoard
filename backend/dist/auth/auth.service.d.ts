import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(email: string): Promise<any>;
    login(user: any): Promise<{
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
