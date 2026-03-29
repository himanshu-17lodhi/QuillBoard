"use client";

import { FileText, FolderOpen, NotebookTabs, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePluginManager } from "@/components/providers/plugin-provider";
import { cn } from "@/lib/utils";
import { useFileTreeStore } from "@/store/file-tree-store";
import { usePluginStore } from "@/store/plugin-store";
import type { WorkspaceNode } from "@/types/document";

function renderTree(
  nodes: WorkspaceNode[],
  parentId: string | null,
  activeDocumentId: string | null,
  setActiveDocument: (id: string) => void,
  depth = 0
) {
  return nodes
    .filter((node) => node.parentId === parentId)
    .sort((left, right) => {
      if (left.kind !== right.kind) {
        return left.kind === "folder" ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    })
    .map((node) => (
      <div key={node.id}>
        <button
          type="button"
          onClick={() => {
            if (node.kind === "document") {
              setActiveDocument(node.id);
            }
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition",
            node.kind === "document" && activeDocumentId === node.id
              ? "bg-ink-100 text-ink-900"
              : "text-ink-700 hover:bg-white/70"
          )}
          style={{ paddingLeft: 12 + depth * 16 }}
        >
          {node.kind === "folder" ? (
            <FolderOpen className="h-4 w-4 text-ink-500" />
          ) : (
            <FileText className="h-4 w-4 text-ink-500" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {node.kind === "folder" ? renderTree(nodes, node.id, activeDocumentId, setActiveDocument, depth + 1) : null}
      </div>
    ));
}

export function Sidebar() {
  const { manager, ready } = usePluginManager();
  const nodes = useFileTreeStore((state) => state.nodes);
  const activeDocumentId = useFileTreeStore((state) => state.activeDocumentId);
  const setActiveDocument = useFileTreeStore((state) => state.setActiveDocument);
  const createDocument = useFileTreeStore((state) => state.createDocument);
  const openOrCreateDailyNote = useFileTreeStore((state) => state.openOrCreateDailyNote);
  const activeDocument = useFileTreeStore((state) => state.getActiveDocument());
  const activePluginIds = usePluginStore((state) => state.activePluginIds);
  const sidebarPlugins = ready
    ? manager.getEnabledPlugins(activePluginIds).filter((plugin) => plugin.surfaces?.sidebar)
    : [];

  return (
    <aside className="w-full animate-fade-slide lg:w-[320px]">
      <div className="rounded-[36px] border border-white/70 bg-white/55 p-4 shadow-panel backdrop-blur">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="font-serif text-2xl text-ink-900">QuillBoard</p>
            <p className="mt-1 text-sm text-ink-600">Obsidian-style plugins. Notion-style reach.</p>
          </div>
          <NotebookTabs className="mt-1 h-6 w-6 text-ink-600" />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <Button variant="default" className="justify-start" onClick={() => createDocument()}>
            <Plus className="h-4 w-4" />
            New Note
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => openOrCreateDailyNote()}>
            <Sparkles className="h-4 w-4" />
            Today
          </Button>
        </div>

        <div className="rounded-[28px] border border-white/80 bg-[#f7f1e5]/80 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">Workspace</p>
            <span className="text-xs text-ink-500">{nodes.filter((node) => node.kind === "document").length} notes</span>
          </div>
          <ScrollArea className="max-h-[420px] pr-1">
            <div className="space-y-1">{renderTree(nodes, null, activeDocumentId, setActiveDocument)}</div>
          </ScrollArea>
        </div>

        <div className="mt-4 space-y-3">
          {sidebarPlugins.map((plugin) => {
            const SidebarWidget = plugin.surfaces?.sidebar;

            if (!SidebarWidget) {
              return null;
            }

            return <SidebarWidget key={plugin.id} activeDocument={activeDocument} />;
          })}
        </div>
      </div>
    </aside>
  );
}
