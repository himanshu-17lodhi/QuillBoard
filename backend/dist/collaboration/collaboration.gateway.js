"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma.service");
let CollaborationGateway = class CollaborationGateway {
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token;
            const payload = this.jwtService.verify(token);
            client.data.userId = payload.sub;
            console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
        }
        catch (error) {
            console.error('Authentication error:', error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
    }
    async handleJoinDocument(client, documentId) {
        client.join(documentId);
        console.log(`User ${client.data.userId} joined document ${documentId}`);
        await this.prisma.documentCollaborator.upsert({
            where: {
                documentId_userId: {
                    documentId,
                    userId: client.data.userId,
                },
            },
            create: {
                documentId,
                userId: client.data.userId,
            },
            update: {
                joinedAt: new Date(),
            },
        });
        client.to(documentId).emit('user-joined', {
            userId: client.data.userId,
            clientId: client.id,
        });
        const collaborators = await this.prisma.documentCollaborator.findMany({
            where: { documentId },
            include: { user: true },
        });
        client.emit('current-collaborators', collaborators.map(c => ({
            userId: c.userId,
            clientId: null,
            user: c.user,
        })));
    }
    async handleLeaveDocument(client, documentId) {
        client.leave(documentId);
        console.log(`User ${client.data.userId} left document ${documentId}`);
        await this.prisma.documentCollaborator.deleteMany({
            where: {
                documentId,
                userId: client.data.userId,
            },
        });
        client.to(documentId).emit('user-left', {
            userId: client.data.userId,
            clientId: client.id,
        });
    }
    async handleContentUpdate(client, data) {
        client.to(data.documentId).emit('content-updated', {
            content: data.content,
            userId: client.data.userId,
        });
        await this.updateDocumentContent(data.documentId, data.content);
    }
    async updateDocumentContent(documentId, content) {
        try {
            await this.prisma.document.update({
                where: { id: documentId },
                data: { content, updatedAt: new Date() },
            });
        }
        catch (error) {
            console.error('Error updating document content:', error);
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CollaborationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-document'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], CollaborationGateway.prototype, "handleJoinDocument", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-document'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], CollaborationGateway.prototype, "handleLeaveDocument", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('update-content'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CollaborationGateway.prototype, "handleContentUpdate", null);
CollaborationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], CollaborationGateway);
exports.CollaborationGateway = CollaborationGateway;
//# sourceMappingURL=collaboration.gateway.js.map