import {
  STORAGE_KEY_SCORING,
  STORAGE_KEY_VACANCIES,
  STORAGE_KEY_PROGRESS,
  STORAGE_KEY_SETTINGS,
  DEFAULT_SCORING,
} from "./constants";
import type {
  ScoringConfig,
  Vacancy,
  ScanProgress,
  ProfileType,
} from "./types";

// ============================================================
// TYPED CHROME STORAGE WRAPPER
// ============================================================

export interface AppSettings {
  targetUrl: string;
  autoOpenDashboard: boolean;
  scanDelayMs: number;
  activeProfile: ProfileType;
}

const DEFAULT_SETTINGS: AppSettings = {
  targetUrl:
    "https://hh.ru/search/vacancy?employment=project&schedule=remote&text=TypeScript+OR+React+OR+Node.js+OR+Next.js+OR+разработчик",
  autoOpenDashboard: true,
  scanDelayMs: 1500,
  activeProfile: "fullstack",
};

async function get<T>(key: string, fallback: T): Promise<T> {
  const result = await chrome.storage.local.get(key);
  return (result[key] as T) ?? fallback;
}

async function set<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

// ---------- Scoring config ----------
export const scoringStorage = {
  get: () => get<ScoringConfig>(STORAGE_KEY_SCORING, DEFAULT_SCORING),
  set: (config: ScoringConfig) => set(STORAGE_KEY_SCORING, config),
  reset: () => set(STORAGE_KEY_SCORING, DEFAULT_SCORING),
};

// ---------- Vacancies (history) ----------
export const vacanciesStorage = {
  get: () => get<Vacancy[]>(STORAGE_KEY_VACANCIES, []),
  set: (vacancies: Vacancy[]) => set(STORAGE_KEY_VACANCIES, vacancies),

  async upsert(newVacancies: Vacancy[]): Promise<Vacancy[]> {
    const existing = await get<Vacancy[]>(STORAGE_KEY_VACANCIES, []);
    const byId = new Map(existing.map((v) => [v.id, v]));

    for (const v of newVacancies) {
      const prev = byId.get(v.id);
      byId.set(v.id, {
        ...v,
        // Сохраняем пользовательские пометки при повторном парсинге
        status: prev?.status ?? v.status,
        notes: prev?.notes ?? v.notes,
      });
    }

    const merged = [...byId.values()].sort((a, b) => b.score - a.score);
    await set(STORAGE_KEY_VACANCIES, merged);
    return merged;
  },

  async updateStatus(
    id: string,
    status: Vacancy["status"],
  ): Promise<Vacancy[]> {
    const list = await get<Vacancy[]>(STORAGE_KEY_VACANCIES, []);
    const next = list.map((v) => (v.id === id ? { ...v, status } : v));
    await set(STORAGE_KEY_VACANCIES, next);
    return next;
  },

  async clear(): Promise<void> {
    await set(STORAGE_KEY_VACANCIES, []);
  },
};

// ---------- Scan progress ----------
const DEFAULT_PROGRESS: ScanProgress = {
  status: "idle",
  currentPage: 0,
  totalPages: 0,
  totalVacancies: 0,
  relevantCount: 0,
  excludedCount: 0,
  startedAt: null,
  finishedAt: null,
};

export const progressStorage = {
  get: () => get<ScanProgress>(STORAGE_KEY_PROGRESS, DEFAULT_PROGRESS),
  set: (progress: ScanProgress) => set(STORAGE_KEY_PROGRESS, progress),
  reset: () => set(STORAGE_KEY_PROGRESS, DEFAULT_PROGRESS),
};

// ---------- Settings ----------
export const settingsStorage = {
  get: () => get<AppSettings>(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS),
  set: (settings: AppSettings) => set(STORAGE_KEY_SETTINGS, settings),
};
