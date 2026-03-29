import { create } from "zustand";
import type { HybridPlugin } from "@/plugins/types";

type PluginStore = {
  plugins: Record<string, HybridPlugin>;
  activePluginIds: string[];
  registerPlugins: (plugins: HybridPlugin[]) => void;
  setPluginEnabled: (pluginId: string, enabled: boolean) => void;
  togglePlugin: (pluginId: string) => void;
};

export const usePluginStore = create<PluginStore>((set) => ({
  plugins: {},
  activePluginIds: [],
  registerPlugins: (plugins) =>
    set((state) => {
      const nextPlugins = { ...state.plugins };

      for (const plugin of plugins) {
        nextPlugins[plugin.id] = plugin;
      }

      const defaults = plugins.filter((plugin) => plugin.defaultEnabled !== false).map((plugin) => plugin.id);

      return {
        plugins: nextPlugins,
        activePluginIds: Array.from(new Set([...state.activePluginIds, ...defaults]))
      };
    }),
  setPluginEnabled: (pluginId, enabled) =>
    set((state) => ({
      activePluginIds: enabled
        ? Array.from(new Set([...state.activePluginIds, pluginId]))
        : state.activePluginIds.filter((id) => id !== pluginId)
    })),
  togglePlugin: (pluginId) =>
    set((state) => ({
      activePluginIds: state.activePluginIds.includes(pluginId)
        ? state.activePluginIds.filter((id) => id !== pluginId)
        : [...state.activePluginIds, pluginId]
    }))
}));

