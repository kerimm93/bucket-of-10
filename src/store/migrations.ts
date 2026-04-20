import type { AppState, BucketItem, Project } from '../types';
import { weekLabel } from '../utils/date';
import { uid } from '../utils/uid';

const validTypes = new Set(['pflicht', 'pflege', 'wachstum', 'kreativ']);
const validProjectStatuses = new Set(['aktiv', 'pausiert', 'archiviert']);

export const normalizeProject = (p: Partial<Project> = {}): Project => {
  const createdAt = p.createdAt ?? new Date().toISOString();
  return {
    id: p.id ?? uid(),
    title: p.title ?? '',
    status: validProjectStatuses.has(p.status ?? '') ? (p.status as Project['status']) : 'aktiv',
    summary: p.summary || p.notes || '',
    currentFocus: p.currentFocus ?? '',
    nextStep: p.nextStep ?? '',
    mainChatUrl: p.mainChatUrl ?? '',
    driveUrl: p.driveUrl ?? '',
    obsidianUrl: p.obsidianUrl || ((p.link && p.link.startsWith('obsidian://')) ? p.link : ''),
    lastAnalysis: p.lastAnalysis ?? '',
    createdAt,
    updatedAt: p.updatedAt ?? createdAt,
    link: p.link ?? '',
    notes: p.notes ?? ''
  };
};

export const normalizeBucketItem = (item: Partial<BucketItem> = {}, fallbackIndex = 1): BucketItem => ({
  id: item.id ?? uid(),
  index: Number(item.index) || fallbackIndex,
  title: item.title ?? '',
  done: Boolean(item.done),
  open: Boolean(item.open),
  type: validTypes.has(item.type ?? '') ? (item.type as BucketItem['type']) : 'pflicht',
  projectId: item.projectId ?? '',
  projectRef: item.projectRef || item.projectId || item.notes || '',
  details: item.details ?? '',
  notes: item.notes ?? ''
});

export const defaultBucketItems = (): BucketItem[] => Array.from({ length: 10 }, (_, idx) =>
  normalizeBucketItem({ id: uid(), index: idx + 1 }, idx + 1)
);

export const migrateState = (raw: unknown): AppState => {
  const parsed = raw && typeof raw === 'object' ? (raw as Partial<AppState>) : {};
  const bucketWeeks = Array.isArray(parsed.bucketWeeks)
    ? parsed.bucketWeeks.map((week) => ({
        id: week.id ?? uid(),
        label: week.label ?? weekLabel(),
        createdAt: week.createdAt ?? new Date().toISOString(),
        items: (Array.isArray(week.items) ? week.items : defaultBucketItems()).map((item, idx) =>
          normalizeBucketItem(item, idx + 1)
        )
      }))
    : [];

  return {
    projects: Array.isArray(parsed.projects) ? parsed.projects.map((p) => normalizeProject(p)) : [],
    resources: Array.isArray(parsed.resources) ? parsed.resources : [],
    candidateSteps: Array.isArray(parsed.candidateSteps) ? parsed.candidateSteps : [],
    bucketWeeks,
    currentWeekId: parsed.currentWeekId ?? '',
    promptDrafts: {
      review: parsed.promptDrafts?.review ?? '',
      deep: parsed.promptDrafts?.deep ?? '',
      cleanup: parsed.promptDrafts?.cleanup ?? ''
    }
  };
};
