import { PrismaService } from '../prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<any>;
    update(id: string, data: {
        name?: string;
        avatarUrl?: string;
    }): Promise<any>;
}
