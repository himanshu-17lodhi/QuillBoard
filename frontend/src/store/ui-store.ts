import { create } from "zustand";

type UiState = {
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open })
}));

