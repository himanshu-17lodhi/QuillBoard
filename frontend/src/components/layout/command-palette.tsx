"use client";

import { useEffect } from "react";
import { FilePlus2, FolderTree, Puzzle } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePluginManager } from "@/components/providers/plugin-provider";
import { useFileTreeStore } from "@/store/file-tree-store";
import { usePluginStore } from "@/store/plugin-store";
import { useUiStore } from "@/store/ui-store";

export function CommandPalette() {
  const { manager, ready } = usePluginManager();
  const isOpen = useUiStore((state) => state.isCommandPaletteOpen);
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const nodes = useFileTreeStore((state) => state.nodes);
  const createDocument = useFileTreeStore((state) => state.createDocument);
  const setActiveDocument = useFileTreeStore((state) => state.setActiveDocument);
  const plugins = usePluginStore((state) => Object.values(state.plugins));
  const activePluginIds = usePluginStore((state) => state.activePluginIds);
  const togglePlugin = usePluginStore((state) => state.togglePlugin);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        useUiStore.getState().setCommandPaletteOpen(!useUiStore.getState().isCommandPaletteOpen);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const paletteCommands = ready ? manager.getCommandPaletteItems(activePluginIds) : [];

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="p-0">
        <Command>
          <CommandInput placeholder="Search notes, actions, and plugins..." />
          <CommandList>
            <CommandEmpty className="px-4 py-8 text-center text-sm text-ink-500">
              No notes or commands matched.
            </CommandEmpty>

            <CommandGroup heading="Workspace" className="px-2 py-2 text-xs uppercase tracking-[0.2em] text-ink-500">
              <CommandItem
                value="new-note"
                onSelect={() => {
                  createDocument();
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-sm text-ink-800 data-[selected=true]:bg-ink-100"
              >
                <FilePlus2 className="h-4 w-4" />
                Create a new note
              </CommandItem>
            </CommandGroup>

            <CommandSeparator className="mx-3 h-px bg-ink-100" />

            <CommandGroup heading="Documents" className="px-2 py-2 text-xs uppercase tracking-[0.2em] text-ink-500">
              {nodes
                .filter((node) => node.kind === "document")
                .map((node) => (
                  <CommandItem
                    key={node.id}
                    value={`document-${node.id}-${node.name}`}
                    onSelect={() => {
                      setActiveDocument(node.id);
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-sm text-ink-800 data-[selected=true]:bg-ink-100"
                  >
                    <FolderTree className="h-4 w-4" />
                    {node.name}
                  </CommandItem>
                ))}
            </CommandGroup>

            <CommandSeparator className="mx-3 h-px bg-ink-100" />

            <CommandGroup heading="Plugins" className="px-2 py-2 text-xs uppercase tracking-[0.2em] text-ink-500">
              {plugins.map((plugin) => {
                const enabled = activePluginIds.includes(plugin.id);

                return (
                  <CommandItem
                    key={plugin.id}
                    value={`plugin-${plugin.id}-${plugin.name}`}
                    onSelect={() => {
                      togglePlugin(plugin.id);
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm text-ink-800 data-[selected=true]:bg-ink-100"
                  >
                    <span className="flex items-center gap-3">
                      <Puzzle className="h-4 w-4" />
                      {plugin.name}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-ink-500">
                      {enabled ? "On" : "Off"}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {paletteCommands.length ? (
              <>
                <CommandSeparator className="mx-3 h-px bg-ink-100" />
                <CommandGroup heading="Plugin Actions" className="px-2 py-2 text-xs uppercase tracking-[0.2em] text-ink-500">
                  {paletteCommands.map((command) => (
                    <CommandItem
                      key={command.id}
                      value={`${command.title} ${command.description} ${(command.keywords ?? []).join(" ")}`}
                      onSelect={() => {
                        command.run();
                        setOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-sm text-ink-800 data-[selected=true]:bg-ink-100"
                    >
                      <Puzzle className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{command.title}</span>
                        <span className="text-xs text-ink-500">{command.description}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

