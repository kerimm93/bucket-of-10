export type BucketType = 'pflicht' | 'pflege' | 'wachstum' | 'kreativ';

export interface BucketItem {
  id: string;
  index: number;
  title: string;
  done: boolean;
  open: boolean;
  type: BucketType;
  projectId: string;
  projectRef: string;
  details: string;
  notes: string;
}

export interface BucketWeek {
  id: string;
  label: string;
  createdAt: string;
  items: BucketItem[];
}

export interface Project {
  id: string;
  title: string;
  status: 'aktiv' | 'pausiert' | 'archiviert';
  summary: string;
  currentFocus: string;
  nextStep: string;
  mainChatUrl: string;
  driveUrl: string;
  obsidianUrl: string;
  lastAnalysis: string;
  createdAt: string;
  updatedAt: string;
  link?: string;
  notes?: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'gpt' | 'obsidian' | 'doc' | 'reader' | 'zotero' | 'raindrop' | 'other';
  projectRef: string;
  reason: string;
  createdAt: string;
}

export interface CandidateStep {
  id: string;
  title: string;
  projectId: string;
  projectRef: string;
  whyNow: string;
  type: 'pflicht' | 'pflege' | 'wachstum' | 'kreativ' | 'offen';
  createdAt: string;
}

export interface AppState {
  projects: Project[];
  resources: Resource[];
  candidateSteps: CandidateStep[];
  bucketWeeks: BucketWeek[];
  currentWeekId: string;
  promptDrafts: {
    review: string;
    deep: string;
    cleanup: string;
  };
}
