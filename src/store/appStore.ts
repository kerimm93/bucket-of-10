import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, BucketItem } from '../types';
import { weekLabel } from '../utils/date';
import { uid } from '../utils/uid';
import { defaultBucketItems, migrateState } from './migrations';

const STORAGE_KEY = 'bucket_of_ten_v1';

interface Store extends AppState {
  startNewWeek: (silent?: boolean) => void;
  clearCurrentBucket: () => void;
  openWeek: (id: string) => void;
  updateItem: (id: string, patch: Partial<BucketItem>) => void;
  fillFromPaste: (startIndex: number, lines: string[]) => number;
  exportData: () => string;
  importData: (json: string) => { ok: boolean; message: string };
  getCurrentWeek: () => AppState['bucketWeeks'][number] | null;
}

const initialState: AppState = {
  projects: [],
  resources: [],
  candidateSteps: [],
  bucketWeeks: [],
  currentWeekId: '',
  promptDrafts: { review: '', deep: '', cleanup: '' }
};

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,
      getCurrentWeek: () => get().bucketWeeks.find((w) => w.id === get().currentWeekId) ?? null,
      startNewWeek: (silent = false) => {
        const current = get().getCurrentWeek();
        if (!silent && current?.items.some((item) => item.title.trim())) {
          const ok = window.confirm('Neue Woche beginnen? Die aktuelle Bucket wird im Verlauf gespeichert und kann jederzeit wieder geöffnet werden.');
          if (!ok) return;
        }
        const week = { id: uid(), createdAt: new Date().toISOString(), label: weekLabel(), items: defaultBucketItems() };
        set((state) => ({ bucketWeeks: [week, ...state.bucketWeeks], currentWeekId: week.id }));
      },
      clearCurrentBucket: () => {
        const week = get().getCurrentWeek();
        if (!week) return;
        const ok = window.confirm('Alle zehn Zeilen leeren? Diese Woche beginnt dann neu.');
        if (!ok) return;
        set((state) => ({
          bucketWeeks: state.bucketWeeks.map((w) => (w.id === state.currentWeekId ? { ...w, items: defaultBucketItems() } : w))
        }));
      },
      openWeek: (id) => set({ currentWeekId: id }),
      updateItem: (id, patch) => {
        set((state) => ({
          bucketWeeks: state.bucketWeeks.map((w) =>
            w.id !== state.currentWeekId
              ? w
              : { ...w, items: w.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) }
          )
        }));
      },
      fillFromPaste: (startIndex, lines) => {
        let lastFilled = startIndex;
        set((state) => ({
          bucketWeeks: state.bucketWeeks.map((w) => {
            if (w.id !== state.currentWeekId) return w;
            const items = [...w.items];
            lines.forEach((line, idx) => {
              const target = startIndex + idx;
              if (target > 10) return;
              const itemIndex = items.findIndex((it) => it.index === target);
              if (itemIndex >= 0) {
                items[itemIndex] = { ...items[itemIndex], title: line };
                lastFilled = target;
              }
            });
            return { ...w, items };
          })
        }));
        return lastFilled;
      },
      exportData: () => JSON.stringify(migrateState(get()), null, 2),
      importData: (json) => {
        try {
          const parsed = JSON.parse(json);
          const migrated = migrateState(parsed);
          set(migrated);
          return { ok: true, message: 'Import erfolgreich.' };
        } catch {
          return { ok: false, message: 'Ungültiges JSON.' };
        }
      }
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      migrate: (persistedState) => {
        const migrated = migrateState(persistedState);
        if (!migrated.currentWeekId && migrated.bucketWeeks[0]) {
          migrated.currentWeekId = migrated.bucketWeeks[0].id;
        }
        if (!migrated.bucketWeeks.length) {
          const week = { id: uid(), label: weekLabel(), createdAt: new Date().toISOString(), items: defaultBucketItems() };
          migrated.bucketWeeks = [week];
          migrated.currentWeekId = week.id;
        }
        return migrated;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.currentWeekId || !state.bucketWeeks.find((w) => w.id === state.currentWeekId)) {
          state.startNewWeek(true);
        }
      }
    }
  )
);
