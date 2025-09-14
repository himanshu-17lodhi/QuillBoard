// backend/src/workspaces/workspaces.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async getUserWorkspaces(userId: string) {
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

  async getWorkspace(userId: string, workspaceId: string) {
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

    // Check if user has access to the workspace
    const hasAccess = workspace.members.some(member => member.userId === userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return workspace;
  }

  async createWorkspace(userId: string, name: string) {
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

  async updateWorkspace(userId: string, workspaceId: string, name: string) {
    // Check if user is the owner
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!workspace || workspace.members.length === 0) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update the workspace');
    }

    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { name },
    });
  }

  async deleteWorkspace(userId: string, workspaceId: string) {
    // Check if user is the owner
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete the workspace');
    }

    return this.prisma.workspace.delete({
      where: { id: workspaceId },
    });
  }

  async inviteToWorkspace(ownerId: string, workspaceId: string, email: string, role: string) {
    // Check if user is the owner
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace || workspace.ownerId !== ownerId) {
      throw new ForbiddenException('Only the owner can invite members');
    }

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already a member
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

  async removeFromWorkspace(ownerId: string, workspaceId: string, memberId: string) {
    // Check if user is the owner
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace || workspace.ownerId !== ownerId) {
      throw new ForbiddenException('Only the owner can remove members');
    }

    // Cannot remove yourself
    if (ownerId === memberId) {
      throw new ForbiddenException('Cannot remove yourself from the workspace');
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
}