import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    getDocuments(req: any, workspaceId: string): Promise<({
        createdByUser: {
            id: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        title: string;
        parentId: string | null;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdBy: string;
    })[]>;
    getDocument(req: any, documentId: string): Promise<{
        workspace: {
            members: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                role: string;
                userId: string;
                workspaceId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        title: string;
        parentId: string | null;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdBy: string;
    }>;
    createDocument(req: any, workspaceId: string, body: {
        title: string;
        content: any;
    }): Promise<{
        createdByUser: {
            id: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        title: string;
        parentId: string | null;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdBy: string;
    }>;
    updateDocument(req: any, documentId: string, updates: any): Promise<{
        createdByUser: {
            id: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        title: string;
        parentId: string | null;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdBy: string;
    }>;
    deleteDocument(req: any, documentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        title: string;
        parentId: string | null;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdBy: string;
    }>;
}
