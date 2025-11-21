import { PrismaService } from '../prisma.service';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDocument(userId: string, documentId: string): Promise<{
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
    getDocuments(userId: string, workspaceId: string): Promise<({
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
    createDocument(userId: string, workspaceId: string, title: string, content: any): Promise<{
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
    updateDocument(userId: string, documentId: string, updates: any): Promise<{
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
    deleteDocument(userId: string, documentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        title: string;
        parentId: string | null;
        content: import("@prisma/client/runtime/library").JsonValue;
        createdBy: string;
    }>;
    addCollaborator(userId: string, documentId: string, collaboratorId: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        userId: string;
        documentId: string;
        joinedAt: Date;
    }>;
    removeCollaborator(userId: string, documentId: string, collaboratorId: string): Promise<{
        id: string;
        userId: string;
        documentId: string;
        joinedAt: Date;
    }>;
    getCollaborators(userId: string, documentId: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        userId: string;
        documentId: string;
        joinedAt: Date;
    })[]>;
}
