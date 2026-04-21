import { create } from "zustand";
import {
  scoringStorage,
  vacanciesStorage,
  progressStorage,
  settingsStorage,
  type AppSettings,
} from "@shared/storage";
import {
  getScoringConfigByProfile,
  STORAGE_KEY_PROGRESS,
  STORAGE_KEY_VACANCIES,
  STORAGE_KEY_SETTINGS,
  STORAGE_KEY_SCORING,
} from "@shared/constants";
import { scoreVacancyWithProfile } from "@shared/scoring";
import type {
  Vacancy,
  ScoringConfig,
  ScanProgress,
  VacancyStatus,
  ProfileType,
} from "@shared/types";

// ============================================================
// DASHBOARD STORE (Zustand)
// ============================================================

export type StatusFilter = "all" | "new" | "liked" | "applied" | "hidden";
export type SortMode = "score" | "salary" | "rating" | "recent";

interface DashboardState {
  // Data
  vacancies: Vacancy[];
  scoring: ScoringConfig | null;
  progress: ScanProgress | null;
  settings: AppSettings | null;

  // UI state
  statusFilter: StatusFilter;
  sortMode: SortMode;
  searchQuery: string;
  minSalary: number;
  showSettings: boolean;

  // Actions
  init: () => Promise<void>;
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  updateStatus: (id: string, status: VacancyStatus) => Promise<void>;
  updateScoring: (scoring: ScoringConfig) => Promise<void>;
  resetScoring: () => Promise<void>;
  setActiveProfile: (profile: ProfileType) => Promise<void>;
  updateProfileUrl: (profile: ProfileType, url: string) => Promise<void>;
  clearAll: () => Promise<void>;

  setStatusFilter: (f: StatusFilter) => void;
  setSortMode: (m: SortMode) => void;
  setSearchQuery: (q: string) => void;
  setMinSalary: (n: number) => void;
  setShowSettings: (v: boolean) => void;
}

export const useStore = create<DashboardState>((set, get) => ({
  vacancies: [],
  scoring: null,
  progress: null,
  settings: null,

  statusFilter: "all",
  sortMode: "score",
  searchQuery: "",
  minSalary: 0,
  showSettings: false,

  async init() {
    const [vacancies, scoring, progress, settings] = await Promise.all([
      vacanciesStorage.get(),
      scoringStorage.get(),
      progressStorage.get(),
      settingsStorage.get(),
    ]);
    set({ vacancies, scoring, progress, settings });

    // Subscribe to storage changes — обновляемся в реальном времени во время скана
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      if (changes[STORAGE_KEY_VACANCIES]) {
        set({ vacancies: changes[STORAGE_KEY_VACANCIES].newValue ?? [] });
      }
      if (changes[STORAGE_KEY_PROGRESS]) {
        set({ progress: changes[STORAGE_KEY_PROGRESS].newValue });
      }
      if (changes[STORAGE_KEY_SETTINGS]) {
        set({ settings: changes[STORAGE_KEY_SETTINGS].newValue });
      }
      if (changes[STORAGE_KEY_SCORING]) {
        set({ scoring: changes[STORAGE_KEY_SCORING].newValue });
      }
    });
  },

  async startScan() {
    const { settings } = get();
    if (!settings) return;
    await chrome.runtime.sendMessage({
      type: "SCAN_START",
      url: settings.targetUrl,
    });
  },

  async stopScan() {
    await chrome.runtime.sendMessage({ type: "SCAN_STOP" });
  },

  async updateStatus(id, status) {
    const next = await vacanciesStorage.updateStatus(id, status);
    set({ vacancies: next });
  },

  async updateScoring(scoring) {
    await scoringStorage.set(scoring);
    set({ scoring });
  },

  async resetScoring() {
    await scoringStorage.reset();
    const scoring = await scoringStorage.get();
    set({ scoring });
  },

  async setActiveProfile(profile: ProfileType) {
    const current = await settingsStorage.get();
    const updated: AppSettings = {
      ...current,
      activeProfile: profile,
      targetUrl: current.profileUrls[profile],
    };
    await settingsStorage.set(updated);

    const config = getScoringConfigByProfile(profile);
    await scoringStorage.set(config);

    // Пересчитываем скоринг для уже сохранённых вакансий под новый профиль.
    // Прячем те, что стали excluded или упали ниже minScore, помечая их как hidden,
    // чтобы история не терялась, но из списка по умолчанию они ушли.
    const existing = await vacanciesStorage.get();
    const rescored: Vacancy[] = existing.map((v) => {
      const result = scoreVacancyWithProfile(v, profile);
      const stillRelevant = !result.excluded && result.score >= config.minScore;
      return {
        ...v,
        score: result.score,
        matches: result.matches,
        excluded: result.excluded,
        status: stillRelevant ? v.status : "hidden",
      };
    });
    await vacanciesStorage.set(rescored);

    set({ settings: updated, scoring: config, vacancies: rescored });
  },

  async updateProfileUrl(profile: ProfileType, url: string) {
    const current = await settingsStorage.get();
    const profileUrls = { ...current.profileUrls, [profile]: url };
    const updated: AppSettings = {
      ...current,
      profileUrls,
      // Если редактируем URL активного профиля — синхронизируем targetUrl.
      targetUrl:
        profile === current.activeProfile ? url : current.targetUrl,
    };
    await settingsStorage.set(updated);
    set({ settings: updated });
  },

  async clearAll() {
    await vacanciesStorage.clear();
    await progressStorage.reset();
    set({ vacancies: [], progress: await progressStorage.get() });
  },

  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSortMode: (sortMode) => set({ sortMode }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setMinSalary: (minSalary) => set({ minSalary }),
  setShowSettings: (showSettings) => set({ showSettings }),
}));

// ---------- Selectors ----------

function salaryToMonthlyRub(v: Vacancy): number {
  const { from, to, currency, period } = v.salary;
  const amount = to ?? from ?? 0;
  if (!amount) return 0;

  // Простое приведение в RUB/месяц для сортировки
  const rate = currency === "USD" ? 90 : currency === "EUR" ? 100 : 1;
  const multiplier = period === "hour" ? 160 : period === "project" ? 1 : 1;
  return amount * rate * multiplier;
}

export function selectVisibleVacancies(state: DashboardState): Vacancy[] {
  let list = state.vacancies.filter((v) => !v.excluded);

  if (state.statusFilter !== "all") {
    list = list.filter((v) => v.status === state.statusFilter);
  } else {
    // По умолчанию скрываем "hidden"
    list = list.filter((v) => v.status !== "hidden");
  }

  if (state.searchQuery.trim()) {
    const q = state.searchQuery.trim().toLowerCase();
    list = list.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        (v.employer ?? "").toLowerCase().includes(q) ||
        v.tags.toLowerCase().includes(q),
    );
  }

  if (state.minSalary > 0) {
    list = list.filter((v) => salaryToMonthlyRub(v) >= state.minSalary);
  }

  list = [...list].sort((a, b) => {
    switch (state.sortMode) {
      case "score":
        return b.score - a.score;
      case "salary":
        return salaryToMonthlyRub(b) - salaryToMonthlyRub(a);
      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);
      case "recent":
        return new Date(b.parsedAt).getTime() - new Date(a.parsedAt).getTime();
    }
  });

  return list;
}
