import { useEffect, useState } from 'react';
import { vacanciesStorage, progressStorage, settingsStorage } from '@shared/storage';
import type { Vacancy, ScanProgress } from '@shared/types';
import { STORAGE_KEY_VACANCIES, STORAGE_KEY_PROGRESS } from '@shared/constants';

export function Popup() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [progress, setProgress] = useState<ScanProgress | null>(null);

  useEffect(() => {
    vacanciesStorage.get().then(setVacancies);
    progressStorage.get().then(setProgress);

    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string
    ) => {
      if (area !== 'local') return;
      if (changes[STORAGE_KEY_VACANCIES]) {
        setVacancies(changes[STORAGE_KEY_VACANCIES].newValue ?? []);
      }
      if (changes[STORAGE_KEY_PROGRESS]) {
        setProgress(changes[STORAGE_KEY_PROGRESS].newValue ?? null);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const isScanning = progress?.status === 'scanning';

  const openDashboard = () => {
    chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    window.close();
  };

  const startScan = async () => {
    const settings = await settingsStorage.get();
    chrome.runtime.sendMessage({ type: 'SCAN_START', url: settings.targetUrl });
  };

  const stopScan = () => {
    chrome.runtime.sendMessage({ type: 'SCAN_STOP' });
  };

  const newCount = vacancies.filter((v) => v.status === 'new').length;
  const likedCount = vacancies.filter((v) => v.status === 'liked').length;
  const appliedCount = vacancies.filter((v) => v.status === 'applied').length;

  return (
    <div className="flex w-80 flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="flex items-center gap-2.5 border-b border-zinc-800 px-4 py-3">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold">
          HH
        </div>
        <div>
          <div className="text-sm font-bold leading-tight">HH Scanner</div>
          <div className="text-[10px] text-zinc-500">Умный фильтр вакансий</div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 border-b border-zinc-800 p-3">
        <Stat label="Новых" value={newCount} color="text-zinc-100" />
        <Stat label="❤ Нравятся" value={likedCount} color="text-rose-400" />
        <Stat label="✓ Отклик" value={appliedCount} color="text-emerald-400" />
      </div>

      {/* Scan control */}
      <div className="border-b border-zinc-800 p-3">
        {isScanning && progress && (
          <div className="mb-3">
            <div className="mb-1.5 flex justify-between text-xs text-zinc-400">
              <span>
                Страница {progress.currentPage + 1} / {progress.totalPages}
              </span>
              <span>{progress.relevantCount} найдено</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-brand-600 transition-all duration-500"
                style={{
                  width: `${
                    progress.totalPages
                      ? ((progress.currentPage + 1) / progress.totalPages) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        <button
          onClick={isScanning ? stopScan : startScan}
          className={`w-full rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
            isScanning
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
        >
          {isScanning ? '⏹ Остановить' : '▶ Запустить скан'}
        </button>
      </div>

      {/* Dashboard link */}
      <button
        onClick={openDashboard}
        className="flex items-center justify-between px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-900"
      >
        <span>Открыть Dashboard</span>
        <span className="text-zinc-500">→</span>
      </button>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-zinc-900/60 p-2 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-zinc-500">{label}</div>
    </div>
  );
}
