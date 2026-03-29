import type { JSONContent } from "@tiptap/core";

export type WorkspaceNodeKind = "folder" | "document";

export type WorkspaceNode = {
  id: string;
  name: string;
  kind: WorkspaceNodeKind;
  parentId: string | null;
  icon?: string;
  content?: JSONContent;
  plaintext?: string;
  pluginData?: Record<string, unknown>;
  updatedAt: string;
};

