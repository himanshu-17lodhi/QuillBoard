// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { DocumentsModule } from './documents/documents.module';
import { CollaborationModule } from './collaboration/collaboration.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    WorkspacesModule,
    DocumentsModule,
    CollaborationModule,
  ],
})
export class AppModule {}