import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { ScanControl } from './components/ScanControl';
import { FilterBar } from './components/FilterBar';
import { VacancyList } from './components/VacancyList';
import { ScoringSettings } from './components/ScoringSettings';

export function App() {
  const init = useStore((s) => s.init);
  const setShowSettings = useStore((s) => s.setShowSettings);
  const clearAll = useStore((s) => s.clearAll);
  const vacancies = useStore((s) => s.vacancies);

  useEffect(() => {
    init();
  }, [init]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(vacancies, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hh-vacancies-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    if (!confirm('Удалить все сохранённые вакансии? Это действие необратимо.')) return;
    await clearAll();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white">
              HH
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">HH Scanner</h1>
              <p className="text-xs text-zinc-500">Умный фильтр вакансий</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={vacancies.length === 0}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900 disabled:opacity-40"
              title="Экспорт в JSON"
            >
              ⇣ Экспорт
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
              title="Настройки скоринга"
            >
              ⚙ Скоринг
            </button>
            <button
              onClick={handleClear}
              disabled={vacancies.length === 0}
              className="rounded-lg border border-rose-900/40 px-3 py-1.5 text-sm text-rose-300 hover:bg-rose-950/30 disabled:opacity-40"
            >
              🗑 Очистить
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl space-y-5 px-6 py-6">
        <ScanControl />
        <FilterBar />
        <VacancyList />
      </main>

      {/* Scoring settings modal */}
      <ScoringSettings />
    </div>
  );
}
