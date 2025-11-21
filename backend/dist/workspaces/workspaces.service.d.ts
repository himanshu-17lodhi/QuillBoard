import { PrismaService } from '../prisma.service';
export declare class WorkspacesService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserWorkspaces(userId: string): Promise<({
        _count: {
            documents: number;
        };
        members: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: string;
            userId: string;
            workspaceId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    })[]>;
    getWorkspace(userId: string, workspaceId: string): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: string;
            userId: string;
            workspaceId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    createWorkspace(userId: string, name: string): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: string;
            userId: string;
            workspaceId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    updateWorkspace(userId: string, workspaceId: string, name: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    deleteWorkspace(userId: string, workspaceId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    inviteToWorkspace(ownerId: string, workspaceId: string, email: string, role: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: string;
        userId: string;
        workspaceId: string;
    }>;
    removeFromWorkspace(ownerId: string, workspaceId: string, memberId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: string;
        userId: string;
        workspaceId: string;
    }>;
}
