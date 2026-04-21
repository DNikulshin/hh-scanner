import { useStore, type StatusFilter, type SortMode } from '../store/useStore';
import clsx from 'clsx';

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string; icon: string }> = [
  { value: 'all',     label: 'Все',           icon: '▪' },
  { value: 'new',     label: 'Новые',         icon: '✦' },
  { value: 'liked',   label: 'Понравились',   icon: '❤' },
  { value: 'applied', label: 'Откликнулся',   icon: '✓' },
  { value: 'hidden',  label: 'Скрытые',       icon: '✕' },
];

const SORT_MODES: Array<{ value: SortMode; label: string }> = [
  { value: 'score',  label: 'По релевантности' },
  { value: 'salary', label: 'По зарплате' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'recent', label: 'По дате' },
];

export function FilterBar() {
  const statusFilter = useStore((s) => s.statusFilter);
  const sortMode = useStore((s) => s.sortMode);
  const searchQuery = useStore((s) => s.searchQuery);
  const minSalary = useStore((s) => s.minSalary);
  const vacancies = useStore((s) => s.vacancies);
  const setStatusFilter = useStore((s) => s.setStatusFilter);
  const setSortMode = useStore((s) => s.setSortMode);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const setMinSalary = useStore((s) => s.setMinSalary);

  const counts = STATUS_FILTERS.reduce<Record<StatusFilter, number>>((acc, f) => {
    if (f.value === 'all') acc[f.value] = vacancies.filter((v) => !v.excluded).length;
    else acc[f.value] = vacancies.filter((v) => !v.excluded && v.status === f.value).length;
    return acc;
  }, {} as Record<StatusFilter, number>);

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={clsx(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
              statusFilter === f.value
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800'
            )}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
            <span
              className={clsx(
                'rounded-full px-1.5 text-[11px] font-semibold',
                statusFilter === f.value ? 'bg-white/20 text-white' : 'bg-zinc-900/80 text-zinc-400'
              )}
            >
              {counts[f.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + sort + salary */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию, компании, тегам…"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-600 focus:outline-none"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            ⌕
          </span>
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <span>Мин. ₽/мес:</span>
          <input
            type="number"
            value={minSalary || ''}
            onChange={(e) => setMinSalary(parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            step="10000"
            className="w-28 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-2 text-sm text-zinc-100 focus:border-brand-600 focus:outline-none"
          />
        </label>

        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-brand-600 focus:outline-none"
        >
          {SORT_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
