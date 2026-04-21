import type { ScoringConfig, ProfileType } from "./types";

// ============================================================
// SCORING CONFIGS FOR PROFILES
// ============================================================

/**
 * FULLSTACK PROFILE — Middle+ Fullstack Developer
 * TypeScript / React / Next.js / Node.js / NestJS / Prisma / Docker
 */
export const FULLSTACK_SCORING: ScoringConfig = {
  core: {
    label: "Core stack",
    weight: 10,
    keywords: [
      "typescript",
      " ts ",
      " ts,",
      " ts/",
      "react",
      "next.js",
      "nextjs",
      "next js",
      "node.js",
      "nodejs",
      "node js",
      "nestjs",
      "nest.js",
      "fastify",
      "express",
      "fullstack",
      "full-stack",
      "full stack",
    ],
  },
  related: {
    label: "Related stack",
    weight: 5,
    keywords: [
      "prisma",
      "postgresql",
      "postgres",
      "docker",
      "ci/cd",
      "github actions",
      "redis",
      "websocket",
      "tanstack",
      "react query",
      "vitest",
      "jest",
      "pwa",
      "expo",
      "react native",
      "server actions",
      "app router",
    ],
  },
  nice: {
    label: "Nice-to-have",
    weight: 2,
    keywords: [
      "caddy",
      "nginx",
      "cloudflare",
      "monorepo",
      "turborepo",
      "zod",
      "trpc",
      "graphql",
      "tailwind",
      "shadcn",
      "middle",
      "middle+",
    ],
  },
  levelPenalty: {
    label: "Junior penalty",
    weight: -3,
    keywords: [
      "junior",
      "стажёр",
      "стажер",
      "стажировка",
      "практикант",
      "без опыта",
    ],
  },
  seniorPenalty: {
    label: "Senior soft penalty",
    weight: -1,
    keywords: ["senior", "lead ", "team lead", "tech lead", "архитектор"],
  },
  hardExclude: [
    // Российские enterprise-стеки
    "1с",
    "1c",
    "битрикс",
    "bitrix",
    "abap",
    "sap ",
    "цфт",
    "dwh ",
    // CMS
    "wordpress",
    "tilda",
    "joomla",
    "drupal",
    "modx",
    // Чужие языки
    "php",
    "php-",
    " php ",
    "java-",
    "java ",
    "kotlin",
    "swift",
    "flutter",
    "golang",
    "go-разработчик",
    "go разработчик",
    "ruby",
    "c#",
    ".net",
    "dotnet",
    "delphi",
    "pascal",
    "lua",
    "elixir",
    "erlang",
    // Embedded / hardware
    "stm32",
    "схемотехник",
    "электроник",
    "микроконтроллер",
    // Не IT
    "химик",
    "прораб",
    "сметчик",
    "геодезист",
    // Gamedev (если не нужен)
    "unity",
    "unreal",
    "gamedev",
    // QA (не цель)
    " qa ",
    "qa-",
    "sdet",
    "тестировщик нейросет",
  ],
  minScore: 5,
};

/**
 * DEVOPS PROFILE — System Administrator / DevOps Engineer
 * PowerShell / Active Directory / Linux / Docker / Zabbix / Monitoring
 */
export const DEVOPS_SCORING: ScoringConfig = {
  core: {
    label: "Core stack",
    weight: 10,
    keywords: [
      "powershell",
      "active directory",
      "linux",
      "docker",
      "devops",
      "devops-",
      "devops engineer",
      "администр",
      "админист",
      "system admin",
      "sysadmin",
      "system engineer",
      "инженер",
      "kubernetes",
      "k8s",
    ],
  },
  related: {
    label: "Related stack",
    weight: 5,
    keywords: [
      // Windows & AD
      "windows server",
      "windows 2016",
      "windows 2019",
      "windows 2022",
      "active directory",
      "gpo",
      "group policy",
      "dhcp",
      "dns",
      "mssql",
      "sql server",

      // Linux
      "ubuntu",
      "debian",
      "centos",
      "rhel",
      "alpine",
      "bash",
      "shell script",
      "python",

      // Infrastructure
      "docker",
      "docker compose",
      "ci/cd",
      "github actions",
      "gitlab ci",
      "jenkins",
      "terraform",
      "ansible",
      "chef",
      "nginx",
      "apache",
      "haproxy",

      // Monitoring
      "zabbix",
      "prometheus",
      "grafana",
      "monitoring",
      "elasticsearch",
      "elk",
      "splunk",
      "datadog",

      // Cloud
      "aws",
      "azure",
      "gcp",
      "yandex cloud",
    ],
  },
  nice: {
    label: "Nice-to-have",
    weight: 2,
    keywords: [
      "openstack",
      "kvm",
      "vmware",
      "hyper-v",
      "vagrant",
      "virtualbox",
      "proxmox",
      "ssl",
      "tls",
      "certificates",
      "let's encrypt",
      "itsm",
      "itil",
      "servicedesk",
      "monitoring",
      "alerting",
      "rust",
      "go",
      "golang",
      "микросервисы",
      "microservices",
    ],
  },
  levelPenalty: {
    label: "Junior penalty",
    weight: -3,
    keywords: [
      "junior",
      "стажёр",
      "стажер",
      "стажировка",
      "практикант",
      "без опыта",
      "helpdesk",
    ],
  },
  seniorPenalty: {
    label: "Senior soft penalty",
    weight: -1,
    keywords: [
      "senior",
      "lead ",
      "team lead",
      "tech lead",
      "архитектор",
      "principal",
      "staff",
    ],
  },
  hardExclude: [
    // Языки не в сфере DevOps
    "php",
    "php-",
    " php ",
    "java-",
    "java ",
    "kotlin",
    "swift",
    "flutter",
    "c#",
    ".net",
    "dotnet",
    "ruby",
    "delphi",
    "pascal",
    "lua",
    "elixir",
    "erlang",

    // Embedded / hardware
    "stm32",
    "схемотехник",
    "электроник",
    "микроконтроллер",

    // Не IT
    "химик",
    "прораб",
    "сметчик",
    "геодезист",

    // Gamedev
    "unity",
    "unreal",
    "gamedev",

    // QA
    " qa ",
    "qa-",
    "sdet",
    "тестировщик",

    // CMS
    "wordpress",
    "1с",
    "bitrix",
    "bitrix24",
  ],
  minScore: 5,
};

/**
 * Получить конфиг скорирования по типу профиля
 */
export function getScoringConfigByProfile(
  profileType: ProfileType,
): ScoringConfig {
  switch (profileType) {
    case "fullstack":
      return FULLSTACK_SCORING;
    case "devops":
      return DEVOPS_SCORING;
    default:
      return FULLSTACK_SCORING;
  }
}

// ============================================================
// BACKWARDS COMPATIBILITY
// ============================================================
export const DEFAULT_SCORING: ScoringConfig = FULLSTACK_SCORING;

export const STORAGE_KEY_SCORING = "scoringConfig";
export const STORAGE_KEY_VACANCIES = "vacancies";
export const STORAGE_KEY_PROGRESS = "scanProgress";
export const STORAGE_KEY_SETTINGS = "settings";

export const TARGET_URL =
  "https://hh.ru/search/vacancy?employment=project&schedule=remote&text=TypeScript+OR+React+OR+Node.js+OR+Next.js+OR+разработчик";
