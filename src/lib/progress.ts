/**
 * Local progress tracking for DSArc.
 *
 * Learner progress (completed sections/subsections) is stored entirely in the
 * browser via localStorage. No account, no server.
 *
 * TODO: wire up with docs pages once chapter content lands.
 */

const STORAGE_KEY = 'dsarc:progress:v1';

export interface ProgressState {
  /** page URLs (e.g. /docs/arrays/two-pointer) marked as completed */
  completedPages: string[];
  /** ISO timestamp of the last update */
  updatedAt: string | null;
}

const emptyState: ProgressState = {
  completedPages: [],
  updatedAt: null,
};

export function loadProgress(): ProgressState {
  if (typeof window === 'undefined') return emptyState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    return { ...emptyState, ...(JSON.parse(raw) as Partial<ProgressState>) };
  } catch {
    return emptyState;
  }
}

export function saveProgress(state: ProgressState): void {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...state, updatedAt: new Date().toISOString() }),
  );
}

export function togglePageCompleted(pageUrl: string): ProgressState {
  const state = loadProgress();
  const completed = new Set(state.completedPages);

  if (completed.has(pageUrl)) {
    completed.delete(pageUrl);
  } else {
    completed.add(pageUrl);
  }

  const next = { ...state, completedPages: [...completed] };
  saveProgress(next);
  return next;
}
