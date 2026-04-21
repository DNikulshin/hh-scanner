import { useStore } from '../store/useStore';
import clsx from 'clsx';

export function ScanControl() {
  const progress = useStore((s) => s.progress);
  const startScan = useStore((s) => s.startScan);
  const stopScan = useStore((s) => s.stopScan);

  const isScanning = progress?.status === 'scanning';
  const percent =
    progress && progress.totalPages > 0
      ? Math.round(((progress.currentPage + 1) / progress.totalPages) * 100)
      : 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-zinc-100">Сканирование hh.ru</h2>
          <p className="mt-0.5 text-xs text-zinc-400">
            {isScanning && progress
              ? `Страница ${progress.currentPage + 1} / ${progress.totalPages} · найдено ${progress.relevantCount} релевантных`
              : progress?.status === 'done'
              ? `Завершено · ${progress.relevantCount} релевантных из ${progress.totalVacancies}`
              : progress?.status === 'error'
              ? `Ошибка: ${progress.error ?? 'неизвестно'}`
              : 'Готов к запуску'}
          </p>
        </div>

        <button
          onClick={isScanning ? stopScan : startScan}
          className={clsx(
            'rounded-lg px-4 py-2 text-sm font-semibold transition-all',
            isScanning
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          )}
        >
          {isScanning ? 'Остановить' : 'Запустить скан'}
        </button>
      </div>

      {isScanning && (
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
