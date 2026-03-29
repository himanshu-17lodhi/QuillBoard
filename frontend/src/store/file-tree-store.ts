import type { JSONContent } from "@tiptap/core";
import { create } from "zustand";
import type { WorkspaceNode, WorkspaceNodeKind } from "@/types/document";

const EMPTY_DOCUMENT: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph"
    }
  ]
};

const STARTER_DOCUMENT: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: {
        level: 1
      },
      content: [
        {
          type: "text",
          text: "QuillBoard"
        }
      ]
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Mix local-first extensibility with cloud collaboration. Use / for blocks and Cmd+K for the command palette."
        }
      ]
    }
  ]
};

const initialNodes: WorkspaceNode[] = [
  {
    id: "folder-root-notes",
    name: "Workspace",
    kind: "folder",
    parentId: null,
    updatedAt: new Date().toISOString()
  },
  {
    id: "document-welcome",
    name: "Welcome",
    kind: "document",
    parentId: "folder-root-notes",
    content: STARTER_DOCUMENT,
    plaintext:
      "QuillBoard\n\nMix local-first extensibility with cloud collaboration. Use / for blocks and Cmd+K for the command palette.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "folder-projects",
    name: "Projects",
    kind: "folder",
    parentId: "folder-root-notes",
    updatedAt: new Date().toISOString()
  },
  {
    id: "document-roadmap",
    name: "Roadmap",
    kind: "document",
    parentId: "folder-projects",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Q2 Product Roadmap" }]
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Realtime collaboration" }] }]
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Plugin sandboxing" }] }]
            }
          ]
        }
      ]
    },
    plaintext: "Q2 Product Roadmap\n\n- Realtime collaboration\n- Plugin sandboxing",
    updatedAt: new Date().toISOString()
  }
];

function createId(prefix: WorkspaceNodeKind) {
  const generated = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${generated}`;
}

function todayTitle(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

type CreateNodeInput = {
  name: string;
  kind?: WorkspaceNodeKind;
  parentId?: string | null;
  content?: JSONContent;
  pluginData?: Record<string, unknown>;
};

type FileTreeState = {
  nodes: WorkspaceNode[];
  activeDocumentId: string | null;
  setActiveDocument: (id: string) => void;
  createNode: (input: CreateNodeInput) => WorkspaceNode;
  createDocument: (name?: string, parentId?: string | null) => WorkspaceNode;
  openOrCreateDailyNote: (date?: Date) => WorkspaceNode;
  updateDocumentContent: (id: string, content: JSONContent, plaintext: string) => void;
  getActiveDocument: () => WorkspaceNode | null;
};

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  nodes: initialNodes,
  activeDocumentId: "document-welcome",
  setActiveDocument: (id) => set({ activeDocumentId: id }),
  createNode: (input) => {
    const nextNode: WorkspaceNode = {
      id: createId(input.kind ?? "document"),
      name: input.name,
      kind: input.kind ?? "document",
      parentId: input.parentId ?? "folder-root-notes",
      content: input.kind === "folder" ? undefined : input.content ?? EMPTY_DOCUMENT,
      plaintext: input.kind === "folder" ? undefined : "",
      pluginData: input.pluginData,
      updatedAt: new Date().toISOString()
    };

    set((state) => ({
      nodes: [...state.nodes, nextNode],
      activeDocumentId: nextNode.kind === "document" ? nextNode.id : state.activeDocumentId
    }));

    return nextNode;
  },
  createDocument: (name = "Untitled", parentId = "folder-root-notes") =>
    get().createNode({
      name,
      kind: "document",
      parentId
    }),
  openOrCreateDailyNote: (date = new Date()) => {
    const { nodes, createNode } = get();
    const dailyFolder =
      nodes.find(
        (node) =>
          node.kind === "folder" &&
          node.name === "Daily Notes" &&
          node.pluginData?.pluginId === "daily-notes"
      ) ??
      createNode({
        name: "Daily Notes",
        kind: "folder",
        parentId: "folder-root-notes",
        pluginData: {
          pluginId: "daily-notes"
        }
      });

    const noteName = todayTitle(date);
    const existing = get().nodes.find(
      (node) => node.kind === "document" && node.parentId === dailyFolder.id && node.name === noteName
    );

    if (existing) {
      set({ activeDocumentId: existing.id });
      return existing;
    }

    const note = createNode({
      name: noteName,
      kind: "document",
      parentId: dailyFolder.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: noteName }]
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Capture tasks, meetings, and reflections for today." }]
          }
        ]
      },
      pluginData: {
        pluginId: "daily-notes"
      }
    });

    set({ activeDocumentId: note.id });
    return note;
  },
  updateDocumentContent: (id, content, plaintext) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              content,
              plaintext,
              updatedAt: new Date().toISOString()
            }
          : node
      )
    })),
  getActiveDocument: () => {
    const { nodes, activeDocumentId } = get();
    return nodes.find((node) => node.id === activeDocumentId) ?? null;
  }
}));
