import type { Editor } from "@tiptap/react";
import type { ComponentType } from "react";
import type { WorkspaceNode } from "@/types/document";

export type PluginPanelProps = {
  activeDocument: WorkspaceNode | null;
};

export type PluginDatabaseSchema = {
  name: string;
  sql: string;
  prismaModel?: string;
};

export type PluginPaletteAction = {
  id: string;
  title: string;
  description: string;
  keywords?: string[];
  run: () => void;
};

export type HybridSlashCommand = {
  id: string;
  title: string;
  description: string;
  keywords?: string[];
  group?: string;
  onSelect: (editor: Editor) => void;
};

export type HybridPlugin = {
  id: string;
  name: string;
  description: string;
  version: string;
  defaultEnabled?: boolean;
  surfaces?: {
    sidebar?: ComponentType<PluginPanelProps>;
    panel?: ComponentType<PluginPanelProps>;
  };
  commandPalette?: PluginPaletteAction[];
  slashCommands?: HybridSlashCommand[];
  database?: {
    schemas: PluginDatabaseSchema[];
  };
};

export type PluginModule = {
  default: HybridPlugin;
};

export type PluginLoader = () => Promise<PluginModule>;

