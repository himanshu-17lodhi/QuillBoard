import type {
  HybridPlugin,
  HybridSlashCommand,
  PluginDatabaseSchema,
  PluginLoader,
  PluginPaletteAction
} from "@/plugins/types";

export class PluginManager {
  private registry = new Map<string, HybridPlugin>();

  private loaded = false;

  constructor(private readonly loaders: PluginLoader[]) {}

  async loadAll() {
    if (this.loaded) {
      return this.getPlugins();
    }

    const modules = await Promise.all(this.loaders.map((loader) => loader()));

    for (const module of modules) {
      this.register(module.default);
    }

    this.loaded = true;

    return this.getPlugins();
  }

  register(plugin: HybridPlugin) {
    this.registry.set(plugin.id, plugin);
  }

  getPlugins() {
    return Array.from(this.registry.values()).sort((left, right) => left.name.localeCompare(right.name));
  }

  getEnabledPlugins(activePluginIds: string[]) {
    const activeSet = new Set(activePluginIds);
    return this.getPlugins().filter((plugin) => activeSet.has(plugin.id));
  }

  getCommandPaletteItems(activePluginIds: string[]): PluginPaletteAction[] {
    return this.getEnabledPlugins(activePluginIds).flatMap((plugin) => plugin.commandPalette ?? []);
  }

  getSlashCommands(activePluginIds: string[]): HybridSlashCommand[] {
    return this.getEnabledPlugins(activePluginIds).flatMap((plugin) => plugin.slashCommands ?? []);
  }

  getDatabaseSchemas(activePluginIds?: string[]): PluginDatabaseSchema[] {
    const plugins = activePluginIds ? this.getEnabledPlugins(activePluginIds) : this.getPlugins();
    return plugins.flatMap((plugin) => plugin.database?.schemas ?? []);
  }

  getPlugin(pluginId: string) {
    return this.registry.get(pluginId);
  }
}

