"use client";

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { pluginLoaders } from "@/plugins/manifest";
import { PluginManager } from "@/plugins/plugin-manager";
import { usePluginStore } from "@/store/plugin-store";

type PluginContextValue = {
  manager: PluginManager;
  ready: boolean;
  error: string | null;
};

const PluginContext = createContext<PluginContextValue | null>(null);

export function PluginProvider({ children }: PropsWithChildren) {
  const registerPlugins = usePluginStore((state) => state.registerPlugins);
  const [manager] = useState(() => new PluginManager(pluginLoaders));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const plugins = await manager.loadAll();

        if (!active) {
          return;
        }

        registerPlugins(plugins);
        setReady(true);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Failed to load plugins.");
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [manager, registerPlugins]);

  return <PluginContext.Provider value={{ manager, ready, error }}>{children}</PluginContext.Provider>;
}

export function usePluginManager() {
  const context = useContext(PluginContext);

  if (!context) {
    throw new Error("usePluginManager must be used within PluginProvider.");
  }

  return context;
}
