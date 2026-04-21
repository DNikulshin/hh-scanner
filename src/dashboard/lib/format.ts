import type { Salary } from '@shared/types';

export function formatSalary(salary: Salary): string {
  if (!salary.raw) return '—';
  if (salary.from === null && salary.to === null) return salary.raw;

  const curSymbol = salary.currency === 'USD' ? '$' : salary.currency === 'EUR' ? '€' : '₽';
  const periodLabel =
    salary.period === 'hour' ? '/ч' : salary.period === 'project' ? '/проект' : '/мес';
  const grossLabel = salary.gross === 'gross' ? ' gross' : '';

  const fmt = (n: number) => n.toLocaleString('ru-RU');

  if (salary.from && salary.to) {
    return `${fmt(salary.from)}–${fmt(salary.to)} ${curSymbol}${periodLabel}${grossLabel}`;
  }
  if (salary.from) return `от ${fmt(salary.from)} ${curSymbol}${periodLabel}${grossLabel}`;
  if (salary.to) return `до ${fmt(salary.to)} ${curSymbol}${periodLabel}${grossLabel}`;
  return salary.raw;
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  if (hours < 24) return `${hours} ч назад`;
  if (days < 7) return `${days} дн назад`;
  return date.toLocaleDateString('ru-RU');
}

export function scoreColor(score: number): string {
  if (score >= 30) return 'text-emerald-400';
  if (score >= 20) return 'text-green-400';
  if (score >= 10) return 'text-yellow-400';
  if (score >= 5) return 'text-orange-400';
  return 'text-zinc-400';
}
