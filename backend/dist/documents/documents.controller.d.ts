import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    getDocuments(req: any, workspaceId: string): Promise<any>;
    getDocument(req: any, documentId: string): Promise<any>;
    createDocument(req: any, workspaceId: string, body: {
        title: string;
        content: any;
    }): Promise<any>;
    updateDocument(req: any, documentId: string, updates: any): Promise<any>;
    deleteDocument(req: any, documentId: string): Promise<any>;
}
