import { WorkspacesService } from './workspaces.service';
export declare class WorkspacesController {
    private workspacesService;
    constructor(workspacesService: WorkspacesService);
    getWorkspaces(req: any): Promise<any>;
    getWorkspace(req: any, id: string): Promise<any>;
    createWorkspace(req: any, body: {
        name: string;
    }): Promise<any>;
    updateWorkspace(req: any, id: string, body: {
        name: string;
    }): Promise<any>;
    deleteWorkspace(req: any, id: string): Promise<any>;
    inviteToWorkspace(req: any, id: string, body: {
        email: string;
        role: string;
    }): Promise<any>;
    removeFromWorkspace(req: any, id: string, memberId: string): Promise<any>;
}
