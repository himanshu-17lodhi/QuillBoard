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
exports.WorkspacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let WorkspacesService = class WorkspacesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserWorkspaces(userId) {
        return this.prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
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
                },
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
        });
    }
    async getWorkspace(userId, workspaceId) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                members: {
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
                },
            },
        });
        if (!workspace) {
            throw new Error('Workspace not found');
        }
        const hasAccess = workspace.members.some(member => member.userId === userId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this workspace');
        }
        return workspace;
    }
    async createWorkspace(userId, name) {
        return this.prisma.workspace.create({
            data: {
                name,
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: 'owner',
                    },
                },
            },
            include: {
                members: {
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
                },
            },
        });
    }
    async updateWorkspace(userId, workspaceId, name) {
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
        if (workspace.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only the owner can update the workspace');
        }
        return this.prisma.workspace.update({
            where: { id: workspaceId },
            data: { name },
        });
    }
    async deleteWorkspace(userId, workspaceId) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new Error('Workspace not found');
        }
        if (workspace.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only the owner can delete the workspace');
        }
        return this.prisma.workspace.delete({
            where: { id: workspaceId },
        });
    }
    async inviteToWorkspace(ownerId, workspaceId, email, role) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace || workspace.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('Only the owner can invite members');
        }
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const existingMember = await this.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: user.id,
                },
            },
        });
        if (existingMember) {
            throw new Error('User is already a member of this workspace');
        }
        return this.prisma.workspaceMember.create({
            data: {
                workspaceId,
                userId: user.id,
                role,
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
    async removeFromWorkspace(ownerId, workspaceId, memberId) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace || workspace.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('Only the owner can remove members');
        }
        if (ownerId === memberId) {
            throw new common_1.ForbiddenException('Cannot remove yourself from the workspace');
        }
        return this.prisma.workspaceMember.delete({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: memberId,
                },
            },
        });
    }
};
WorkspacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspacesService);
exports.WorkspacesService = WorkspacesService;
//# sourceMappingURL=workspaces.service.js.map