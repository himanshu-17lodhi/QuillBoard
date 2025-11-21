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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDocument(userId, documentId) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: {
                workspace: {
                    include: {
                        members: {
                            where: { userId },
                        },
                    },
                },
            },
        });
        if (!document) {
            throw new Error('Document not found');
        }
        if (!document.workspace || document.workspace.members.length === 0) {
            throw new common_1.ForbiddenException('You do not have access to this document');
        }
        return document;
    }
    async getDocuments(userId, workspaceId) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                members: {
                    where: { userId },
                },
            },
        });
        if (!workspace || workspace.members.length === 0) {
            throw new common_1.ForbiddenException('You do not have access to this workspace');
        }
        return this.prisma.document.findMany({
            where: { workspaceId },
            orderBy: { updatedAt: 'desc' },
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async createDocument(userId, workspaceId, title, content) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                members: {
                    where: { userId },
                },
            },
        });
        if (!workspace || workspace.members.length === 0) {
            throw new common_1.ForbiddenException('You do not have access to this workspace');
        }
        return this.prisma.document.create({
            data: {
                title,
                content,
                workspaceId,
                createdBy: userId,
            },
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async updateDocument(userId, documentId, updates) {
        const document = await this.getDocument(userId, documentId);
        return this.prisma.document.update({
            where: { id: documentId },
            data: updates,
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async deleteDocument(userId, documentId) {
        const document = await this.getDocument(userId, documentId);
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: document.workspaceId },
            include: {
                members: {
                    where: { userId },
                },
            },
        });
        if (!workspace || workspace.members.length === 0) {
            throw new common_1.ForbiddenException('You do not have permission to delete this document');
        }
        const member = workspace.members[0];
        if (member.role !== 'owner' && member.role !== 'editor') {
            throw new common_1.ForbiddenException('You do not have permission to delete this document');
        }
        return this.prisma.document.delete({
            where: { id: documentId },
        });
    }
    async addCollaborator(userId, documentId, collaboratorId) {
        const document = await this.getDocument(userId, documentId);
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: document.workspaceId },
            include: {
                members: {
                    where: { userId },
                },
            },
        });
        if (!workspace || workspace.members.length === 0) {
            throw new common_1.ForbiddenException('You do not have permission to add collaborators');
        }
        const member = workspace.members[0];
        if (member.role !== 'owner' && member.role !== 'editor') {
            throw new common_1.ForbiddenException('You do not have permission to add collaborators');
        }
        return this.prisma.documentCollaborator.create({
            data: {
                documentId,
                userId: collaboratorId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async removeCollaborator(userId, documentId, collaboratorId) {
        const document = await this.getDocument(userId, documentId);
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: document.workspaceId },
            include: {
                members: {
                    where: { userId },
                },
            },
        });
        if (!workspace || workspace.members.length === 0) {
            throw new common_1.ForbiddenException('You do not have permission to remove collaborators');
        }
        const member = workspace.members[0];
        if (member.role !== 'owner' && member.role !== 'editor') {
            throw new common_1.ForbiddenException('You do not have permission to remove collaborators');
        }
        return this.prisma.documentCollaborator.delete({
            where: {
                documentId_userId: {
                    documentId,
                    userId: collaboratorId,
                },
            },
        });
    }
    async getCollaborators(userId, documentId) {
        const document = await this.getDocument(userId, documentId);
        return this.prisma.documentCollaborator.findMany({
            where: { documentId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        });
    }
};
DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
exports.DocumentsService = DocumentsService;
//# sourceMappingURL=documents.service.js.map