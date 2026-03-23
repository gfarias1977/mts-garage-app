import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SidebarPosition = 'left' | 'right' | 'top';

interface LayoutState {
  collapsed: boolean;
  position: SidebarPosition;
  toggleCollapsed: () => void;
  setPosition: (p: SidebarPosition) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      collapsed: false,
      position: 'left',
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setPosition: (p) => set({ position: p }),
    }),
    { name: 'mts-layout' },
  ),
);
