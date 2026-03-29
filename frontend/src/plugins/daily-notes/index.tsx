"use client";

import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HybridPlugin } from "@/plugins/types";
import { useFileTreeStore } from "@/store/file-tree-store";
import { dailyNotesSchema } from "./schema";

function DailyNotesSidebar() {
  const openOrCreateDailyNote = useFileTreeStore((state) => state.openOrCreateDailyNote);

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-lg text-ink-900">Daily Notes</p>
          <p className="text-sm text-ink-600">One tap capture for every day.</p>
        </div>
        <Badge>Plugin</Badge>
      </div>
      <Button className="w-full justify-start" onClick={() => openOrCreateDailyNote()}>
        <CalendarDays className="h-4 w-4" />
        Open Today&apos;s Note
      </Button>
    </section>
  );
}

const dailyNotesPlugin: HybridPlugin = {
  id: "daily-notes",
  name: "Daily Notes",
  description: "Creates date-based notes and a quick-access sidebar widget.",
  version: "0.1.0",
  defaultEnabled: true,
  surfaces: {
    sidebar: DailyNotesSidebar
  },
  commandPalette: [
    {
      id: "daily-notes.open-today",
      title: "Open today's daily note",
      description: "Create or jump to the note for the current day.",
      keywords: ["journal", "today", "daily"],
      run: () => {
        useFileTreeStore.getState().openOrCreateDailyNote();
      }
    }
  ],
  slashCommands: [
    {
      id: "daily-notes.insert-heading",
      title: "Insert today's heading",
      description: "Adds a dated heading block for quick journaling.",
      keywords: ["daily", "heading", "journal"],
      group: "Plugins",
      onSelect: (editor) => {
        const label = new Date().toISOString().slice(0, 10);
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: label }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "What matters most today?" }]
            }
          ])
          .run();
      }
    },
    {
      id: "daily-notes.insert-retro",
      title: "Insert retro template",
      description: "Adds wins, blockers, and follow-ups sections.",
      keywords: ["retro", "template", "journal"],
      group: "Plugins",
      onSelect: (editor) => {
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Wins" }]
            },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Captured momentum" }] }]
                }
              ]
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Blockers" }]
            },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Need follow-up" }] }]
                }
              ]
            }
          ])
          .run();
      }
    }
  ],
  database: {
    schemas: [dailyNotesSchema]
  }
};

export default dailyNotesPlugin;

