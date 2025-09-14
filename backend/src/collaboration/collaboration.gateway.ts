// backend/src/collaboration/collaboration.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { JwtService } from '@nestjs/jwt';
  import { PrismaService } from '../prisma.service';
  
  @WebSocketGateway({
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  })
  export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(
      private jwtService: JwtService,
      private prisma: PrismaService
    ) {}
  
    async handleConnection(client: Socket) {
      try {
        // Authenticate user from JWT token
        const token = client.handshake.auth.token;
        const payload = this.jwtService.verify(token);
        client.data.userId = payload.sub;
        
        console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
      } catch (error) {
        console.error('Authentication error:', error);
        client.disconnect();
      }
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('join-document')
    async handleJoinDocument(client: Socket, documentId: string) {
      client.join(documentId);
      console.log(`User ${client.data.userId} joined document ${documentId}`);
      
      // Add user to document collaborators
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
      
      // Notify other users about the new collaborator
      client.to(documentId).emit('user-joined', {
        userId: client.data.userId,
        clientId: client.id,
      });
      
      // Get all collaborators for this document
      const collaborators = await this.prisma.documentCollaborator.findMany({
        where: { documentId },
        include: { user: true },
      });
      
      // Send current collaborators to the new user
      client.emit('current-collaborators', collaborators.map(c => ({
        userId: c.userId,
        clientId: null, // We don't know client IDs for other users
        user: c.user,
      })));
    }
  
    @SubscribeMessage('leave-document')
    async handleLeaveDocument(client: Socket, documentId: string) {
      client.leave(documentId);
      console.log(`User ${client.data.userId} left document ${documentId}`);
      
      // Remove user from document collaborators
      await this.prisma.documentCollaborator.deleteMany({
        where: {
          documentId,
          userId: client.data.userId,
        },
      });
      
      // Notify other users
      client.to(documentId).emit('user-left', {
        userId: client.data.userId,
        clientId: client.id,
      });
    }
  
    @SubscribeMessage('update-content')
    async handleContentUpdate(client: Socket, data: { documentId: string; content: any }) {
      // Broadcast update to all other clients in the same document
      client.to(data.documentId).emit('content-updated', {
        content: data.content,
        userId: client.data.userId,
      });
      
      // Debounce database updates to avoid too many writes
      // In a real application, you'd implement proper debouncing
      await this.updateDocumentContent(data.documentId, data.content);
    }
    
    private async updateDocumentContent(documentId: string, content: any) {
      try {
        await this.prisma.document.update({
          where: { id: documentId },
          data: { content, updatedAt: new Date() },
        });
      } catch (error) {
        console.error('Error updating document content:', error);
      }
    }
  }