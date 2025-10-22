import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <-- 1. Import this
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { DocumentsModule } from './documents/documents.module';
// import { CollaborationModule } from './collaboration/collaboration.module'; // Still commented out, which is correct

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // <-- 2. Add this line
    AuthModule,
    UsersModule,
    WorkspacesModule,
    DocumentsModule,
    // CollaborationModule,
  ],
})
export class AppModule {}

