export interface User {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Workspace {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    members: WorkspaceMember[];
  }
  
  export interface WorkspaceMember {
    id: string;
    workspaceId: string;
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
    user: User;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Document {
    id: string;
    title: string;
    workspaceId: string;
    parentId: string | null;
    content: any;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    createdByUser?: User;
  }
  
  export interface Block {
    id: string;
    type: string;
    content: any;
    documentId: string;
    parentId: string | null;
    order: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CollaborationUser {
    clientId: string;
    userId: string;
    name: string;
    color: string;
  }