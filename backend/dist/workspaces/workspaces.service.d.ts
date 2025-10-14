import { PrismaService } from '../prisma.service';
export declare class WorkspacesService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserWorkspaces(userId: string): Promise<any>;
    getWorkspace(userId: string, workspaceId: string): Promise<any>;
    createWorkspace(userId: string, name: string): Promise<any>;
    updateWorkspace(userId: string, workspaceId: string, name: string): Promise<any>;
    deleteWorkspace(userId: string, workspaceId: string): Promise<any>;
    inviteToWorkspace(ownerId: string, workspaceId: string, email: string, role: string): Promise<any>;
    removeFromWorkspace(ownerId: string, workspaceId: string, memberId: string): Promise<any>;
}
