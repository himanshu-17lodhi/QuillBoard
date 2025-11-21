import { PrismaService } from '../prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        avatarUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: {
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
