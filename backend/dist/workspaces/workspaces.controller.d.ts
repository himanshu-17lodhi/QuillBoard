import { WorkspacesService } from './workspaces.service';
export declare class WorkspacesController {
    private workspacesService;
    constructor(workspacesService: WorkspacesService);
    getWorkspaces(req: any): Promise<({
        _count: {
            documents: number;
        };
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
                avatarUrl: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
            userId: string;
            role: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    })[]>;
    getWorkspace(req: any, id: string): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
                avatarUrl: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
            userId: string;
            role: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    createWorkspace(req: any, body: {
        name: string;
    }): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
                avatarUrl: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
            userId: string;
            role: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    updateWorkspace(req: any, id: string, body: {
        name: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    deleteWorkspace(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
    }>;
    inviteToWorkspace(req: any, id: string, body: {
        email: string;
        role: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        userId: string;
        role: string;
    }>;
    removeFromWorkspace(req: any, id: string, memberId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        userId: string;
        role: string;
    }>;
}
