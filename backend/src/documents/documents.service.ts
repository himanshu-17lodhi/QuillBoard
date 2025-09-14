import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async getDocument(userId: string, documentId: string) {
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

    // Check if user has access to the workspace
    if (document.workspace.members.length === 0) {
      throw new ForbiddenException('You do not have access to this document');
    }

    return document;
  }

  async getDocuments(userId: string, workspaceId: string) {
    // Check if user has access to the workspace
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

  async createDocument(userId: string, workspaceId: string, title: string, content: any) {
    // Check if user has access to the workspace
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

  async updateDocument(userId: string, documentId: string, updates: any) {
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

  async deleteDocument(userId: string, documentId: string) {
    const document = await this.getDocument(userId, documentId);
    
    // Check if user is the owner or has delete permissions
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: document.workspaceId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    const member = workspace.members[0];
    if (member.role !== 'owner' && member.role !== 'editor') {
      throw new ForbiddenException('You do not have permission to delete this document');
    }

    return this.prisma.document.delete({
      where: { id: documentId },
    });
  }

  async addCollaborator(userId: string, documentId: string, collaboratorId: string) {
    const document = await this.getDocument(userId, documentId);
    
    // Check if user has permission to add collaborators
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: document.workspaceId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    const member = workspace.members[0];
    if (member.role !== 'owner' && member.role !== 'editor') {
      throw new ForbiddenException('You do not have permission to add collaborators');
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

  async removeCollaborator(userId: string, documentId: string, collaboratorId: string) {
    const document = await this.getDocument(userId, documentId);
    
    // Check if user has permission to remove collaborators
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: document.workspaceId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    const member = workspace.members[0];
    if (member.role !== 'owner' && member.role !== 'editor') {
      throw new ForbiddenException('You do not have permission to remove collaborators');
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

  async getCollaborators(userId: string, documentId: string) {
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
}