// ============================================================
// SHARED TYPES
// ============================================================

export interface Salary {
  raw: string | null;
  from: number | null;
  to: number | null;
  currency: "RUB" | "USD" | "EUR" | null;
  period: "hour" | "project" | "month" | null;
  gross: "gross" | "net" | null;
}

export type VacancyStatus = "new" | "liked" | "applied" | "hidden";

export interface Vacancy {
  id: string;
  title: string;
  salary: Salary;
  employer: string | null;
  rating: number | null;
  city: string | null;
  tags: string;
  url: string;
  score: number;
  matches: string[];
  excluded: boolean;
  status: VacancyStatus;
  parsedAt: string;
  notes?: string;
}

export interface ScoringGroup {
  label: string;
  weight: number;
  keywords: string[];
}

export interface ScoringConfig {
  core: ScoringGroup;
  related: ScoringGroup;
  nice: ScoringGroup;
  levelPenalty: ScoringGroup;
  seniorPenalty: ScoringGroup;
  hardExclude: string[];
  minScore: number;
}

export interface ScanProgress {
  status: "idle" | "scanning" | "done" | "error";
  currentPage: number;
  totalPages: number;
  totalVacancies: number;
  relevantCount: number;
  excludedCount: number;
  startedAt: string | null;
  finishedAt: string | null;
  error?: string;
}

// Profile types — поддержка нескольких резюме
export type ProfileType = "fullstack" | "devops";

// Message types — связь между service worker / content script / dashboard
export type Message =
  | { type: "SCAN_START"; url: string }
  | { type: "SCAN_STOP" }
  | { type: "SCAN_PROGRESS"; progress: ScanProgress }
  | { type: "PARSE_PAGE"; payload: { page: number } }
  | {
      type: "PARSE_RESULT";
      payload: {
        vacancies: RawVacancy[];
        page: number;
        totalPages: number;
        totalCount: number;
      };
    }
  | { type: "GET_STATE" }
  | { type: "OPEN_DASHBOARD" };

// Raw — то что парсит content script (без скоринга)
export type RawVacancy = Omit<
  Vacancy,
  "score" | "matches" | "excluded" | "status"
>;
