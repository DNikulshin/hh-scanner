import type { ScoringConfig, ProfileType } from "./types";
import { getScoringConfigByProfile } from "./constants";

// ============================================================
// SCORING ENGINE
// ============================================================

export interface ScoreResult {
  score: number;
  matches: string[];
  excluded: boolean;
}

export function calcScore(
  title: string,
  tags: string,
  config: ScoringConfig,
): ScoreResult {
  const text = `${title} ${tags}`.toLowerCase();

  // Жёсткие исключения — сразу сигналим
  if (config.hardExclude.some((kw) => text.includes(kw))) {
    return { score: -999, matches: [], excluded: true };
  }

  let score = 0;
  const matches: string[] = [];

  const groups = [
    config.core,
    config.related,
    config.nice,
    config.levelPenalty,
    config.seniorPenalty,
  ];

  for (const group of groups) {
    for (const kw of group.keywords) {
      if (text.includes(kw)) {
        score += group.weight;
        const sign = group.weight > 0 ? "+" : "";
        matches.push(`${group.label}:${kw.trim()}(${sign}${group.weight})`);
      }
    }
  }

  return { score, matches, excluded: false };
}

export function scoreVacancy<T extends { title: string; tags: string }>(
  raw: T,
  config: ScoringConfig,
): T & ScoreResult {
  const result = calcScore(raw.title, raw.tags, config);
  return { ...raw, ...result };
}

/**
 * Скоринг вакансии с выбором профиля
 */
export function scoreVacancyWithProfile<
  T extends { title: string; tags: string },
>(raw: T, profileType: ProfileType): T & ScoreResult {
  const config = getScoringConfigByProfile(profileType);
  return scoreVacancy(raw, config);
}
