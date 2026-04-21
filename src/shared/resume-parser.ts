// ============================================================
// RESUME PARSER — извлечение skills из резюме файлов
// ============================================================

import type { ProfileType } from "./types";

export type { ProfileType };

export interface ProfileData {
  type: ProfileType;
  title: string;
  description: string;
  skills: string[];
}

export interface ParsedResumes {
  fullstack: ProfileData;
  devops: ProfileData;
}

// ============================================================
// FULLSTACK DEVELOPER PROFILE
// ============================================================

export const FULLSTACK_PROFILE: ProfileData = {
  type: "fullstack",
  title: "Fullstack-разработчик (Middle+)",
  description:
    "TypeScript, React, Next.js, Node.js, NestJS, Prisma, Docker, CI/CD",
  skills: [
    // Core languages & frameworks
    "typescript",
    "react",
    "next.js",
    "nextjs",
    "node.js",
    "nodejs",
    "nestjs",
    "nest.js",
    "express",
    "fastify",
    "fullstack",
    "full-stack",

    // Backend
    "prisma",
    "postgresql",
    "postgres",
    "typeorm",
    "sequelize",
    "redis",
    "websocket",
    "ws ",
    "socket.io",

    // DevOps & Infra
    "docker",
    "ci/cd",
    "github actions",
    "gitlab ci",
    "circleci",
    "caddy",
    "nginx",
    "cloudflare",

    // Frontend
    "tailwind",
    "shadcn",
    "mui",
    "styled-components",
    "server actions",
    "app router",
    "pwa",
    "expo",
    "react native",

    // Tools & testing
    "vitest",
    "jest",
    "testing library",
    "playwright",
    "tanstack",
    "react query",
    "trpc",
    "graphql",
    "monorepo",
    "turborepo",
    "pnpm",
    "yarn",

    // Languages
    "typescript",
    " ts ",

    // Level indicators
    "middle",
    "middle+",
    "senior",
    "lead",
  ],
};

// ============================================================
// DEVOPS / SYSADMIN PROFILE
// ============================================================

export const DEVOPS_PROFILE: ProfileData = {
  type: "devops",
  title: "DevOps / Системный инженер",
  description:
    "PowerShell, Active Directory, Linux, Docker, Zabbix, Monitoring",
  skills: [
    // Languages & scripting
    "powershell",
    " ps ",
    "python",
    "bash",
    "shell script",
    "golang",
    "go-",
    "rust",

    // Windows & Active Directory
    "active directory",
    "ad ",
    "group policy",
    "gpo",
    "windows server",
    "windows 2008",
    "windows 2012",
    "windows 2016",
    "windows 2019",
    "windows 2022",
    "mssql",
    "sql server",
    "dhcp",
    "dns",
    "file server",
    "print server",

    // Linux & Unix
    "linux",
    "ubuntu",
    "debian",
    "centos",
    "rhel",
    "alpine",
    "unix",
    "systemd",
    "init.d",

    // Infrastructure & DevOps
    "docker",
    "kubernetes",
    "k8s",
    "docker compose",
    "ci/cd",
    "github actions",
    "gitlab ci",
    "jenkins",
    "circleci",
    "terraform",
    "ansible",
    "chef",
    "puppet",
    "openstack",
    "kvm",
    "vmware",
    "hyper-v",

    // Monitoring & Observability
    "zabbix",
    "prometheus",
    "grafana",
    "elasticsearch",
    "kibana",
    "elk stack",
    "splunk",
    "datadog",
    "the dude",
    "nagios",
    "icinga",

    // Cloud platforms
    "aws",
    "azure",
    "gcp",
    "google cloud",
    "yandex cloud",
    "digitalocean",
    "linode",
    "hetzner",

    // Networking
    "tcp/ip",
    "routing",
    "switching",
    "vpn",
    "firewall",
    "nginx",
    "apache",
    "haproxy",
    "caddy",
    "ssl",
    "tls",
    "certificates",
    "let's encrypt",

    // Virtualization
    "vagrant",
    "virtualbox",
    "proxmox",

    // ITSM
    "itsm",
    "itil",
    "servicedesk",
    "ticket system",
    "microsoft 365",
    "office 365",
    "exchange",

    // Tools
    "git",
    "ssh",
    "scp",
    "rsync",
    "nfs",
    "smb",
    "systemctl",
    "cron",
    "scheduled tasks",

    // Level indicators
    "junior devops",
    "devops engineer",
    "system engineer",
    "senior",
    "lead",
  ],
};

// ============================================================
// PUBLIC API
// ============================================================

export const ALL_PROFILES: ParsedResumes = {
  fullstack: FULLSTACK_PROFILE,
  devops: DEVOPS_PROFILE,
};

/**
 * Получить профиль по типу
 */
export function getProfile(type: ProfileType): ProfileData {
  return ALL_PROFILES[type];
}

/**
 * Получить все доступные профили (для UI)
 */
export function getAllProfiles(): {
  type: ProfileType;
  title: string;
  description: string;
}[] {
  return [
    {
      type: "fullstack",
      title: FULLSTACK_PROFILE.title,
      description: FULLSTACK_PROFILE.description,
    },
    {
      type: "devops",
      title: DEVOPS_PROFILE.title,
      description: DEVOPS_PROFILE.description,
    },
  ];
}
