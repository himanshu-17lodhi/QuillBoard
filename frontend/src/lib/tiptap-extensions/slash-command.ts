import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import { SlashCommandList, type SlashCommandListRef } from "@/components/editor/slash-command-list";
import type { HybridSlashCommand } from "@/plugins/types";

type SlashCommandOptions = {
  suggestion: Record<string, unknown>;
};

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slash-command",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        items: () => []
      }
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        render: () => {
          let component: ReactRenderer<SlashCommandListRef> | null = null;
          let popup: ReturnType<typeof tippy> | null = null;

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(SlashCommandList, {
                props: {
                  items: props.items as HybridSlashCommand[],
                  command: (item: HybridSlashCommand) => props.command(item)
                },
                editor: props.editor
              });

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as any,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start"
              });
            },
            onUpdate(props: any) {
              component?.updateProps({
                items: props.items as HybridSlashCommand[],
                command: (item: HybridSlashCommand) => props.command(item)
              });

              popup?.[0].setProps({
                getReferenceClientRect: props.clientRect as any
              });
            },
            onKeyDown(props: any) {
              if (props.event.key === "Escape") {
                popup?.[0].hide();
                return true;
              }

              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit() {
              popup?.[0].destroy();
              component?.destroy();
            }
          };
        }
      })
    ];
  }
});

