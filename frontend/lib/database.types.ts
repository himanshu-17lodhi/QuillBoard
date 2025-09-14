export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      workspaces: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: "owner" | "editor" | "viewer"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: "owner" | "editor" | "viewer"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: "owner" | "editor" | "viewer"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          title: string
          workspace_id: string
          parent_id: string | null
          content: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string
          workspace_id: string
          parent_id?: string | null
          content?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          workspace_id?: string
          parent_id?: string | null
          content?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          }
        ]
      }
      document_collaborators: {
        Row: {
          id: string
          document_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_collaborators_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      blocks: {
        Row: {
          id: string
          type: string
          content: Json
          document_id: string
          parent_id: string | null
          order: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          content?: Json
          document_id: string
          parent_id?: string | null
          order: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          content?: Json
          document_id?: string
          parent_id?: string | null
          order?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          content: string
          document_id: string
          block_id: string | null
          user_id: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          document_id: string
          block_id?: string | null
          user_id: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          document_id?: string
          block_id?: string | null
          user_id?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_workspaces: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          name: string
          owner_id: string
          created_at: string
          updated_at: string
          user_role: string
        }[]
      }
      get_document_with_permissions: {
        Args: {
          document_id: string
          user_id: string
        }
        Returns: {
          id: string
          title: string
          workspace_id: string
          parent_id: string
          content: Json
          created_by: string
          created_at: string
          updated_at: string
          can_edit: boolean
          can_view: boolean
        }[]
      }
      search_documents: {
        Args: {
          search_query: string
          user_id: string
        }
        Returns: {
          id: string
          title: string
          workspace_id: string
          content: Json
          created_at: string
          updated_at: string
          similarity: number
        }[]
      }
    }
    Enums: {
      user_role: "owner" | "editor" | "viewer"
      block_type: "paragraph" | "heading" | "code" | "image" | "list" | "quote" | "divider"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific table types
export type Profile = Tables<'profiles'>
export type Workspace = Tables<'workspaces'>
export type WorkspaceMember = Tables<'workspace_members'>
export type Document = Tables<'documents'>
export type DocumentCollaborator = Tables<'document_collaborators'>
export type Block = Tables<'blocks'>
export type Comment = Tables<'comments'>

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type WorkspaceInsert = Database['public']['Tables']['workspaces']['Insert']
export type WorkspaceMemberInsert = Database['public']['Tables']['workspace_members']['Insert']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentCollaboratorInsert = Database['public']['Tables']['document_collaborators']['Insert']
export type BlockInsert = Database['public']['Tables']['blocks']['Insert']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type WorkspaceUpdate = Database['public']['Tables']['workspaces']['Update']
export type WorkspaceMemberUpdate = Database['public']['Tables']['workspace_members']['Update']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']
export type DocumentCollaboratorUpdate = Database['public']['Tables']['document_collaborators']['Update']
export type BlockUpdate = Database['public']['Tables']['blocks']['Update']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']