// backend/src/workspaces/workspaces.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
@UseGuards(AuthGuard('jwt'))
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get()
  getWorkspaces(@Request() req) {
    return this.workspacesService.getUserWorkspaces(req.user.id);
  }

  @Get(':id')
  getWorkspace(@Request() req, @Param('id') id: string) {
    return this.workspacesService.getWorkspace(req.user.id, id);
  }

  @Post()
  createWorkspace(@Request() req, @Body() body: { name: string }) {
    return this.workspacesService.createWorkspace(req.user.id, body.name);
  }

  @Put(':id')
  updateWorkspace(@Request() req, @Param('id') id: string, @Body() body: { name: string }) {
    return this.workspacesService.updateWorkspace(req.user.id, id, body.name);
  }

  @Delete(':id')
  deleteWorkspace(@Request() req, @Param('id') id: string) {
    return this.workspacesService.deleteWorkspace(req.user.id, id);
  }

  @Post(':id/invite')
  inviteToWorkspace(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { email: string; role: string },
  ) {
    return this.workspacesService.inviteToWorkspace(req.user.id, id, body.email, body.role);
  }

  @Delete(':id/members/:memberId')
  removeFromWorkspace(@Request() req, @Param('id') id: string, @Param('memberId') memberId: string) {
    return this.workspacesService.removeFromWorkspace(req.user.id, id, memberId);
  }
}