"use client";

import { Badge } from "@/components/ui/badge";
import { usePluginManager } from "@/components/providers/plugin-provider";
import { useFileTreeStore } from "@/store/file-tree-store";
import { usePluginStore } from "@/store/plugin-store";
import { HybridEditor } from "./hybrid-editor";

export function EditorShell() {
  const { manager, ready, error } = usePluginManager();
  const activePluginIds = usePluginStore((state) => state.activePluginIds);
  const activeDocument = useFileTreeStore((state) => state.getActiveDocument());
  const plugins = ready ? manager.getEnabledPlugins(activePluginIds) : [];
  const panelPlugins = plugins.filter((plugin) => plugin.surfaces?.panel);

  return (
    <section className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 animate-fade-slide">
        <HybridEditor />
      </div>
      <aside className="space-y-4">
        <div className="rounded-[32px] border border-white/70 bg-white/70 p-5 shadow-sm">
          <p className="font-serif text-xl text-ink-900">Plugin Runtime</p>
          <p className="mt-2 text-sm text-ink-600">
            Dynamic modules are loaded from <code className="rounded bg-ink-100 px-1 py-0.5">/src/plugins</code>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {plugins.map((plugin) => (
              <Badge key={plugin.id}>{plugin.name}</Badge>
            ))}
          </div>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        </div>
        {panelPlugins.map((plugin) => {
          const Panel = plugin.surfaces?.panel;

          if (!Panel) {
            return null;
          }

          return <Panel key={plugin.id} activeDocument={activeDocument} />;
        })}
      </aside>
    </section>
  );
}

