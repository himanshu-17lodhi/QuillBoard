"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { CheckSquare, Heading1, Heading2, List, Quote, Sparkles } from "lucide-react";
import { usePluginManager } from "@/components/providers/plugin-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SlashCommand } from "@/lib/tiptap-extensions/slash-command";
import type { HybridSlashCommand } from "@/plugins/types";
import { useFileTreeStore } from "@/store/file-tree-store";
import { usePluginStore } from "@/store/plugin-store";

const EMPTY_DOCUMENT = {
  type: "doc",
  content: [
    {
      type: "paragraph"
    }
  ]
};

function filterSlashItems(items: HybridSlashCommand[], query: string) {
  if (!query) {
    return items.slice(0, 8);
  }

  const normalized = query.toLowerCase();

  return items
    .filter((item) => {
      const haystack = [item.title, item.description, ...(item.keywords ?? [])].join(" ").toLowerCase();
      return haystack.includes(normalized);
    })
    .slice(0, 8);
}

export function HybridEditor() {
  const { manager, ready } = usePluginManager();
  const activePluginIds = usePluginStore((state) => state.activePluginIds);
  const activeDocument = useFileTreeStore((state) => state.getActiveDocument());
  const updateDocumentContent = useFileTreeStore((state) => state.updateDocumentContent);

  const coreSlashCommands: HybridSlashCommand[] = [
    {
      id: "core.text",
      title: "Text block",
      description: "Insert a clean paragraph block.",
      keywords: ["paragraph", "text"],
      group: "Core",
      onSelect: (editor) => {
        editor.chain().focus().insertContent({ type: "paragraph" }).run();
      }
    },
    {
      id: "core.heading1",
      title: "Heading 1",
      description: "Large page heading.",
      keywords: ["title", "heading"],
      group: "Core",
      onSelect: (editor) => {
        editor.chain().focus().setNode("heading", { level: 1 }).run();
      }
    },
    {
      id: "core.heading2",
      title: "Heading 2",
      description: "Section heading.",
      keywords: ["subtitle", "heading"],
      group: "Core",
      onSelect: (editor) => {
        editor.chain().focus().setNode("heading", { level: 2 }).run();
      }
    },
    {
      id: "core.todo",
      title: "Checklist",
      description: "Create a task list.",
      keywords: ["task", "todo", "list"],
      group: "Core",
      onSelect: (editor) => {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "New checklist item" }] }]
              }
            ]
          })
          .run();
      }
    },
    {
      id: "core.quote",
      title: "Quote",
      description: "Insert a quote block.",
      keywords: ["quote", "callout"],
      group: "Core",
      onSelect: (editor) => {
        editor.chain().focus().toggleBlockquote().run();
      }
    }
  ];

  const slashItems = ready
    ? [...coreSlashCommands, ...manager.getSlashCommands(activePluginIds)]
    : coreSlashCommands;

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: "Write, link, and extend your notes..."
        }),
        SlashCommand.configure({
          suggestion: {
            items: ({ query }: { query: string }) => filterSlashItems(slashItems, query),
            command: ({ editor: currentEditor, props }: { editor: any; props: HybridSlashCommand }) => {
              props.onSelect(currentEditor);
            }
          }
        })
      ],
      content: activeDocument?.content ?? EMPTY_DOCUMENT,
      editable: activeDocument?.kind === "document",
      onUpdate: ({ editor: currentEditor }) => {
        if (!activeDocument || activeDocument.kind !== "document") {
          return;
        }

        updateDocumentContent(activeDocument.id, currentEditor.getJSON(), currentEditor.getText());
      }
    },
    [activeDocument?.id, activePluginIds.join("|"), ready]
  );

  const pluginBadges = ready ? manager.getEnabledPlugins(activePluginIds) : [];

  if (!activeDocument || activeDocument.kind !== "document") {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-[32px] border border-dashed border-ink-300 bg-white/50 p-8 text-center text-ink-600">
        Select a document to start writing.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-[32px] border border-white/70 bg-[#fffdf8]/90 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-200/70 px-5 py-4">
        <div>
          <p className="font-serif text-2xl text-ink-900">{activeDocument.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {pluginBadges.map((plugin) => (
              <Badge key={plugin.id}>{plugin.name}</Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!editor) {
                return;
              }

              editor.chain().focus().setNode("heading", { level: 1 }).run();
            }}
          >
            <Heading1 className="h-4 w-4" />
            H1
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!editor) {
                return;
              }

              editor.chain().focus().setNode("heading", { level: 2 }).run();
            }}
          >
            <Heading2 className="h-4 w-4" />
            H2
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!editor) {
                return;
              }

              editor.chain().focus().toggleBulletList().run();
            }}
          >
            <List className="h-4 w-4" />
            List
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!editor) {
                return;
              }

              editor.chain().focus().toggleBlockquote().run();
            }}
          >
            <Quote className="h-4 w-4" />
            Quote
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/70 px-5 py-2 text-xs text-ink-600">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Use `/` for blocks and plugins.</span>
        <CheckSquare className="ml-3 h-3.5 w-3.5" />
        <span>Use `Cmd+K` for commands.</span>
      </div>
      <div className="flex-1 overflow-auto px-3 py-4">
        <EditorContent editor={editor} className="hybrid-editor min-h-[560px] px-4 py-2" />
      </div>
    </div>
  );
}
