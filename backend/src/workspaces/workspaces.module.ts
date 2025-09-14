// backend/src/workspaces/workspaces.module.ts
import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [WorkspacesService, PrismaService],
  controllers: [WorkspacesController],
})
export class WorkspacesModule {}