import { PrismaService } from '../prisma.service';
declare const JwtStrategy_base: new (...args: unknown[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        name: string;
        avatarUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
