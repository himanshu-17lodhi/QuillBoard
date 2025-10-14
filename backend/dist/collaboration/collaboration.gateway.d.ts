import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
export declare class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private prisma;
    server: Server;
    constructor(jwtService: JwtService, prisma: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinDocument(client: Socket, documentId: string): Promise<void>;
    handleLeaveDocument(client: Socket, documentId: string): Promise<void>;
    handleContentUpdate(client: Socket, data: {
        documentId: string;
        content: any;
    }): Promise<void>;
    private updateDocumentContent;
}
