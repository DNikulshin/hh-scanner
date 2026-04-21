import type { ScoringConfig } from './types';

// ============================================================
// DEFAULT SCORING CONFIG — под профиль Никульшина (Middle+ Fullstack)
// TypeScript / React / Next.js / Node.js / NestJS / Prisma / Docker
// ============================================================

export const DEFAULT_SCORING: ScoringConfig = {
  core: {
    label: 'Core stack',
    weight: 10,
    keywords: [
      'typescript', ' ts ', ' ts,', ' ts/',
      'react', 'next.js', 'nextjs', 'next js',
      'node.js', 'nodejs', 'node js',
      'nestjs', 'nest.js', 'fastify', 'express',
      'fullstack', 'full-stack', 'full stack',
    ],
  },
  related: {
    label: 'Related stack',
    weight: 5,
    keywords: [
      'prisma', 'postgresql', 'postgres',
      'docker', 'ci/cd', 'github actions',
      'redis', 'websocket',
      'tanstack', 'react query',
      'vitest', 'jest',
      'pwa', 'expo', 'react native',
      'server actions', 'app router',
    ],
  },
  nice: {
    label: 'Nice-to-have',
    weight: 2,
    keywords: [
      'caddy', 'nginx', 'cloudflare',
      'monorepo', 'turborepo',
      'zod', 'trpc', 'graphql',
      'tailwind', 'shadcn',
      'middle', 'middle+',
    ],
  },
  levelPenalty: {
    label: 'Junior penalty',
    weight: -3,
    keywords: [
      'junior', 'стажёр', 'стажер', 'стажировка',
      'практикант', 'без опыта',
    ],
  },
  seniorPenalty: {
    label: 'Senior soft penalty',
    weight: -1,
    keywords: [
      'senior', 'lead ', 'team lead', 'tech lead', 'архитектор',
    ],
  },
  hardExclude: [
    // Российские enterprise-стеки
    '1с', '1c', 'битрикс', 'bitrix', 'abap', 'sap ', 'цфт', 'dwh ',
    // CMS
    'wordpress', 'tilda', 'joomla', 'drupal', 'modx',
    // Чужие языки
    'php', 'php-', ' php ',
    'java-', 'java ', 'kotlin', 'swift', 'flutter',
    'golang', 'go-разработчик', 'go разработчик',
    'ruby', 'c#', '.net', 'dotnet', 'delphi', 'pascal',
    'lua', 'elixir', 'erlang',
    // Embedded / hardware
    'stm32', 'схемотехник', 'электроник', 'микроконтроллер',
    // Не IT
    'химик', 'прораб', 'сметчик', 'геодезист',
    // Gamedev (если не нужен)
    'unity', 'unreal', 'gamedev',
    // QA (не цель)
    ' qa ', 'qa-', 'sdet', 'тестировщик нейросет',
  ],
  minScore: 5,
};

export const STORAGE_KEY_SCORING = 'scoringConfig';
export const STORAGE_KEY_VACANCIES = 'vacancies';
export const STORAGE_KEY_PROGRESS = 'scanProgress';
export const STORAGE_KEY_SETTINGS = 'settings';

export const TARGET_URL =
  'https://hh.ru/search/vacancy?employment=project&schedule=remote&text=TypeScript+OR+React+OR+Node.js+OR+Next.js+OR+разработчик';
