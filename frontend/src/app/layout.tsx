import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PluginProvider } from "@/components/providers/plugin-provider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "QuillBoard",
  description: "A plugin-driven note workspace inspired by Obsidian and Notion."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PluginProvider>{children}</PluginProvider>
      </body>
    </html>
  );
}
