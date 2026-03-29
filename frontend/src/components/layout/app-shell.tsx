"use client";

import { EditorShell } from "@/components/editor/editor-shell";
import { CommandPalette } from "@/components/layout/command-palette";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,248,232,0.95),transparent_32%),radial-gradient(circle_at_top_right,rgba(215,190,155,0.35),transparent_28%),linear-gradient(180deg,#f6efe1_0%,#efe4d2_44%,#e6d7c1_100%)] bg-paper-grid bg-grid">
      <CommandPalette />
      <div className="mx-auto flex max-w-[1700px] flex-col gap-4 px-4 py-4 lg:flex-row lg:gap-6 lg:px-6 lg:py-6">
        <Sidebar />
        <EditorShell />
      </div>
    </div>
  );
}

