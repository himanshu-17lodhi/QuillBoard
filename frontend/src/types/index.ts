// User types
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface UserInfoResponse {
  authenticated: boolean;
  user?: User;
}

// Workspace types
export interface Workspace {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: User;
}

export interface WorkspaceMember {
  id: number;
  workspace: string;
  user: User;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  joined_at: string;
  can_edit: boolean;
  can_admin: boolean;
}

// Page types
export interface Page {
  id: string;
  workspace: string;
  title: string;
  icon: string;
  cover_image?: string;
  parent?: string;
  order: number;
  is_published: boolean;
  is_template: boolean;
  template_data: Record<string, any>;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: User;
  full_path: string;
}

// Block types
export type BlockType = 
  | 'text'
  | 'heading'
  | 'bullet_list'
  | 'numbered_list'
  | 'todo'
  | 'toggle'
  | 'quote'
  | 'divider'
  | 'code'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'embed'
  | 'bookmark'
  | 'table'
  | 'database'
  | 'formula'
  | 'template'
  | 'callout'
  | 'column';

export interface Block {
  id: string;
  page: string;
  block_type: BlockType;
  content: Record<string, any>;
  parent_block?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: User;
}

// Database types
export interface Database {
  id: string;
  workspace: string;
  name: string;
  description: string;
  icon: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: User;
}

export interface DatabaseField {
  id: string;
  database: string;
  name: string;
  field_type: string;
  options: Record<string, any>;
  is_required: boolean;
  is_primary: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  created_by: User;
}

export interface DatabaseRecord {
  id: string;
  database: string;
  data: Record<string, any>;
  order: number;
  created_at: string;
  updated_at: string;
  created_by: User;
}

// Template types
export interface Template {
  id: string;
  workspace?: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  template_data: Record<string, any>;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
  created_by: User;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface BlockUpdateMessage extends WebSocketMessage {
  type: 'block_update';
  data: {
    block_id: string;
    page_id: string;
    content: Record<string, any>;
    user: User;
  };
}

export interface PageUpdateMessage extends WebSocketMessage {
  type: 'page_update';
  data: {
    page_id: string;
    title: string;
    user: User;
  };
}

// Form types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface WorkspaceFormData {
  name: string;
  description: string;
  icon: string;
}

export interface PageFormData {
  title: string;
  parent?: string;
  icon?: string;
}