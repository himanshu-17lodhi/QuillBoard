"use client";

import ReactMarkdown from "react-markdown";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { HybridPlugin, PluginPanelProps } from "@/plugins/types";
import { usePluginStore } from "@/store/plugin-store";
import { markdownPreviewerSchema } from "./schema";

function MarkdownPreviewPanel({ activeDocument }: PluginPanelProps) {
  return (
    <section className="rounded-[32px] border border-white/70 bg-white/70 p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-xl text-ink-900">Markdown Preview</p>
          <p className="text-sm text-ink-600">Rendered from the document&apos;s plain-text projection.</p>
        </div>
        <Badge>
          <Eye className="mr-1 h-3 w-3" />
          Live
        </Badge>
      </div>
      <div className="prose-panel min-h-[280px] rounded-[24px] border border-ink-100 bg-[#fffdf8] p-4 text-sm text-ink-700">
        {activeDocument?.plaintext ? (
          <ReactMarkdown>{activeDocument.plaintext}</ReactMarkdown>
        ) : (
          <p>Select a document to preview its markdown projection.</p>
        )}
      </div>
    </section>
  );
}

const markdownPreviewerPlugin: HybridPlugin = {
  id: "markdown-previewer",
  name: "Markdown Previewer",
  description: "Renders a markdown side panel for the active note.",
  version: "0.1.0",
  defaultEnabled: true,
  surfaces: {
    panel: MarkdownPreviewPanel
  },
  commandPalette: [
    {
      id: "markdown-previewer.toggle",
      title: "Toggle markdown previewer",
      description: "Show or hide the preview plugin panel.",
      keywords: ["preview", "markdown", "plugin"],
      run: () => {
        usePluginStore.getState().togglePlugin("markdown-previewer");
      }
    }
  ],
  slashCommands: [
    {
      id: "markdown-previewer.insert-callout",
      title: "Insert markdown callout",
      description: "Adds a markdown-friendly quote block.",
      keywords: ["markdown", "quote", "callout"],
      group: "Plugins",
      onSelect: (editor) => {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "blockquote",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Tip: this note previews as markdown in the side panel." }]
              }
            ]
          })
          .run();
      }
    }
  ],
  database: {
    schemas: [markdownPreviewerSchema]
  }
};

export default markdownPreviewerPlugin;
