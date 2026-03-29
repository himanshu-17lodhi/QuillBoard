import type { PluginLoader } from "@/plugins/types";

export const pluginLoaders: PluginLoader[] = [
  () => import("@/plugins/daily-notes"),
  () => import("@/plugins/markdown-previewer")
];

