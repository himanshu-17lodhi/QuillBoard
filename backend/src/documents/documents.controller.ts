import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DocumentsService } from './documents.service';

@Controller('workspaces/:workspaceId/documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  async getDocuments(@Request() req, @Param('workspaceId') workspaceId: string) {
    return this.documentsService.getDocuments(req.user.id, workspaceId);
  }

  @Get(':documentId')
  async getDocument(@Request() req, @Param('documentId') documentId: string) {
    return this.documentsService.getDocument(req.user.id, documentId);
  }

  @Post()
  async createDocument(
    @Request() req,
    @Param('workspaceId') workspaceId: string,
    @Body() body: { title: string; content: any },
  ) {
    return this.documentsService.createDocument(req.user.id, workspaceId, body.title, body.content);
  }

  @Put(':documentId')
  async updateDocument(
    @Request() req,
    @Param('documentId') documentId: string,
    @Body() updates: any,
  ) {
    return this.documentsService.updateDocument(req.user.id, documentId, updates);
  }

  @Delete(':documentId')
  async deleteDocument(@Request() req, @Param('documentId') documentId: string) {
    return this.documentsService.deleteDocument(req.user.id, documentId);
  }
}