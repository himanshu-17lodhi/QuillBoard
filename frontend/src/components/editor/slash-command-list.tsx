"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { SuggestionKeyDownProps } from "@tiptap/suggestion";
import type { HybridSlashCommand } from "@/plugins/types";
import { cn } from "@/lib/utils";

export type SlashCommandListRef = {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
};

type SlashCommandListProps = {
  items: HybridSlashCommand[];
  command: (item: HybridSlashCommand) => void;
};

export const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  function SlashCommandList({ items, command }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    function selectItem(index: number) {
      const item = items[index];

      if (item) {
        command(item);
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        onKeyDown: ({ event }) => {
          if (!items.length) {
            return false;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((current) => (current + items.length - 1) % items.length);
            return true;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((current) => (current + 1) % items.length);
            return true;
          }

          if (event.key === "Enter") {
            event.preventDefault();
            selectItem(selectedIndex);
            return true;
          }

          return false;
        }
      }),
      [items, selectedIndex]
    );

    if (!items.length) {
      return (
        <div className="rounded-[24px] border border-ink-200 bg-[#fffdf8] p-3 text-sm text-ink-600 shadow-panel">
          No slash commands matched your search.
        </div>
      );
    }

    return (
      <div className="min-w-[320px] rounded-[24px] border border-ink-200 bg-[#fffdf8] p-2 shadow-panel">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectItem(index)}
            className={cn(
              "flex w-full flex-col rounded-[18px] px-3 py-2 text-left transition",
              index === selectedIndex ? "bg-ink-100 text-ink-900" : "text-ink-700 hover:bg-ink-50"
            )}
          >
            <span className="text-sm font-medium">{item.title}</span>
            <span className="text-xs text-ink-500">{item.description}</span>
          </button>
        ))}
      </div>
    );
  }
);

