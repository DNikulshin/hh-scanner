import type { Vacancy } from '@shared/types';
import { formatSalary, formatRelativeTime, scoreColor } from '../lib/format';
import { useStore } from '../store/useStore';
import clsx from 'clsx';

interface VacancyCardProps {
  vacancy: Vacancy;
}

const STATUS_BTN = {
  liked:   { icon: '❤', label: 'Нравится', active: 'bg-rose-500/20 text-rose-300 ring-rose-500/40' },
  applied: { icon: '✓', label: 'Откликнулся', active: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/40' },
  hidden:  { icon: '✕', label: 'Скрыть', active: 'bg-zinc-500/20 text-zinc-400 ring-zinc-500/40' },
} as const;

export function VacancyCard({ vacancy }: VacancyCardProps) {
  const updateStatus = useStore((s) => s.updateStatus);

  const toggle = (status: keyof typeof STATUS_BTN) => {
    updateStatus(vacancy.id, vacancy.status === status ? 'new' : status);
  };

  return (
    <article
      className={clsx(
        'group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-all',
        'hover:border-zinc-700 hover:bg-zinc-900/70',
        vacancy.status === 'hidden' && 'opacity-40'
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <a
            href={vacancy.url}
            target="_blank"
            rel="noreferrer"
            className="block text-base font-semibold text-zinc-100 hover:text-brand-500"
          >
            {vacancy.title}
          </a>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
            {vacancy.employer && <span className="font-medium">{vacancy.employer}</span>}
            {vacancy.rating !== null && (
              <span className="inline-flex items-center gap-1">
                <span className="text-amber-400">★</span>
                <span>{vacancy.rating.toFixed(1)}</span>
              </span>
            )}
            {vacancy.city && <span>{vacancy.city}</span>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={clsx('font-mono text-lg font-bold', scoreColor(vacancy.score))}>
            {vacancy.score > 0 ? '+' : ''}
            {vacancy.score}
          </div>
          <div className="text-sm font-medium text-zinc-300">{formatSalary(vacancy.salary)}</div>
        </div>
      </header>

      {/* Tags */}
      {vacancy.tags && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {vacancy.tags.split(' | ').map((tag, i) => (
            <span
              key={i}
              className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Matches */}
      {vacancy.matches.length > 0 && (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300">
            Совпадения стека ({vacancy.matches.length})
          </summary>
          <div className="mt-2 flex flex-wrap gap-1">
            {vacancy.matches.map((m, i) => (
              <span
                key={i}
                className="rounded bg-zinc-800/70 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
              >
                {m}
              </span>
            ))}
          </div>
        </details>
      )}

      {/* Footer actions */}
      <footer className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-3">
        <time className="text-xs text-zinc-500">{formatRelativeTime(vacancy.parsedAt)}</time>

        <div className="flex gap-1.5">
          {(Object.keys(STATUS_BTN) as Array<keyof typeof STATUS_BTN>).map((key) => {
            const cfg = STATUS_BTN[key];
            const isActive = vacancy.status === key;
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-all',
                  isActive
                    ? cfg.active
                    : 'bg-zinc-800/50 text-zinc-400 ring-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200'
                )}
              >
                <span className="mr-1">{cfg.icon}</span>
                {cfg.label}
              </button>
            );
          })}
        </div>
      </footer>
    </article>
  );
}
