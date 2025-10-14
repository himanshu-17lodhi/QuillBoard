import { PrismaService } from '../prisma.service';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDocument(userId: string, documentId: string): Promise<any>;
    getDocuments(userId: string, workspaceId: string): Promise<any>;
    createDocument(userId: string, workspaceId: string, title: string, content: any): Promise<any>;
    updateDocument(userId: string, documentId: string, updates: any): Promise<any>;
    deleteDocument(userId: string, documentId: string): Promise<any>;
    addCollaborator(userId: string, documentId: string, collaboratorId: string): Promise<any>;
    removeCollaborator(userId: string, documentId: string, collaboratorId: string): Promise<any>;
    getCollaborators(userId: string, documentId: string): Promise<any>;
}
